import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import axios from 'axios';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let Logs = require('../../../lang/logs.json');

// GraphQL query to fetch problem list
const PROBLEM_QUERY = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      acRate
      difficulty
      frontendQuestionId: questionFrontendId
      paidOnly: isPaidOnly
      title
      titleSlug
      topicTags {
        name
      }
    }
  }
}`;

// Define types for GraphQL response
interface ProblemTag {
  name: string;
}

interface Problem {
  acRate: number;
  difficulty: string;
  frontendQuestionId: string;
  paidOnly: boolean;
  title: string;
  titleSlug: string;
  topicTags: ProblemTag[];
}

interface ProblemListResponse {
  data: {
    problemsetQuestionList: {
      total: number;
      questions: Problem[];
    }
  }
}

export class ProblemCommand implements Command {
    public names = [Lang.getRef('chatCommands.problem', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = [];
    
    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        try {
            // Get optional difficulty from command if provided
            const difficulty = intr.options.getString('difficulty')?.toLowerCase();
            
            // Fetch a random problem
            const problem = await this.getRandomProblem(difficulty);
            
            if (!problem) {
                await InteractionUtils.send(intr, Lang.getEmbed('errorEmbeds.problemNotFound', data.lang));
                return;
            }
            
            // Format problem data for the embed
            const problemData = {
                PROBLEM_ID: problem.frontendQuestionId,
                PROBLEM_TITLE: problem.title,
                PROBLEM_DIFFICULTY: problem.difficulty,
                PROBLEM_ACCEPTANCE: `${problem.acRate.toFixed(1)}%`,
                PROBLEM_URL: `https://leetcode.com/problems/${problem.titleSlug}/`,
                PROBLEM_TAGS: problem.topicTags.map(tag => tag.name).join(', '),
                PROBLEM_PREMIUM: problem.paidOnly ? '(Premium)' : '',
            };
            
            // Send response using the lang system
            await InteractionUtils.send(intr, Lang.getEmbed('displayEmbeds.problem', data.lang, problemData));
        } catch (error) {
            Logger.error(Logs.error.problemCommand, error);
            await InteractionUtils.send(intr, Lang.getEmbed('errorEmbeds.command', data.lang, {
                ERROR_CODE: 'API_ERROR',
                GUILD_ID: intr.guild?.id ?? 'DM',
                SHARD_ID: String(intr.guild?.shardId) ?? '',
            }));
        }
    }
    
    private async getRandomProblem(difficulty?: string): Promise<Problem | null> {
        try {
            // Build filters object for GraphQL query
            const filters: any = {};
            if (difficulty) {
                filters.difficulty = difficulty.toUpperCase();
            }
            
            // Fetch total count first to know the range
            const countResponse = await axios.post<ProblemListResponse>('https://leetcode.com/graphql/', {
                query: PROBLEM_QUERY,
                variables: {
                    categorySlug: "",
                    skip: 0,
                    limit: 1,
                    filters: filters
                }
            });
            
            const totalProblems = countResponse.data.data.problemsetQuestionList.total;
            
            if (totalProblems === 0) {
                return null;
            }
            
            // Generate random skip value
            const randomSkip = Math.floor(Math.random() * totalProblems);
            
            // Fetch a single random problem
            const response = await axios.post<ProblemListResponse>('https://leetcode.com/graphql/', {
                query: PROBLEM_QUERY,
                variables: {
                    categorySlug: "",
                    skip: randomSkip,
                    limit: 1,
                    filters: filters
                }
            });
            
            const problems = response.data.data.problemsetQuestionList.questions;
            return problems.length > 0 ? problems[0] : null;
        } catch (error) {
            Logger.error(Logs.error.problemFetch, error);
            return null;
        }
    }
}