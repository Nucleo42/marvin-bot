import { container } from "tsyringe";
import { Logger } from "@logging/Logger";
import { ClientDiscord } from "@discord/Client";
import { EventHandler } from "@discord/handlers/EventHandler";
import { EventsLoader } from "@discord/loaders/EventsLoader";
import { CommandHandler } from "@discord/handlers/CommandHandler";
import { CommandLoader } from "@discord/loaders/CommandLoader";
import { BASE_PATH } from "@constants/BasePath";
import path from "path";

container.registerSingleton(Logger, Logger);
container.registerSingleton(ClientDiscord, ClientDiscord);
container.registerSingleton(EventHandler, EventHandler);
container.registerSingleton(EventsLoader, EventsLoader);
container.registerSingleton(CommandLoader, CommandLoader);
container.registerSingleton(CommandHandler, CommandHandler);

container.register("EventsPath", {
  useValue: path.resolve(BASE_PATH, "application/events"),
});
container.register("CommandsPath", {
  useValue: path.resolve(BASE_PATH, "application/commands"),
});

//commands
import "./commands";
