import { Command } from "@interfaces/discord/Command";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import { container } from "tsyringe";
import { MemberCountService } from "@services/commands/MemberCountService";

export default new Command({
  name: "set-member-count",
  description: "Comando para ativar/desativar o contador de membros",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "is-enabled",
      description: "O contador de membro está ligado?",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
  ],
  execute: container
    .resolve(MemberCountService)
    .execute.bind(container.resolve(MemberCountService)),
});
