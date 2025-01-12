import { Command } from "@structures/types/commands";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  GuildMember,
} from "discord.js";
import { localDd } from "../../index";

export default new Command({
  name: "level-db-set",
  description: "Test a level database",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "me",
      description: "The user to test the level database",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  execute: async ({ interaction, options }) => {
    const me = options.getMentionable("me", true);

    if (!interaction.isChatInputCommand()) return;

    if (!(me instanceof GuildMember) || !me.user) {
      await interaction.reply("Invalid user");
      return;
    }

    await localDd.setData<typeof me>("testing-level", `${me.id}`, me);
    await interaction.reply("salved");
  },
});
