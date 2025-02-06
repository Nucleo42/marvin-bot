import "reflect-metadata";
import "@container/index";
import { container } from "tsyringe";
import { ClientDiscord } from "@discord/Client";
import { Logger } from "@logging/Logger";
import { EventsLoader } from "@discord/loaders/EventsLoader";
import { CommandLoader } from "@discord/loaders/CommandLoader";
import { DatabaseConnection } from "@database/Connection";
import { LoadCacheOnStartup } from "@services/LoadCacheOnStartup";
import { JobsStart } from "@infrastructure/jobs";

async function bootstrap() {
  const client = container.resolve(ClientDiscord);
  const logger = container.resolve(Logger);

  try {
    const database = container.resolve(DatabaseConnection);
    await database.start();

    const eventsLoader = container.resolve(EventsLoader);
    await eventsLoader.registerEvents();

    const commandLoader = container.resolve(CommandLoader);
    await commandLoader.registerCommands();

    const loadCacheOnStartup = container.resolve(LoadCacheOnStartup);
    await loadCacheOnStartup.execute();

    const jobsStart = container.resolve(JobsStart);
    jobsStart.start();

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

  process.on("uncaughtException", (error) => {
    logger.error({
      prefix: "global-error",
      message: "Erro não tratado (uncaughtException): " + error,
    });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({
      prefix: "global-error",
      message: "Rejeição não tratada (unhandledRejection): " + reason,
    });
  });
}

bootstrap();
