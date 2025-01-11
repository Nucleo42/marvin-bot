import { Event } from "@structures/types/events";
/* import client from "src"; */
import path from "path";
import { ProfileCardCanvas } from "@utilities/canvas";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { WelcomeModel } from "@database/models/welcome.model";

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
    try {
      const canvas = new ProfileCardCanvas(600, 150);

      const db = new WelcomeModel();
      const welcomeChannelInfos = await db.getWelcomeChannel(
        interaction.guild.id,
      );

      if (!welcomeChannelInfos || welcomeChannelInfos.length <= 0) return;

      if (!welcomeChannelInfos[0]) return;
      const {
        rulesChannel,
        presentationChannel,
        channel_id,
        guild_id,
        enabled,
      } = welcomeChannelInfos[0];

      if (!enabled) return;

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
            url: `https://discord.com/channels/${guild_id}/${rulesChannel}`,
            style: ButtonStyle.Link,
          }),
          new ButtonBuilder({
            label: "Apresentação (obrigatória)",
            url: `https://discord.com/channels/${guild_id}/${presentationChannel}`,
            style: ButtonStyle.Link,
          }),
        ],
      });

      const welcomeChannel = interaction.guild.channels.cache.find(
        (channel) => channel.id === channel_id,
      );

      if (welcomeChannel?.isSendable()) {
        welcomeChannel.send({
          content: `Bem-vindo(a) ao servidor, ${user}!`,
          files: [attachment],
          components: [row],
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
});
