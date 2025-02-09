import { Command } from "@interfaces/discord/Command";
import { ApplicationCommandType } from "discord.js";
import { container } from "tsyringe";
import { PingService } from "@services/commands/PingService";

export default new Command({
  name: "ping",
  description: "Ping comando",
  type: ApplicationCommandType.ChatInput,
  execute: container
    .resolve(PingService)
    .execute.bind(container.resolve(PingService)),
});
