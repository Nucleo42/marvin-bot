import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import cron, { ScheduledTask } from "node-cron";
import { inject, injectable } from "tsyringe";
import { IListOfMemberBan } from "@services/events/AddMemberOnBanListService";
import { ClientDiscord } from "@discord/Client";
import { isDev } from "@utils/IsDev";
import { IAutoBanRepository } from "@database/repositories/AutoBanRepository";
import { Guild, GuildMember, Collection } from "discord.js";

@injectable()
export class BanMemberJob {
  private task: ScheduledTask | null = null;
  private isRunning: boolean = false;
  private readonly ONE_HOUR: number = 60 * 60 * 1000;

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
        await this.processBanMembers();
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
        prefix: "ban-member-job",
        message: "Iniciado o job de banimento de membro",
      });
    } else {
      this.logger.info({
        prefix: "ban-member-job",
        message: "A tarefa já está em execução.",
      });
    }
  }

  public stop(): void {
    if (this.task && this.isRunning) {
      this.task.stop();
      this.isRunning = false;
      this.logger.info({
        prefix: "ban-member-job",
        message: "Tarefa parada",
      });
    } else {
      this.logger.info({
        prefix: "ban-member-job",
        message: "A tarefa já está parada.",
      });
    }
  }

  private async processBanMembers(): Promise<void> {
    console.log(
      "Tarefa executada a cada 30 minutos:",
      new Date().toLocaleString(),
    );

    const guildIds = await this.storage.listKeys("members-to-ban");

    for (const guildId of guildIds) {
      await this.processBansForGuild(guildId);
    }
  }

  private async processBansForGuild(guildId: string): Promise<void> {
    const users = await this.getMembersToBan(guildId);
    if (!users || users.length === 0) return;

    const { banList, revalidateList } = await this.separateBanLists(
      guildId,
      users,
    );
    await this.updateStoredBanList(guildId, revalidateList);

    if (banList.length > 0) {
      const guild = await this.client.guilds.fetch(guildId);
      const membersToban = await this.getMembersForBulkBan(guild, banList);
      await this.executeBulkBan(guild, membersToban);
      await this.notifyBans(guild, membersToban);
    }
  }

  private async getMembersToBan(guildId: string): Promise<IListOfMemberBan[]> {
    return (
      (await this.storage.getData<IListOfMemberBan[]>(
        "members-to-ban",
        guildId,
      )) || []
    );
  }

  private async separateBanLists(
    guildId: string,
    users: IListOfMemberBan[],
  ): Promise<{
    banList: IListOfMemberBan[];
    revalidateList: IListOfMemberBan[];
  }> {
    const banList: IListOfMemberBan[] = [];
    const revalidateList: IListOfMemberBan[] = [];

    for (const member of users) {
      const guild = await this.client.guilds.fetch(guildId);
      const guildMember = await guild.members.fetch(member.userId);

      if (await this.shouldSkipMember(guildMember)) {
        continue;
      }

      const shouldBan = this.hasPassedTimeLimit(member.date);
      if (shouldBan) {
        banList.push(member);
      } else {
        revalidateList.push(member);
      }
    }

    return { banList, revalidateList };
  }

  private async shouldSkipMember(
    member: GuildMember | undefined,
  ): Promise<boolean> {
    return !!member?.roles.cache.find((role) => role.name === "verificado");
  }

  private hasPassedTimeLimit(date: Date): boolean {
    const dataNow = Date.now();
    const userDate = new Date(date).getTime();
    return Math.abs(dataNow - userDate) >= this.ONE_HOUR;
  }

  private async updateStoredBanList(
    guildId: string,
    revalidateList: IListOfMemberBan[],
  ): Promise<void> {
    await this.storage.setData<IListOfMemberBan[]>(
      "members-to-ban",
      guildId,
      revalidateList,
    );
  }

  private async getMembersForBulkBan(
    guild: Guild,
    banList: IListOfMemberBan[],
  ): Promise<Collection<string, GuildMember>> {
    const memberIdsToFetch = banList.map((ban) => ban.userId);
    return guild.members.cache.filter((member) =>
      memberIdsToFetch.includes(member.id),
    );
  }

  private async executeBulkBan(
    guild: Guild,
    membersToban: Collection<string, GuildMember>,
  ): Promise<void> {
    await guild.members.bulkBan(membersToban, {
      reason: "Violação das regras do servidor (não fez registro).",
    });

    if (isDev) {
      this.logger.info({
        prefix: "ban-member-job",
        message: `Membros banidos do servidor ${guild.id}`,
      });
    }
  }

  private async notifyBans(
    guild: Guild,
    bannedMembers: Collection<string, GuildMember>,
  ): Promise<void> {
    const notificationConfig = await this.storage.getData<IAutoBanRepository>(
      "auto-ban",
      guild.id,
    );

    if (!notificationConfig?.channel_to_logger) return;

    const channel = guild.channels.cache.get(
      notificationConfig.channel_to_logger,
    );
    if (channel?.isSendable()) {
      await channel.send({
        content: `Membros banidos por não fazer a apresentação: ${bannedMembers.map(
          (user) => `\n${user}`,
        )}`,
      });
    }
  }
}
