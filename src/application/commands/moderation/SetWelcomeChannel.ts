import { Command } from "@interfaces/discord/Command";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

import { container } from "tsyringe";

import { SetWelcomeChannelService } from "@services/commands/SetWelcomeChannelService";

export default new Command({
  name: "set-welcome",
  description: "O comando para setar o canal de boas-vindas",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "welcome-channel-id",
      description: "O canal para setar como canal de boas-vindas",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "rule-channel-id",
      description: "O canal para setar como canal de regras",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "submission-channel-id",
      description: "O canal para setar como canal de apresentação de membros",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "enable-or-disable",
      description: "Use true para habilitar ou false para desabilitar",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },

    {
      name: "leave-announcement",
      description:
        "Use true para habilitar ou false para desabilitar a mensagem de saída",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
  execute: container.resolve(SetWelcomeChannelService).execute,
});
