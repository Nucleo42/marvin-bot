import { Command } from "@interfaces/commands/Command";
import { ApplicationCommandType } from "discord.js";

export default new Command({
  name: "test-welcome",
  description: "A test command for the welcome event",
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

    interaction.client.emit("guildMemberAdd", guildMember);

    return interaction.reply("Welcome event has been triggered");
  },
});
