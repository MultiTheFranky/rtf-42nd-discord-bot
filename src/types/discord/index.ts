import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Events,
  MessageReaction,
  User,
} from "discord.js";

export type DiscordCommand = ChatInputApplicationCommandData & {
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  onReaction: (reaction: MessageReaction, user: User) => Promise<void>;
};

export type DiscordEvent = {
  event: Events;
  execute: (...args: any[]) => Promise<void>;
};
