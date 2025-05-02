import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Logger } from './index.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

export interface LeetcodeProblem {
    id?: number;
    title: string;
    difficulty: string;
    url: string;
    date: string;
}

export class DatabaseService {
    private db: Database | null = null;
    private static instance: DatabaseService;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    /**
     * Initialize the database connection
     */
    public async initialize(): Promise<void> {
        try {
            this.db = await open({
                filename: './data/leetcode.db',
                driver: sqlite3.Database
            });

            await this.setupTables();
            Logger.info(Logs.info.databaseConnected);
        } catch (error) {
            Logger.error(Logs.error.databaseConnectionFailed, error);
            throw error;
        }
    }

    /**
     * Create necessary tables if they don't exist
     */
    private async setupTables(): Promise<void> {
        if (!this.db) return;

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS leetcode_problems (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                url TEXT NOT NULL,
                date DATE NOT NULL
            )
        `);
    }

    /**
     * Get today's LeetCode problems
     */
    public async getTodayProblems(): Promise<LeetcodeProblem[]> {
        if (!this.db) {
            throw new Error(Logs.error.databaseNotInitialized);
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        try {
            const problems = await this.db.all<LeetcodeProblem[]>(
                'SELECT * FROM leetcode_problems WHERE date = ?',
                today
            );
            
            return problems || [];
        } catch (error) {
            Logger.error(Logs.error.databaseQuery, error);
            throw error;
        }
    }

    /**
     * Format problems into embed template variables
     */
    public formatProblemsForEmbed(problems: LeetcodeProblem[]): Record<string, string> {
        const easy = problems.filter(p => p.difficulty === 'Easy');
        const medium = problems.filter(p => p.difficulty === 'Medium');
        const hard = problems.filter(p => p.difficulty === 'Hard');

        const formatProblemLinks = (probs: LeetcodeProblem[]): string => {
            if (probs.length === 0) return 'No problems available';
            return probs.map(p => `[${p.title}](${p.url})`).join('\n');
        };

        return {
            PROBLEMS_TEXT: problems.length > 0 
                ? `Found ${problems.length} problems for today.` 
                : 'No problems found for today.',
            EASY_PROBLEMS: formatProblemLinks(easy),
            MEDIUM_PROBLEMS: formatProblemLinks(medium),
            HARD_PROBLEMS: formatProblemLinks(hard)
        };
    }

    /**
     * Mock data insertion - this would typically be done by another process or API
     * This is just for demonstration purposes
     */
    public async insertMockData(): Promise<void> {
        if (!this.db) {
            throw new Error(Logs.error.databaseNotInitialized);
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Check if we already have problems for today
        const existing = await this.db.get(
            'SELECT COUNT(*) as count FROM leetcode_problems WHERE date = ?',
            today
        );

        // Don't insert if we already have data for today
        if (existing && existing.count > 0) {
            return;
        }

        // Mock data for today
        const mockProblems = [
            {
                title: 'Two Sum',
                difficulty: 'Easy',
                url: 'https://leetcode.com/problems/two-sum/',
                date: today
            },
            {
                title: 'Best Time to Buy and Sell Stock',
                difficulty: 'Easy',
                url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
                date: today
            },
            {
                title: 'Add Two Numbers',
                difficulty: 'Medium',
                url: 'https://leetcode.com/problems/add-two-numbers/',
                date: today
            },
            {
                title: 'Longest Substring Without Repeating Characters',
                difficulty: 'Medium',
                url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
                date: today
            },
            {
                title: 'Median of Two Sorted Arrays',
                difficulty: 'Hard',
                url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
                date: today
            }
        ];

        // Insert mock data
        const stmt = await this.db.prepare(
            'INSERT INTO leetcode_problems (title, difficulty, url, date) VALUES (?, ?, ?, ?)'
        );
        
        for (const problem of mockProblems) {
            await stmt.run(problem.title, problem.difficulty, problem.url, problem.date);
        }
        
        await stmt.finalize();
        Logger.info(Logs.info.mockDataInserted);
    }

    /**
     * Close the database connection
     */
    public async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
            Logger.info(Logs.info.databaseClosed);
        }
    }
}