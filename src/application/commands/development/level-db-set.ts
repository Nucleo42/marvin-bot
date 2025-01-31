import { Command } from "@interfaces/discord/Command";
import { LevelDB } from "@storage/level/Client";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  GuildMember,
} from "discord.js";
import { container } from "tsyringe";

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
    const me = options.getMember("me");

    if (!interaction.isChatInputCommand()) return;

    if (!(me instanceof GuildMember) || !me.user) {
      await interaction.reply("Invalid user");
      return;
    }
    const localDd = container.resolve(LevelDB);
    await localDd.setData<typeof me>("testing-level", "user", me);
    await interaction.reply("salved");
  },
});
