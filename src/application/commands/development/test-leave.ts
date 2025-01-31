import { Command } from "@interfaces/discord/Command";
import { ApplicationCommandType } from "discord.js";

export default new Command({
  name: "test-leave",
  description: "A test command for the leave event",
  type: ApplicationCommandType.ChatInput,
  execute: async ({ interaction }) => {
    const guild = interaction.guild;

    if (!guild) {
      return interaction.reply("This command can only be used in a server");
    }

    const guildMember = await guild?.members.fetch(interaction.user.id);

    if (!guildMember) {
      return interaction.reply("You are not a member of this server");
    }

    interaction.client.emit("guildMemberRemove", guildMember);

    return interaction.reply("Welcome event has been triggered");
  },
});
