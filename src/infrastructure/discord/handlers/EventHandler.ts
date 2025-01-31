import { Logger } from "@logging/logger";
import { ClientEvents } from "discord.js";
import { ClientDiscord } from "@discord/client";
import { injectable, inject } from "tsyringe";
import { EventTypes } from "@interfaces/discord/event";

@injectable()
export class EventHandler {
  constructor(
    @inject(ClientDiscord) private client: ClientDiscord,
    @inject(Logger) private logger: Logger,
  ) {}

  public register<K extends keyof ClientEvents>(event: EventTypes<K>): void {
    const { name, once, execute } = event;

    try {
      if (once) {
        this.client.once(name, async (...args: ClientEvents[K]) => {
          await this.safeExecute(name, execute, ...args);
        });
      } else {
        this.client.on(name, async (...args: ClientEvents[K]) => {
          await this.safeExecute(name, execute, ...args);
        });
      }

      this.logger.info({
        prefix: "discord-event",
        message: `O evento '${name}' foi registrado como: ${once ? "once" : "persistently"}`,
      });
    } catch (error) {
      this.logger.error({
        prefix: "discord-event",
        message: `Erro ao registrar o evento:'${name}':`,
        error: error,
      });
    }
  }

  private async safeExecute<K extends keyof ClientEvents>(
    name: K,
    handler: (...args: ClientEvents[K]) => Promise<void> | void,
    ...args: ClientEvents[K]
  ): Promise<void> {
    try {
      await Promise.resolve(handler(...args));
    } catch (error) {
      this.logger.error({
        prefix: "discord-event",
        message: `Erro ao inciar o handle do evento: '${name}':`,
        error: error,
      });
    }
  }
}
