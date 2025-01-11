import { ClientDiscord } from "@structures/ClientDiscord";
import Logging from "@structures/Logging";
import { Clientdrizzle } from "@structures/Clientdrizzle";

const client = new ClientDiscord();
const database = new Clientdrizzle();

database
  .start()
  .then(() => {
    Logging.success("Database connected!");
  })
  .catch((err) => Logging.error(err));

client
  .start()
  .then(() => {
    Logging.success("Bot started!");
  })
  .catch((err) => Logging.error(err));

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

export { database };
export default client;
