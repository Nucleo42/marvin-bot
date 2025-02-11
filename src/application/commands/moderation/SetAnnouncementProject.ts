import { Command } from "@interfaces/discord/Command";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import { container } from "tsyringe";
import { SetAnnouncementProjectService } from "@services/commands/SetAnnouncementProjectService";

export default new Command({
  name: "set-project-announcement",
  description: "Comando para ativar o anúncio de projetos",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "is-enabled",
      description: "Se a função está habilitada",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
    {
      name: "forum-thread-to-listen",
      description: "O forum para ouvir as mensagens",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "channel-to-send",
      description: "O canal para enviar os anúncios",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  execute: container
    .resolve(SetAnnouncementProjectService)
    .execute.bind(container.resolve(SetAnnouncementProjectService)),
});
