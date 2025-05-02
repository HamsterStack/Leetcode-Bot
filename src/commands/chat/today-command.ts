import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { DatabaseService, Lang, Logger } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let Logs = require('../../../lang/logs.json');

export class TodayCommand implements Command {
    public names = [Lang.getRef('chatCommands.today', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = [];
    
    private dbService: DatabaseService;
    
    constructor() {
        this.dbService = DatabaseService.getInstance();
    }

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        try {
            // Fetch today's problems from the database
            const problems = await this.dbService.getTodayProblems();
            
            // Format problems for the embed template
            const embedData = this.dbService.formatProblemsForEmbed(problems);
            
            // Send response using the lang system
            await InteractionUtils.send(intr, Lang.getEmbed('displayEmbeds.today', data.lang, embedData));
        } catch (error) {
            Logger.error(Logs.error.todayCommand, error);
            await InteractionUtils.send(intr, Lang.getEmbed('errorEmbeds.command', data.lang, {
                ERROR_CODE: 'DB_ERROR',
                GUILD_ID: intr.guild?.id ?? 'DM',
                SHARD_ID: String(intr.guild?.shardId) ?? '',
            }));
        }
    }
}
