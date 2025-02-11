import { Logger } from "@logging/Logger";
import { isDev } from "@utils/IsDev";
import { ActivityType, Client } from "discord.js";
import { inject, injectable } from "tsyringe";

@injectable()
export class BotStatusService {
  constructor(@inject(Logger) private logger: Logger) {}

  public async execute(client: Client<true>): Promise<void> {
    if (isDev) {
      this.logger.success({
        prefix: "discord-core",
        message: "O status do bot foi atualizado!",
      });
    }

    client.user?.setActivity({
      name: "Novos projetos!!",
      type: ActivityType.Watching,
    });
  }
}
