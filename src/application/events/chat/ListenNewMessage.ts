import { Event } from "@interfaces/discord/Event";
import { container } from "tsyringe";
import { ListenIntroductoryService } from "@services/events/ListenIntroductoryService";

export default new Event({
  name: "messageCreate",
  execute: async (interaction) => {
    const listenIntroductoryService = container.resolve(
      ListenIntroductoryService,
    );
    listenIntroductoryService.execute(interaction);
  },
});
