import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import cron, { ScheduledTask } from "node-cron";
import { inject, injectable } from "tsyringe";
import { ClientDiscord } from "@discord/Client";
import { isDev } from "@utils/IsDev";
import { ChannelType, Guild, GuildBasedChannel } from "discord.js";
import { formatNumber } from "@utils/formatNumber";

@injectable()
export class MemberCountJob {
  private task: ScheduledTask | null = null;
  private isRunning: boolean = false;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(LevelDB) private storage: LevelDB,
    @inject(ClientDiscord) private client: ClientDiscord,
  ) {
    this.scheduleTask();
  }

  private scheduleTask(): void {
    this.task = cron.schedule(
      "*/30 * * * *",
      async () => {
        await this.updateMemberCount();
      },
      {
        scheduled: false,
        timezone: "America/Sao_Paulo",
      },
    );
  }

  public start(): void {
    if (this.task && !this.isRunning) {
      this.task.start();
      this.isRunning = true;
      this.logger.info({
        prefix: "member-count-job",
        message: "Iniciado o job de contagem de membros",
      });
    } else {
      this.logger.info({
        prefix: "member-count-job",
        message: "A tarefa já está em execução.",
      });
    }
  }

  private async updateMemberCount(): Promise<void> {
    this.logger.info({
      prefix: "member-count-job",
      message: "Processando job de contagem de membros",
    });

    const guilds = await this.storage.listKeys("member-count");

    for (const guildId of guilds) {
      const guild = this.client.guilds.cache.get(guildId);

      if (!guild) {
        this.logger.error({
          prefix: "member-count-job",
          message: `Servidor não encontrado: ${guildId}`,
        });
        continue;
      }

      const memberCount = formatNumber(guild.memberCount);
      const data = await this.storage.getData<{ is_enabled: boolean }>(
        "member-count",
        guildId,
      );

      if (!data?.is_enabled) {
        continue;
      }

      await this.updateOrCreateChannel(guild, memberCount);
    }
  }

  private async updateOrCreateChannel(guild: Guild, memberCount: string) {
    const channel = this.getChannel(guild);

    if (!channel) {
      await this.createChannel(guild, memberCount);
    } else {
      await this.updateChannelName(channel, memberCount);
    }
  }

  private getChannel(guild: Guild) {
    const channel = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildVoice &&
        /^(\p{Emoji}-)?Membros:\s?\d+$/u.test(c.name),
    );

    return channel;
  }

  private async createChannel(guild: Guild, memberCount: string) {
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
        prefix: "member-count-job",
        message: "O canal de contagem membros foi criado!",
      });
    }
  }

  private async updateChannelName(
    channel: GuildBasedChannel,
    memberCount: string,
  ) {
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
        prefix: "member-count-job",
        message: "O canal de contagem membros foi atualizado!",
      });
    }
  }
}
