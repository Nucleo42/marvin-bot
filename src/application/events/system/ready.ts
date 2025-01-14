import { Logger } from "@logging/logger";
import { Event } from "src/domain/interfaces/events/event";
import { container } from "tsyringe";

export default new Event({
  name: "ready",
  execute: () => {
    const logger = container.resolve(Logger);
    logger.success("O bot está pronto!");
  },
});
