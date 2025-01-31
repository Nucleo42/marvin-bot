import "reflect-metadata";
import "@container/index";
import { container } from "tsyringe";
import { ClientDiscord } from "@discord/Client";
import { Logger } from "@logging/Logger";
import { EventsLoader } from "@discord/loaders/EventsLoader";
import { CommandLoader } from "@discord/loaders/CommandLoader";
import { DatabaseConnection } from "@database/Connection";

async function bootstrap() {
  const client = container.resolve(ClientDiscord);
  const logger = container.resolve(Logger);

  const database = container.resolve(DatabaseConnection);
  await database.start();

  const eventsLoader = container.resolve(EventsLoader);
  await eventsLoader.registerEvents();

  const commandLoader = container.resolve(CommandLoader);
  await commandLoader.registerCommands();

  try {
    await client.start();
    logger.info({
      prefix: "discord-core",
      message: "O client do discord foi iniciado!",
    });
  } catch (error) {
    logger.error({
      prefix: "discord-core",
      message: "Ocorreu um erro ao iniciar o client do discord:",
      error,
    });
  }
}

bootstrap();
