import { Command } from "@interfaces/discord/Command";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import { container } from "tsyringe";
import { AutoBanService } from "@services/commands/AutoBanService";

export default new Command({
  name: "set-auto-ban",
  description: "Comando para banir automaticamente um usuário",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "is-enabled",
      description: "O auto ban está habilitado?",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
    {
      name: "channel-to-listen",
      description: "O canal para ouvir as mensagens de apresentação",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "channel-to-logger",
      description: "O canal para enviar as mensagens de log",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
  ],
  execute: container
    .resolve(AutoBanService)
    .execute.bind(container.resolve(AutoBanService)),
});
