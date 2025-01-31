import { Event } from "@interfaces/discord/Event";
import { MemberWelcomeService } from "@services/events/MemberWelcomeService";
import { container } from "tsyringe";

export default new Event({
  name: "guildMemberAdd",
  execute: async (interaction) => {
    const memberWelcomeService = container.resolve(MemberWelcomeService);
    memberWelcomeService.execute(interaction);
  },
});
