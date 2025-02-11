import { Event } from "@interfaces/discord/Event";
import { container } from "tsyringe";
import { AnnouncementProjectService } from "@services/events/AnnouncementProjectService";

export default new Event({
  name: "threadCreate",
  execute: async (thread) => {
    const announcementProject = container.resolve(AnnouncementProjectService);
    await announcementProject.execute(thread);
  },
});
