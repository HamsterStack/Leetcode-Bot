import {
    ApplicationCommandType,
    PermissionFlagsBits,
    PermissionsBitField,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    ApplicationCommandOptionType,
} from 'discord.js';

import { Args } from './index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';

export const ChatCommandMetadata: {
    [command: string]: RESTPostAPIChatInputApplicationCommandsJSONBody;
} = {
    DEV: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.dev', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.dev'),
        description: Lang.getRef('commandDescs.dev', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.dev'),
        dm_permission: true,
        default_member_permissions: PermissionsBitField.resolve([
            PermissionFlagsBits.Administrator,
        ]).toString(),
        options: [
            {
                ...Args.DEV_COMMAND,
                required: true,
            },
        ],
    },
    HELP: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.help', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.help'),
        description: Lang.getRef('commandDescs.help', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.help'),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                ...Args.HELP_OPTION,
                required: true,
            },
        ],
    },
    INFO: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.info', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.info'),
        description: Lang.getRef('commandDescs.info', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.info'),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                ...Args.INFO_OPTION,
                required: true,
            },
        ],
    },
    TEST: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.test', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.test'),
        description: Lang.getRef('commandDescs.test', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.test'),
        dm_permission: true,
        default_member_permissions: undefined,
    },
    TODAY: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.today', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.today'),
        description: Lang.getRef('commandDescs.today', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.today'),
        dm_permission: true,
        default_member_permissions: undefined,
    },
    PROBLEM: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef('chatCommands.problem', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('chatCommands.problem'),
    description: Lang.getRef('commandDescs.problem', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('commandDescs.problem'),
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
        {
            name: 'difficulty',
            description: Lang.getRef('argDescs.problemDifficulty', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('argDescs.problemDifficulty'),
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'Easy',
                    value: 'easy',
                },
                {
                    name: 'Medium',
                    value: 'medium',
                },
                {
                    name: 'Hard',
                    value: 'hard',
                },
            ],
        },
        {
            name: 'topic',
            description: Lang.getRef('argDescs.problemTopic', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('argDescs.problemTopic'),
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'Array',
                    value: 'array',
                },
                {
                    name: 'String',
                    value: 'string',
                },
                {
                    name: 'Hash Table',
                    value: 'hash-table',
                },
                {
                    name: 'Dynamic Programming',
                    value: 'dynamic-programming',
                },
                {
                    name: 'Math',
                    value: 'math',
                },
                {
                    name: 'Sorting',
                    value: 'sorting',
                },
                {
                    name: 'Greedy',
                    value: 'greedy',
                },
                {
                    name: 'Depth-First Search',
                    value: 'depth-first-search',
                },
                {
                    name: 'Binary Search',
                    value: 'binary-search',
                },
                {
                    name: 'Matrix',
                    value: 'matrix',
                },
                {
                    name: 'Tree',
                    value: 'tree',
                },
                {
                    name: 'Breadth-First Search',
                    value: 'breadth-first-search',
                },
                {
                    name: 'Bit Manipulation',
                    value: 'bit-manipulation',
                },
                {
                    name: 'Two Pointers',
                    value: 'two-pointers',
                },
                {
                    name: 'Prefix Sum',
                    value: 'prefix-sum',
                },
                {
                    name: 'Heap (Priority Queue)',
                    value: 'heap-priority-queue',
                },
                {
                    name: 'Simulation',
                    value: 'simulation',
                },
                {
                    name: 'Binary Tree',
                    value: 'binary-tree',
                },
                {
                    name: 'Stack',
                    value: 'stack',
                },
                {
                    name: 'Graph',
                    value: 'graph',
                },
                {
                    name: 'Counting',
                    value: 'counting',
                },
                {
                    name: 'Sliding Window',
                    value: 'sliding-window',
                },
                {
                    name: 'Backtracking',
                    value: 'backtracking',
                },
                {
                    name: 'Linked List',
                    value: 'linked-list',
                },
                {
                    name: 'Ordered Set',
                    value: 'ordered-set',
                }
            ]
        },
      {
            name: 'acceptance',
            description: Lang.getRef('argDescs.problemAcceptance', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('argDescs.problemAcceptance'),
            type: ApplicationCommandOptionType.Integer,
            required: false,
            choices: [
                {
                    name: '10-20%',
                    value: 10,
                },
                {
                    name: '20-30%',
                    value: 20,
                },
                {
                    name: '30-40%',
                    value: 30,
                },
                {
                    name: '40-50%',
                    value: 40,
                },
                {
                    name: '50-60%',
                    value: 50,
                },
                {
                    name: '60-70%',
                    value: 60,
                },
                {
                    name: '70-80%',
                    value: 70,
                },
                {
                    name: '80-90%',
                    value: 80,
                },
                {
                    name: '90-100%',
                    value: 90,
                }
            ]
        },
        {
            name: 'premium',
            description: 'Include premium problems in results (default: false)',
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }
    ],
},
};

export const MessageCommandMetadata: {
    [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {
    VIEW_DATE_SENT: {
        type: ApplicationCommandType.Message,
        name: Lang.getRef('messageCommands.viewDateSent', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('messageCommands.viewDateSent'),
        default_member_permissions: undefined,
        dm_permission: true,
    },
};

export const UserCommandMetadata: {
    [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {
    VIEW_DATE_JOINED: {
        type: ApplicationCommandType.User,
        name: Lang.getRef('userCommands.viewDateJoined', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('userCommands.viewDateJoined'),
        default_member_permissions: undefined,
        dm_permission: true,
    },
};
