import { Event } from "@interfaces/discord/event";
import path from "path";
import fs from "fs/promises";
import { Logger } from "@logging/logger";
import { EventHandler } from "@discord/handlers/EventHandler";
import { injectable, inject } from "tsyringe";
import { ClientEvents } from "discord.js";

@injectable()
export class EventsLoader {
  constructor(
    @inject("EventsPath") private eventsPath: string,
    @inject(Logger) private logger: Logger,
    @inject(EventHandler) private eventHandler: EventHandler,
  ) {}

  private async loadEvents(): Promise<Array<Event<keyof ClientEvents>>> {
    const events: Array<Event<keyof ClientEvents>> = [];

    async function readEventsRecursively(dir: string): Promise<void> {
      const files = await fs.readdir(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
          await readEventsRecursively(fullPath);
        } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
          try {
            const imported = await import(fullPath);
            const event: Event<keyof ClientEvents> = imported.default;

            if (
              event?.event?.name &&
              typeof event.event.execute === "function"
            ) {
              events.push(event);
            }
          } catch (error) {
            console.error(
              `Erro ao carregar arquivo de evento ${fullPath}:`,
              error,
            );
          }
        }
      }
    }

    await readEventsRecursively(this.eventsPath);
    return events;
  }

  public async registerEvents(): Promise<void> {
    try {
      const events = await this.loadEvents();

      for (const event of events) {
        this.eventHandler.register(event.event);
      }

      this.logger.success({
        prefix: "discord-event",
        message: `Total de ${events.length} eventos registrados com sucesso.`,
      });
    } catch (error) {
      this.logger.error({
        prefix: "discord-event",
        message: `Erro ao registrar eventos: ${error}`,
      });
    }
  }
}
