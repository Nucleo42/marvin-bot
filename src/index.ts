import { ClientDiscord } from "@structures/ClientDiscord";
import Logging from "@structures/Logging";

const client = new ClientDiscord();

client
  .start()
  .then(() => {
    Logging.success("Bot started!");
  })
  .catch((err) => Logging.error(err));

client.on("ready", () => {
  Logging.success("Bot is ready!");
});

process.on("unhandledRejection", (reason, promise) => {
  try {
    console.error(
      "Unhandled Rejection at: ",
      promise,
      "reason: ",
      (reason instanceof Error ? reason.stack : reason) || reason,
    );
  } catch {
    console.error(reason);
  }
});

export default client;
