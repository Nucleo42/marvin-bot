import { inject, injectable } from "tsyringe";
import { GuildMember, PartialGuildMember } from "discord.js";
import { CreateCanvasCardService } from "@services/events/CreateCanvasCardService";
import {
  ServerEventFlow,
  WelcomeChannel,
} from "@repositories/ServerEventFlow.repository";
import { Logger } from "@logging/Logger";

@injectable()
export class MemberLeaveService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(ServerEventFlow) private eventDatabase: ServerEventFlow,
    @inject(CreateCanvasCardService)
    private canvasService: CreateCanvasCardService,
  ) {}

  private async fetchWelcomeConfiguration(
    guildId: string,
  ): Promise<WelcomeChannel | null> {
    const welcomeChannelInfos =
      await this.eventDatabase.getWelcomeChannel(guildId);
    if (!welcomeChannelInfos?.length) return null;
    return welcomeChannelInfos[0] as WelcomeChannel;
  }

  async execute(interaction: GuildMember | PartialGuildMember): Promise<void> {
    try {
      const welcomeConfig = await this.fetchWelcomeConfiguration(
        interaction.guild.id,
      );

      if (!welcomeConfig?.enabled) return;

      if (!welcomeConfig?.leaveAnnouncement) return;

      const welcomeCard = await this.canvasService.createMemberCard(
        interaction.user,
        "Acabou de sair",
        false,
      );

      const welcomeChannel = interaction.guild.channels.cache.find(
        (channel) => channel.id === welcomeConfig.channel_id,
      );

      if (welcomeChannel?.isSendable()) {
        welcomeChannel.send({
          files: [welcomeCard],
        });
      }
    } catch (error) {
      this.logger.error({
        prefix: "discord-event",
        message: "Erro ao tentar enviar mensagem de saída: " + error,
      });
    }
  }
}
