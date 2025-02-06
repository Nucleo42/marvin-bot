import { Event } from "@interfaces/discord/Event";
import { container } from "tsyringe";
import { IntroductionListenerService } from "@services/events/IntroductionListenerService";

export default new Event({
  name: "messageCreate",
  execute: async (interaction) => {
    const introductionListenerService = container.resolve(
      IntroductionListenerService,
    );
    introductionListenerService.execute(interaction);
  },
});
