import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import { isDev } from "@utils/IsDev";
import { Message, OmitPartialGroupDMChannel } from "discord.js";
import { inject, injectable } from "tsyringe";
import { IAnnouncementConfig } from "@interfaces/AnnouncementConfig";

@injectable()
export class AnnouncementReactService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(LevelDB) private storage: LevelDB,
  ) {}

  public async execute(
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    if (interaction.author.bot) return;

    const guild = interaction.guild;
    const channelId = interaction.channelId;

    if (!guild || !channelId) {
      return;
    }

    const announcementConfig = await this.storage.getData<IAnnouncementConfig>(
      "announcement-react",
      guild.id,
    );

    if (!announcementConfig?.is_enabled) {
      return;
    }

    if (channelId !== announcementConfig.channel_id) {
      return;
    }

    await interaction.react(announcementConfig.reaction_emote);

    if (isDev) {
      this.logger.debug({
        prefix: "discord-core-announcement-react",
        message: "Reagiu a mensagem de anúncio!",
      });
    }
  }
}
