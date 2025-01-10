import { Event } from "@structures/types/events";
import path from "path";
import { ProfileCardCanvas } from "@utilities/canvas";

const image = path.join(
  __dirname,
  "..",
  "..",
  "assets",
  "images",
  "background.png",
);

export default new Event({
  name: "guildMemberRemove",
  execute: async (interaction) => {
    const user = interaction.user;

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
      (channel) => channel.id === "channel_id",
    );

    if (welcomeChannel?.isSendable()) {
      welcomeChannel.send({
        files: [attachment],
      });
    }
  },
});
