import { Command } from "@interfaces/discord/Command";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import { container } from "tsyringe";
import { SetGreetingService } from "@services/commands/SetGreetingService";

export default new Command({
  name: "set-greeting",
  description: "Comando para enviar uma saudação para um canal",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "channel-to-send",
      description: "O canal para enviar a saudação",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "is-enabled",
      description: "O envio de saudação está habilitado?",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
  ],
  execute: container
    .resolve(SetGreetingService)
    .execute.bind(container.resolve(SetGreetingService)),
});
