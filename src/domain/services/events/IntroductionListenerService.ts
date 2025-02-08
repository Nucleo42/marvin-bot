import { AutoBanRepository } from "@database/repositories/AutoBanRepository";
import { Logger } from "@logging/Logger";
import { isDev } from "@utils/IsDev";
import {
  Message,
  GuildMember,
  TextChannel,
  OmitPartialGroupDMChannel,
  Channel,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import { LevelDB } from "@storage/level/Client";

interface AutoBanConfigItem {
  channel_to_listen: string;
  channel_to_logger?: string;
  enabled: boolean;
  guild_id: string;
}

@injectable()
export class IntroductionListenerService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(AutoBanRepository) private db: AutoBanRepository,
    @inject(LevelDB) private storage: LevelDB,
  ) {}

  public async execute(
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    try {
      if (this.shouldIgnoreInteraction(interaction)) return;

      const guildId = interaction.guild?.id;
      if (!guildId) return;

      const configItem = await this.getAutoBanConfigForGuild(guildId);
      if (!configItem) return;

      if (!this.shouldProcessInteraction(interaction, configItem)) return;

      const member = interaction.guild.members.cache.get(interaction.author.id);
      if (!member) return;

      if (this.hasExemptRoles(member)) return;

      if (this.isShortMessage(interaction.content)) {
        await this.handleShortMessage(interaction);
        return;
      }

      await this.assignVerifiedRole(interaction, member);

      if (configItem.channel_to_logger) {
        await this.logInteraction(interaction, configItem.channel_to_logger);
      }
    } catch (error) {
      this.logger.error({
        prefix: "discord-core",
        message: `Erro ao processar a mensagem de apresentação: ${error}`,
      });
    }
  }

  private shouldIgnoreInteraction(interaction: Message<boolean>): boolean {
    if (interaction.channel.isDMBased()) return true;
    if (interaction.author.bot) return true;
    return false;
  }

  private async getAutoBanConfigForGuild(
    guildId: string,
  ): Promise<AutoBanConfigItem | undefined> {
    const cachedConfig = await this.storage.getData<AutoBanConfigItem>(
      "auto-ban",
      guildId,
    );

    if (cachedConfig) {
      if (isDev) {
        this.logger.info({
          prefix: "discord-core",
          message: `Configuração de auto ban carregada do cache para o servidor ${guildId}`,
        });
      }

      return cachedConfig;
    }

    const configs = (await this.db.getAutoBanConfig(
      guildId,
    )) as AutoBanConfigItem[];
    return configs[0];
  }

  private shouldProcessInteraction(
    interaction: Message<boolean>,
    config: AutoBanConfigItem,
  ): boolean {
    const channelId = interaction.channel.id;
    if (channelId !== config.channel_to_listen) return false;
    if (!config.enabled) return false;
    return true;
  }

  private hasExemptRoles(member: GuildMember): boolean {
    return member.roles.cache.some(
      (role) => role.name === "Admin" || role.name === "Verificado",
    );
  }

  private async logInteraction(
    interaction: Message<boolean>,
    loggerChannelId: string,
  ): Promise<void> {
    const guild = interaction.guild;
    if (!guild) return;

    const channel = guild.channels.cache.get(loggerChannelId);
    if (this.isTextChannelSendable(channel)) {
      await (channel as TextChannel).send(
        `O usuário ${interaction.author} enviou uma mensagem de apresentação e foi validado com sucesso!`,
      );
    }
  }

  private isTextChannelSendable(
    channel: Channel | undefined,
  ): channel is TextChannel {
    return Boolean(channel && channel.isTextBased() && "send" in channel);
  }

  private isShortMessage(content: string): boolean {
    return content.length < 20;
  }

  private async handleShortMessage(
    interaction: Message<boolean>,
  ): Promise<void> {
    const botMessage = await interaction.reply({
      content:
        "Sua mensagem de apresentação é muito curta, por favor, tente novamente!",
    });

    setTimeout((): void => {
      interaction.delete().catch(() => {});
      botMessage.delete().catch(() => {});
    }, 9000);
  }

  private async assignVerifiedRole(
    interaction: Message<boolean>,
    member: GuildMember,
  ): Promise<void> {
    const guild = interaction.guild;
    if (!guild) return;

    const roleVerified = guild.roles.cache.find((r) => r.name == "Verificado");
    const roleMember = guild.roles.cache.find((r) => r.name == "Membro");
    const rolePending = guild.roles.cache.find((r) => r.name == "Pendente");

    if (!roleVerified || !roleMember || !rolePending) {
      if (isDev) {
        this.logger.error({
          prefix: "discord-core",
          message:
            "Não foi possível encontrar os cargos necessários para a validação do usuário!",
        });
      }
      return;
    }

    await Promise.all([
      member.roles.add([roleVerified, roleMember]),
      member.roles.remove(rolePending),
    ]);

    const botMessage = await interaction.reply({
      content: "Você foi registrado com sucesso!",
    });

    await interaction.react("💜");

    setTimeout((): void => {
      botMessage.delete().catch(() => {});
    }, 9000);

    if (isDev) {
      this.logger.info({
        prefix: "discord-core",
        message: `O usuário ${interaction.author.tag} foi registrado com sucesso!`,
      });
    }
  }
}
