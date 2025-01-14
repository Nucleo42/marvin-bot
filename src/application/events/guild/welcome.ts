import { Event } from "@interfaces/events/event";
import path from "path";
import { ProfileCardCanvas } from "@shared/utils/canvas";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ServerEventFlow } from "@repositories/ServerEventFlow.repository";
import { container } from "tsyringe";
import { Logger } from "@logging/logger";

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
    const logger = container.resolve(Logger);
    const user = interaction.user;

    try {
      const canvas = new ProfileCardCanvas(600, 150);

      const db = container.resolve(ServerEventFlow);

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

      const listOfButtons: ButtonBuilder[] = [];

      if (rulesChannel) {
        listOfButtons.push(
          new ButtonBuilder({
            label: "Regras",
            url: `https://discord.com/channels/${guild_id}/${rulesChannel}`,
            style: ButtonStyle.Link,
          }),
        );
      }

      if (presentationChannel) {
        listOfButtons.push(
          new ButtonBuilder({
            label: "Apresentação (obrigatória)",
            url: `https://discord.com/channels/${guild_id}/${presentationChannel}`,
            style: ButtonStyle.Link,
          }),
        );
      }

      const row = new ActionRowBuilder<ButtonBuilder>({
        components: listOfButtons,
      });

      const welcomeChannel = interaction.guild.channels.cache.find(
        (channel) => channel.id === channel_id,
      );

      const presentationChannelObj = interaction.guild.channels.cache.find(
        (channel) => channel.id === presentationChannel,
      );

      if (welcomeChannel?.isSendable()) {
        welcomeChannel.send({
          content: `Nucleo 42 te dá as boas-vindas, ${user}! Por favor, apresente-se${presentationChannelObj ? ` e deixe suas redes lá no canal ${presentationChannelObj}` : "!"} `,
          files: [attachment],
          components: [row],
        });
      }
    } catch (error) {
      logger.error({
        prefix: "discord-event",
        message: "Erro ao tentar enviar mensagem de boas-vindas: " + error,
      });
    }
  },
});
