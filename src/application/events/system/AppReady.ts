import { Logger } from "@logging/Logger";
import { Event } from "@interfaces/discord/Event";
import { container } from "tsyringe";

export default new Event({
  name: "ready",
  execute: () => {
    const logger = container.resolve(Logger);
    logger.success({ prefix: "discord-core", message: "O bot está pronto!" });
  },
});
