import { CommandProps } from "@interfaces/discord/Command";
import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import { isDev } from "@utils/IsDev";
import {
  ChannelType,
  Guild,
  GuildBasedChannel,
  MessageFlags,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import { formatNumber } from "@utils/formatNumber";
import { AdminPermissionService } from "@services/AdminPermissionService";

@injectable()
export class MemberCountService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(LevelDB) private storage: LevelDB,
    @inject(AdminPermissionService)
    private adminPermission: AdminPermissionService,
  ) {}

  public async execute({ interaction, options }: CommandProps): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const hasPermission = await this.adminPermission.hasPermission(interaction);

    if (!hasPermission) {
      await interaction.reply({
        content: "Você não tem permissão para executar este comando!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const is_enabled = options.getBoolean("is-enabled", true);
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: "Este comando só pode ser executado em um servidor!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!is_enabled) {
      await interaction.reply({
        content: "O contador de membro está desativado!",
        flags: MessageFlags.Ephemeral,
      });

      await this.salveConfigurations(guild.id, is_enabled);
      return;
    }

    await interaction.deferReply();

    const memberCount = formatNumber(guild.memberCount);
    const channel = this.getChannel(guild);

    if (channel) {
      await this.UpdateChannel(channel, memberCount);
    }

    if (!channel) {
      await this.CreateChannel(guild, memberCount);
    }

    await interaction.editReply({
      content: "O contador de membro foi ativado/atualizado!",
    });

    await this.salveConfigurations(guild.id, is_enabled);
  }

  private getChannel(guild: Guild) {
    const channel = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildVoice &&
        /^(\p{Emoji}-)?Membros:\s?\d+$/u.test(c.name),
    );

    return channel;
  }

  private async CreateChannel(guild: Guild, memberCount: string) {
    await guild.channels.create({
      name: `👥-Membros: ${memberCount}`,
      position: 1,

      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ["Connect"],
        },
      ],
    });

    if (isDev) {
      this.logger.debug({
        prefix: "discord-core-member-count",
        message: "O canal de membros foi criado!",
      });
    }
  }

  private async UpdateChannel(channel: GuildBasedChannel, memberCount: string) {
    const channelNameRegex = /^(.*Membros:)\s?\d+$/u;
    const channelName = channel.name;

    const newName = channelName.replace(channelNameRegex, `$1 ${memberCount}`);

    if (newName === channelName) {
      if (isDev) {
        this.logger.debug({
          prefix: "discord-core-member-count",
          message: "O canal de membros não precisa ser atualizado!",
        });
      }
      return;
    }

    await channel.setName(newName);

    if (isDev) {
      this.logger.debug({
        prefix: "discord-core-member-count",
        message: "O canal de membros foi atualizado!",
      });
    }
  }

  private async salveConfigurations(guildId: string, is_enabled: boolean) {
    await this.storage.setData("member-count", guildId, { is_enabled });

    if (isDev) {
      this.logger.debug({
        prefix: "discord-core-member-count",
        message: "Configurações salvas com sucesso!",
      });
    }
  }
}
