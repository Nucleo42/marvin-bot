import { Event } from "@interfaces/discord/Event";
import { container } from "tsyringe";
import { IntroductionListenerService } from "@services/events/IntroductionListenerService";
import { AnnouncementReactService } from "@services/events/AnnouncementReactService";

export default new Event({
  name: "messageCreate",
  execute: async (interaction) => {
    const introductionListenerService = container.resolve(
      IntroductionListenerService,
    );
    introductionListenerService.execute(interaction);

    const announcementReactService = container.resolve(
      AnnouncementReactService,
    );
    announcementReactService.execute(interaction);
  },
});
