import { AutoBanRepository } from "@database/repositories/AutoBanRepository";
import { Logger } from "@logging/Logger";
import { isDev } from "@utils/IsDev";
import { inject, injectable } from "tsyringe";
import { LevelDB } from "@storage/level/Client";

@injectable()
export class LoadCacheOnStartup {
  constructor(
    @inject(Logger) private Logger: Logger,
    @inject(AutoBanRepository) private db: AutoBanRepository,
    @inject(LevelDB) private storage: LevelDB,
  ) {}

  async execute() {
    await this.LoadAutoBanConfig();
  }

  private async LoadAutoBanConfig() {
    try {
      const autoBanConfig = await this.db.getAllAutoBanConfig();

      let count = 0;

      autoBanConfig.forEach((config) => {
        this.storage.setData("auto-ban", config.guild_id, config);
        count += 1;

        if (isDev) {
          this.Logger.info({
            prefix: "auto-ban-cache",
            message: `Configuração de auto-ban carregada para o servidor ${config.guild_id}`,
          });
        }
      });

      this.Logger.info({
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
}
