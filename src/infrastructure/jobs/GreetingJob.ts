import { Logger } from "@logging/Logger";
import { LevelDB } from "@storage/level/Client";
import cron, { ScheduledTask } from "node-cron";
import { inject, injectable } from "tsyringe";
import { ClientDiscord } from "@discord/Client";
import { isDev } from "@utils/IsDev";
import { IGreetingRepository } from "@database/repositories/GreetingRepository";
import { TextChannel } from "discord.js";
import { MarvinGreeting } from "@constants/MarvinGreeting";

@injectable()
export class GreetingJob {
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
      "1 1 6 * * *",
      async () => {
        await this.processGreeting();
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
        prefix: "greeting-job",
        message: "Iniciado o job de saudação",
      });
    } else {
      this.logger.info({
        prefix: "greeting-job",
        message: "A tarefa já está em execução.",
      });
    }
  }

  private async processGreeting(): Promise<void> {
    if (isDev) {
      this.logger.info({
        prefix: "greeting-job",
        message: "Iniciando job de saudação",
      });
    }

    const guildIds = await this.storage.listKeys("greeting-config");

    for (const guildId of guildIds) {
      await this.sendGreeting(guildId);
    }
  }

  private async sendGreeting(guildId: string): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);

    if (!guild) {
      this.logger.warn({
        prefix: "greeting-job",
        message: `Guilda não encontrada: ${guildId}`,
      });
      return;
    }

    const greetingConfig = await this.storage.getData<IGreetingRepository>(
      "greeting-config",
      guildId,
    );

    if (!greetingConfig) {
      if (isDev) {
        this.logger.warn({
          prefix: "greeting-job",
          message: `Configuração de saudação não encontrada: ${guildId}`,
        });
      }
      return;
    }

    const channel = guild.channels.cache.get(
      greetingConfig.channel_to_send,
    ) as TextChannel;

    if (!channel) {
      if (isDev) {
        this.logger.warn({
          prefix: "greeting-job",
          message: `Canal de saudação não encontrado: ${greetingConfig.channel_to_send}`,
        });
      }
      return;
    }

    const greeting = this.selectRandomGreeting();

    if (channel.isSendable()) {
      await channel.send(greeting);
    }
  }

  private selectRandomGreeting(): string {
    const chance = Math.random();

    const listOfWords = MarvinGreeting;

    const selectedWord: string =
      chance < 0.89
        ? "Bom dia, polvos!"
        : listOfWords[Math.floor(Math.random() * listOfWords.length)] ||
          "Bom dia, valorosos membros!";

    return selectedWord;
  }
}
