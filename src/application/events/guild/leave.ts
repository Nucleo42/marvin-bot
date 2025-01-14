import { Event } from "@interfaces/events/event";
import path from "path";
import { ProfileCardCanvas } from "@shared/utils/canvas";
import { ServerEventFlow } from "@repositories/ServerEventFlow.repository";
import { container } from "tsyringe";
import { Logger } from "@logging/logger";

const image = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "assets",
  "images",
  "background.png",
);

export default new Event({
  name: "guildMemberRemove",
  execute: async (interaction) => {
    const logger = container.resolve(Logger);

    const user = interaction.user;

    try {
      const db = container.resolve(ServerEventFlow);
      const welcomeChannelData = await db.getWelcomeChannel(
        interaction.guild.id,
      );

      if (!welcomeChannelData || welcomeChannelData.length <= 0) return;

      if (!welcomeChannelData[0]) return;

      const { channel_id, enabled, leaveAnnouncement } = welcomeChannelData[0];

      if (!enabled) return;

      if (!leaveAnnouncement) return;

      const canvas = new ProfileCardCanvas(600, 150);

      await canvas.drawCard({
        username: user.displayName,
        handle: user.username,
        statusText: "Saiu do servidor",
        avatarPath: user.displayAvatarURL({
          extension: "png",
          forceStatic: true,
        }),
        backgroundPath: image,
        isGreen: false,
      });

      const attachment = canvas.getBuffer();

      const welcomeChannel = interaction.guild.channels.cache.find(
        (channel) => channel.id === channel_id,
      );

      if (welcomeChannel?.isSendable()) {
        welcomeChannel.send({
          files: [attachment],
        });
      }
    } catch (error) {
      logger.error({
        prefix: "discord-event",
        message: "Erro ao tentar enviar mensagem de saída: ",
        error: error,
      });
    }
  },
});
