// src/jobs/daily-problem-job.ts
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import schedule from 'node-schedule';
import { createRequire } from 'node:module';
import { LeetCodeApi } from '../services/leetcode-api.js';
import { Logger } from '../services/index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

export class DailyProblem {
    private client: Client;
    private leetcodeApi: LeetCodeApi;
    private channelId: string;

    constructor(client: Client) {
        this.client = client;
        this.leetcodeApi = new LeetCodeApi();
        this.channelId = Config.dailyProblem.channelId; // Add this to your config.json
    }

    public start(): void {
        Logger.info(Logs.info.dailyProblemJobStarted);
        
        // Schedule job to run every day at 12 PM EST
        // Note: node-schedule uses server's local timezone, so we need to convert from EST
        // '0 12 * * *' = 12 PM every day (in the server's timezone)
        // For EST specifically, you may need to adjust based on your server's timezone
  
        //w wait 5 seconds
        setTimeout(() => {
            this.sendDailyProblem();
        }, 5000);
        
        // Optionally, you could also immediately send a problem when the bot starts
        // if (Config.dailyProblem.sendOnStartup) {
        //     this.sendDailyProblem();
        // }
    }

    private async sendDailyProblem(): Promise<void> {
        try {
            Logger.info(Logs.info.sendingDailyProblem);
            
            // Get the channel to send the problem to
            const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
            if (!channel || !channel.isTextBased()) {
                Logger.error(Logs.error.invalidDailyProblemChannel);
                return;
            }
            
            // Get a random problem (no filters for daily - to increase variety)
            // You could also randomize difficulty or topic if desired
            const problem = await this.leetcodeApi.getRandomProblem();
            
            if (!problem) {
                Logger.error(Logs.error.dailyProblemFetch);
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
            
            // Get the embed using the lang system
            const embed = Lang.getEmbed('displayEmbeds.dailyProblem', Language.Default, problemData);
            
            // Send to the channel
            await channel.send({ embeds: [embed] });
            Logger.info(Logs.info.dailyProblemSent);
        } catch (error) {
            Logger.error(Logs.error.dailyProblemJob, error);
        }
    }
}