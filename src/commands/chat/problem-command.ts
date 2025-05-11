import { ChatInputCommandInteraction, PermissionsString, ApplicationCommandOptionType } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { LeetCodeApi } from '../../services/leetcode-api.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let Logs = require('../../../lang/logs.json');

export class ProblemCommand implements Command {
    public names = [Lang.getRef('chatCommands.problem', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = [];
    private leetcodeApi: LeetCodeApi;
    
    constructor() {
        this.leetcodeApi = new LeetCodeApi();
    }
    
    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        try {
            // Get optional difficulty, topic, and acceptance rate from command if provided
            const difficulty = intr.options.getString('difficulty')?.toLowerCase();
            const topicSlug = intr.options.getString('topic')?.toLowerCase();
            const acceptance = intr.options.getInteger('acceptance');
            
            // Fetch a random problem
            const problem = await this.leetcodeApi.getRandomProblem(difficulty, topicSlug, acceptance);
            
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
}