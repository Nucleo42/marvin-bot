import { Event } from "@interfaces/discord/Event";
import { MemberWelcomeService } from "@services/events/MemberWelcomeService";
import { AddMemberOnBanService } from "@services/events/AddMemberOnBanListService";
import { container } from "tsyringe";

export default new Event({
  name: "guildMemberAdd",
  execute: async (interaction) => {
    const memberWelcomeService = container.resolve(MemberWelcomeService);
    memberWelcomeService.execute(interaction);

    const memberBanService = container.resolve(AddMemberOnBanService);
    memberBanService.execute(interaction);
  },
});
