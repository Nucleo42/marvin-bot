import { container } from "tsyringe";
import { Logger } from "@logging/logger";
import { ClientDiscord } from "@discord/client";
import { EventHandler } from "@discord/handlers/EventHandler";
import { EventsLoader } from "@discord/loaders/EventsLoader";
import { CommandHandler } from "@discord/handlers/CommandHandler";
import { CommandLoader } from "@discord/loaders/CommandLoader";
import { isDev } from "@utils/isDev";
import path from "path";

container.registerSingleton(Logger, Logger);
container.registerSingleton(ClientDiscord, ClientDiscord);
container.registerSingleton(EventHandler, EventHandler);
container.registerSingleton(EventsLoader, EventsLoader);
container.registerSingleton(CommandLoader, CommandLoader);
container.registerSingleton(CommandHandler, CommandHandler);

const basePath = isDev ? "./src" : "./dist";
container.register("EventsPath", {
  useValue: path.resolve(basePath, "application/events"),
});
container.register("CommandsPath", {
  useValue: path.resolve(basePath, "application/commands"),
});
