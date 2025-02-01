import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import cron, { ScheduledTask } from "node-cron";
import { inject, injectable } from "tsyringe";
import { IListOfMemberBan } from "@services/events/AddMemberOnBanListService";
import { ClientDiscord } from "@discord/Client";
import { isDev } from "@utils/IsDev";

@injectable()
export class BanMemberJob {
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
        await this.BanMembers();
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
        message: " tarefa já está parada.",
      });
    }
  }

  private async BanMembers() {
    console.log(
      "Tarefa executada a cada 30 minutos:",
      new Date().toLocaleString(),
    );

    const listOfGuilds = await this.storage.listKeys("members-to-ban");

    listOfGuilds.forEach(async (guildID) => {
      const newListOfBan: IListOfMemberBan[] = [];
      const listOfRevalidateBan: IListOfMemberBan[] = [];

      const listOfUsers = await this.storage.getData<IListOfMemberBan[]>(
        "members-to-ban",
        guildID,
      );

      if (listOfUsers && listOfUsers.length > 0) {
        for (const member of listOfUsers) {
          const guild = await this.client.guilds.fetch(guildID);
          const guildMember = await guild.members.fetch(member.userId);

          if (
            guildMember?.roles.cache.find((role) => role.name == "verificado")
          ) {
            continue;
          }

          const ONE_HOUR = 60 * 60 * 1000;
          const dataNow = Date.now();
          const userDate = new Date(member.date).getTime();

          const hasOneHourDifference = Math.abs(dataNow - userDate) >= ONE_HOUR;

          if (hasOneHourDifference) {
            newListOfBan.push(member);
            continue;
          }

          listOfRevalidateBan.push(member);
        }
      }

      await this.storage.setData<IListOfMemberBan[]>(
        "members-to-ban",
        guildID,
        listOfRevalidateBan,
      );

      if (newListOfBan.length > 0) {
        const memberIdsToFetch = newListOfBan.map((ban) => ban.userId);

        const guild = await this.client.guilds.fetch(guildID);

        const listOFUsers = await guild.members.cache.filter((member) =>
          memberIdsToFetch.includes(member.id),
        );

        guild.members.bulkBan(listOFUsers, {
          reason: "Violação das regras do servidor (nao fez registro).",
        });

        if (isDev) {
          this.logger.info({
            prefix: "ban-member-job",
            message: `Membros banidos do servidor ${guildID}`,
          });
        }
      }
    });
  }
}
