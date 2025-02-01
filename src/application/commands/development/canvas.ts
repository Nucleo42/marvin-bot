import { ProfileCardCanvas } from "@utils/Canvas";
import { Command } from "@interfaces/discord/Command";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import path from "path";

const image = path.join(
  __dirname,
  "..",
  "..",
  "assets",
  "images",
  "background.png",
);

export default new Command({
  name: "canvas",
  description: "Send a canvas command",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "type",
      description: "The user to show the profile card",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  execute: async ({ interaction, options }) => {
    const user = interaction.user;

    const type = options.getString("type") || "null";
    const canvasQuit = type == "quit" ? true : false;

    await interaction.deferReply();

    const canvas = new ProfileCardCanvas(600, 150);

    await canvas.drawCard({
      username: user.displayName,
      handle: user.username,
      statusText: canvasQuit ? "Saiu do servidor" : "Acabou de entrar",
      avatarPath: user.displayAvatarURL({
        extension: "png",
        forceStatic: true,
      }),
      backgroundPath: image,
      isGreen: !canvasQuit,
    });

    const attachment = canvas.getBuffer();

    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          label: "Regras",
          url: "https://google.com",
          style: ButtonStyle.Link,
        }),
        new ButtonBuilder({
          label: "Apresentação (obrigatória)",
          url: "https://google.com",
          style: ButtonStyle.Link,
        }),
      ],
    });

    await interaction.editReply({
      content: `Seja bem vindo ${user}! Sinta-se em casa!`,
      files: [attachment],
      components: [row],
    });
  },
});
