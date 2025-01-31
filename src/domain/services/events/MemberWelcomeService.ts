import { inject, injectable } from "tsyringe";
import {
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { CreateCanvasCardService } from "@services/events/CreateCanvasCardService";
import {
  ServerEventFlow,
  WelcomeChannel,
} from "@repositories/ServerEventFlow.repository";
import { Logger } from "@logging/Logger";

@injectable()
export class MemberWelcomeService {
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

  private createNavigationButtons(
    config: WelcomeChannel,
    guildId: string,
  ): ActionRowBuilder<ButtonBuilder> {
    const buttons: ButtonBuilder[] = [];

    if (config.rulesChannel) {
      buttons.push(
        new ButtonBuilder({
          label: "Regras",
          url: `https://discord.com/channels/${guildId}/${config.rulesChannel}`,
          style: ButtonStyle.Link,
        }),
      );
    }

    if (config.presentationChannel) {
      buttons.push(
        new ButtonBuilder({
          label: "Apresentação (obrigatória)",
          url: `https://discord.com/channels/${guildId}/${config.presentationChannel}`,
          style: ButtonStyle.Link,
        }),
      );
    }

    return new ActionRowBuilder<ButtonBuilder>({
      components: buttons,
    });
  }

  async execute(interaction: GuildMember): Promise<void> {
    try {
      const welcomeConfig = await this.fetchWelcomeConfiguration(
        interaction.guild.id,
      );

      if (!welcomeConfig?.enabled) return;

      const welcomeCard = await this.canvasService.createMemberCard(
        interaction.user,
      );

      const actionButtons = this.createNavigationButtons(
        welcomeConfig,
        interaction.guild.id,
      );

      const welcomeChannel = interaction.guild.channels.cache.find(
        (channel) => channel.id === welcomeConfig.channel_id,
      );

      const presentationChannelObj = interaction.guild.channels.cache.find(
        (channel) => channel.id === welcomeConfig.presentationChannel,
      );

      if (welcomeChannel?.isSendable()) {
        await welcomeChannel.send({
          content: `Nucleo 42 te dá as boas-vindas, ${interaction.user}! Por favor, apresente-se${presentationChannelObj ? ` e deixe suas redes lá no canal ${presentationChannelObj}` : "!"} `,
          files: [welcomeCard],
          components: [actionButtons],
        });
      }
    } catch (error) {
      this.logger.error({
        prefix: "discord-event",
        message: "Erro ao tentar enviar mensagem de boas-vindas: " + error,
      });
    }
  }
}
