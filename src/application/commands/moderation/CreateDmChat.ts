import { Command } from "@interfaces/discord/Command";
import { ApplicationCommandType } from "discord.js";
import { CreateDmChatService } from "@services/commands/CreateDmChatService";
import { container } from "tsyringe";

export default new Command({
  name: "Criar Chat Privado",
  type: ApplicationCommandType.User,
  execute: container
    .resolve(CreateDmChatService)
    .execute.bind(container.resolve(CreateDmChatService)),
});
