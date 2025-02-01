import path from "path";
import { injectable } from "tsyringe";
import { GuildMember } from "discord.js";
import { ProfileCardCanvas } from "@utils/Canvas";

@injectable()
export class CreateCanvasCardService {
  private backgroundImage: string;

  constructor() {
    this.backgroundImage = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "assets",
      "images",
      "background.png",
    );
  }

  async createMemberCard(
    user: GuildMember["user"],
    statusText: string = "Acabou de entrar",
    isGreen: boolean = true,
  ): Promise<Buffer> {
    const canvas = new ProfileCardCanvas(600, 150);

    await canvas.drawCard({
      username: user.displayName,
      handle: user.username,
      statusText: statusText,
      avatarPath: user.displayAvatarURL({
        extension: "png",
        forceStatic: true,
      }),
      backgroundPath: this.backgroundImage,
      isGreen: isGreen,
    });

    return canvas.getBuffer();
  }
}
