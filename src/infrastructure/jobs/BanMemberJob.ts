import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import cron, { ScheduledTask } from "node-cron";
import { inject, injectable } from "tsyringe";
import { IListOfMemberBan } from "@services/events/AddMemberOnBanListService";
import { ClientDiscord } from "@discord/Client";
import { isDev } from "@utils/IsDev";
import { IAutoBanRepository } from "@database/repositories/AutoBanRepository";
import { Guild, GuildMember, Collection } from "discord.js";
import configs from "@configs/EnvironmentVariables";
import { formatTime } from "@utils/time";

const { CRON_TIME, WAITING_TIME } = configs.BAN_JOB;

@injectable()
export class BanMemberJob {
  private task: ScheduledTask | null = null;
  private isRunning: boolean = false;
  private readonly WAITING_TIME: number = parseInt(WAITING_TIME || "3600000");
  private readonly CRON_TIME: string = CRON_TIME || "*/30 * * * *";

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(LevelDB) private storage: LevelDB,
    @inject(ClientDiscord) private client: ClientDiscord,
  ) {
    this.scheduleTask();
  }

  private scheduleTask(): void {
    this.task = cron.schedule(
      this.CRON_TIME,
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
    this.logger.info({
      prefix: "ban-member-job",
      message: "Iniciando o processo para banimento de membros",
    });

    this.logger.debug({
      prefix: "ban-member-job",
      message: `O tempo de espera para banimento é de ${formatTime(this.WAITING_TIME)}`,
    });

    const guildIds = await this.storage.listKeys("members-to-ban");

    for (const guildId of guildIds) {
      await this.processBansForGuild(guildId);
    }
  }

  private async processBansForGuild(guildId: string): Promise<void> {
    const users = await this.getMembersToBan(guildId);

    if (!users || users.length === 0) {
      if (isDev) {
        this.logger.debug({
          prefix: "ban-member-job",
          message: `Não há membros para banir no servidor ${guildId}`,
        });
      }

      return;
    }

    const { banList, revalidateList } = await this.separateBanLists(
      guildId,
      users,
    );

    await this.updateStoredBanList(guildId, revalidateList);

    this.logger.debug({
      prefix: "ban-member-job",
      message: `Processando banimento de membros para o servidor ${guildId}, ${banList.length} membros a serem banidos`,
    });

    if (banList.length > 0) {
      const guild = await this.client.guilds.fetch(guildId);
      const membersToBan = await this.getMembersForBulkBan(guild, banList);
      await this.executeBulkBan(guild, membersToBan);
      await this.notifyBans(guild, membersToBan);
    }
  }

  private async getMembersToBan(guildId: string): Promise<IListOfMemberBan[]> {
    const members =
      (await this.storage.getData<IListOfMemberBan[]>(
        "members-to-ban",
        guildId,
      )) || [];

    if (members.length > 0) {
      this.logger.debug({
        prefix: "ban-member-job",
        message: `${members.length} Membros a serem banidos do servidor ${guildId}`,
      });
    }

    return members;
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

      const guildMember = await guild.members.fetch(member.userId).catch(() => {
        return null;
      });

      if (guildMember == null) {
        if (isDev) {
          this.logger.debug({
            prefix: "ban-member-job",
            message: `Membro ${member.userId} não encontrado no servidor ${guildId}`,
          });
        }

        continue;
      }

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

    this.logger.debug({
      prefix: "ban-member-job",
      message: `Membros a serem banidos: ${banList.length}\nMembros a serem revalidados: ${revalidateList.length}`,
    });

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
    return Math.abs(dataNow - userDate) >= this.WAITING_TIME;
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
    membersToBan: Collection<string, GuildMember>,
  ): Promise<void> {
    await guild.members.bulkBan(membersToBan, {
      reason: "Violação das regras do servidor (não fez registro).",
    });

    if (isDev) {
      this.logger.debug({
        prefix: "ban-member-job",
        message: `${membersToBan.size} Membros banidos do servidor ${guild.id}`,
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
