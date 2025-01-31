import { Logger } from "@logging/logger";
import { Event } from "@interfaces/discord/event";
import { container } from "tsyringe";

export default new Event({
  name: "ready",
  execute: () => {
    const logger = container.resolve(Logger);
    logger.success({ prefix: "discord-core", message: "O bot está pronto!" });
  },
});
