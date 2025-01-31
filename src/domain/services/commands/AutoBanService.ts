import { CommandProps } from "@interfaces/discord/Command";
import { Logger } from "@logging/Logger";
import {
  CacheType,
  CommandInteraction,
  CategoryChannel,
  NewsChannel,
  StageChannel,
  TextChannel,
  PublicThreadChannel,
  PrivateThreadChannel,
  MessageFlags,
} from "discord.js";
import { injectable, inject } from "tsyringe";
import { AutoBanRepository } from "@database/repositories/AutoBanRepository";
import { isDev } from "@utils/IsDev";
import { LevelDB } from "@storage/level/Client";

type AllowedChannel =
  | CategoryChannel
  | NewsChannel
  | StageChannel
  | TextChannel
  | PublicThreadChannel
  | PrivateThreadChannel;

@injectable()
export class AutoBanService {
  private isEnabled: boolean;
  private channelToListen: AllowedChannel;
  private channelToLogger: AllowedChannel;
  private guildId: string;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(AutoBanRepository) private db: AutoBanRepository,
    @inject(LevelDB) private storage: LevelDB,
  ) {}

  public async execute({ interaction, options }: CommandProps) {
    if (!interaction.isChatInputCommand()) return;

    const isAdministrator = this.hasPermission(interaction);

    if (!isAdministrator) {
      return await interaction.reply({
        content: "Você não tem permissão para executar este comando!",
        flags: MessageFlags.Ephemeral,
      });
    }

    this.isEnabled = options.getBoolean("is-enabled", true);
    this.channelToListen = options.getChannel(
      "channel-to-listen",
      true,
    ) as AllowedChannel;
    this.channelToLogger = options.getChannel(
      "channel-to-logger",
    ) as AllowedChannel;

    if (!interaction.guild) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    this.guildId = interaction.guild.id;

    await this.salveConfigurations();

    if (isDev) {
      this.logger.info({
        prefix: "auto-ban",
        message: "Configurações salvas com sucesso!",
      });
    }

    return await interaction.editReply({
      content: "As configurações foram salvas com sucesso!",
    });
  }

  private hasPermission(interaction: CommandInteraction<CacheType>) {
    return interaction.memberPermissions?.has("Administrator");
  }

  private async salveConfigurations() {
    const { isEnabled, channelToListen, channelToLogger, guildId } = this;

    await this.db.setAutoBanConfig({
      channel_to_listen: channelToListen.id,
      enabled: isEnabled,
      guild_id: guildId,
      channel_to_logger: channelToLogger?.id,
    });

    await this.storage.setData("auto-ban", guildId, {
      channel_to_listen: channelToListen.id,
      enabled: isEnabled,
      channel_to_logger: channelToLogger?.id,
    });
  }
}
