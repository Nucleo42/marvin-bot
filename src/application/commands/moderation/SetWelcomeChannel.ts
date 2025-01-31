import { Command } from "@interfaces/discord/Command";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

import { container } from "tsyringe";

import { SetWelcomeChannelService } from "@services/commands/SetWelcomeChannelService";

export default new Command({
  name: "set-welcome",
  description: "A command to set the welcome channel",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "welcome-channel-id",
      description: "The channel ID to set as the welcome channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "rule-channel-id",
      description: "The channel ID to set as the rules channel",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "submission-channel-id",
      description:
        "The channel ID to set as the presentation/submission channel",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "enable-or-disable",
      description: "Use true to enable the welcome or false to disable",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },

    {
      name: "leave-announcement",
      description:
        "Use true to enable the leave announcement or false to disable",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
  execute: container.resolve(SetWelcomeChannelService).execute,
});
