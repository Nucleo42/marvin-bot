import { Logger } from "@logging/Logger";
import { Event } from "@interfaces/discord/Event";
import { container } from "tsyringe";
import { BotStatusService } from "@services/events/BotStatusService";

export default new Event({
  name: "ready",
  execute: (app) => {
    const logger = container.resolve(Logger);
    logger.success({ prefix: "discord-core", message: "O bot está pronto!" });

    const botStatusService = container.resolve(BotStatusService);
    botStatusService.execute(app);
  },
});
