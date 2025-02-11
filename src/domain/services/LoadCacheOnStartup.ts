import { AutoBanRepository } from "@database/repositories/AutoBanRepository";
import { GreetingRepository } from "@database/repositories/GreetingRepository";
import { Logger } from "@logging/Logger";
import { isDev } from "@utils/IsDev";
import { inject, injectable } from "tsyringe";
import { LevelDB } from "@storage/level/Client";
import { AnnouncementProjectRepository } from "@database/repositories/AnnouncementProjectRepository";

@injectable()
export class LoadCacheOnStartup {
  constructor(
    @inject(Logger) private Logger: Logger,
    @inject(AutoBanRepository) private db: AutoBanRepository,
    @inject(LevelDB) private storage: LevelDB,
    @inject(GreetingRepository) private greetingRepository: GreetingRepository,
    @inject(AnnouncementProjectRepository)
    private announcementProjectRepository: AnnouncementProjectRepository,
  ) {}

  async execute() {
    await this.LoadAutoBanConfig();
    await this.LoadGreetingConfig();
    await this.LoadAnnouncementProjectConfig();
  }

  private async LoadAutoBanConfig() {
    try {
      const autoBanConfig = await this.db.getAllAutoBanConfig();

      let count = 0;

      autoBanConfig.forEach((config) => {
        this.storage.setData("auto-ban", config.guild_id, config);
        count += 1;

        if (isDev) {
          this.Logger.debug({
            prefix: "auto-ban-cache",
            message: `Configuração de auto-ban carregada para o servidor ${config.guild_id}`,
          });
        }
      });

      this.Logger.debug({
        prefix: "auto-ban-cache",
        message: `Configurações de auto-ban carregadas com sucesso para ${count} guild!`,
      });
    } catch (error) {
      this.Logger.error({
        prefix: "auto-ban-cache",
        message:
          "Ocorreu um erro ao carregar as configurações de auto-ban: " + error,
      });
    }
  }

  private async LoadGreetingConfig() {
    try {
      const greetingConfig =
        await this.greetingRepository.getAllGreetingConfig();

      let count = 0;

      greetingConfig.forEach((config) => {
        this.storage.setData("greeting-config", config.guild_id, config);
        count += 1;

        if (isDev) {
          this.Logger.debug({
            prefix: "greeting-cache",
            message: `Configuração de greeting carregada para o servidor ${config.guild_id}`,
          });
        }
      });

      this.Logger.debug({
        prefix: "greeting-cache",
        message: `Configurações de greeting carregadas com sucesso para ${count} guild!`,
      });
    } catch (error) {
      this.Logger.error({
        prefix: "greeting-cache",
        message:
          "Ocorreu um erro ao carregar as configurações de greeting: " + error,
      });
    }
  }

  private async LoadAnnouncementProjectConfig() {
    try {
      const announcementProjectConfig =
        await this.announcementProjectRepository.getAll();

      let count = 0;

      announcementProjectConfig.forEach((config) => {
        this.storage.setData("announcement-project", config.guild_id, config);
        count += 1;

        if (isDev) {
          this.Logger.debug({
            prefix: "announcement-project-cache",
            message: `Configuração de announcement-project carregada para o servidor ${config.guild_id}`,
          });
        }
      });

      this.Logger.debug({
        prefix: "announcement-project-cache",
        message: `Configurações de announcement-project carregadas com sucesso para ${count} guild!`,
      });
    } catch (error) {
      this.Logger.error({
        prefix: "announcement-project-cache",
        message:
          "Ocorreu um erro ao carregar as configurações de announcement-project: " +
          error,
      });
    }
  }
}
