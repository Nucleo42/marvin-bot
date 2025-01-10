import { Event } from "@structures/types/events";
import Logging from "@structures/Logging";

export default new Event({
  name: "ready",
  execute: () => {
    Logging.success("Bot is ready!");
  },
});
