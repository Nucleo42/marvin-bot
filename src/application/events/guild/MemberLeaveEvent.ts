import { Event } from "@interfaces/discord/Event";
import { MemberLeaveService } from "@services/events/MemberLeaveService";
import { container } from "tsyringe";

export default new Event({
  name: "guildMemberRemove",
  execute: async (interaction) => {
    const memberLeaveService = container.resolve(MemberLeaveService);
    await memberLeaveService.execute(interaction);
  },
});
