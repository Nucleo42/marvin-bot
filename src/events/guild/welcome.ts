import { Event } from "@structures/types/events";
/* import client from "src"; */
import path from "path";
import { ProfileCardCanvas } from "@utilities/canvas";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const image = path.join(
  __dirname,
  "..",
  "..",
  "assets",
  "images",
  "background.png",
);

export default new Event({
  name: "guildMemberAdd",
  execute: async (interaction) => {
    const user = interaction.user;

    const canvas = new ProfileCardCanvas(600, 150);

    await canvas.drawCard({
      username: user.displayName,
      handle: user.username,
      statusText: "Acabou de entrar",
      avatarPath: user.displayAvatarURL({
        extension: "png",
        forceStatic: true,
      }),
      backgroundPath: image,
      isGreen: true,
    });

    const attachment = canvas.getBuffer();

    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          label: "Regras",
          url: `https://discord.com/channels/${"chanel id"}`,
          style: ButtonStyle.Link,
        }),
        new ButtonBuilder({
          label: "Apresentação (obrigatória)",
          url: `https://discord.com/channels/${"chanel id"}`,
          style: ButtonStyle.Link,
        }),
      ],
    });

    const welcomeChannel = interaction.guild.channels.cache.find(
      (channel) => channel.id === "channel_id",
    );

    if (welcomeChannel?.isSendable()) {
      welcomeChannel.send({
        content: `Bem-vindo(a) ao servidor, ${user}!`,
        files: [attachment],
        components: [row],
      });
    }
  },
});
