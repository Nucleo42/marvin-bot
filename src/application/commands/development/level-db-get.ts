import { Command } from "@interfaces/commands/Command";
import { LevelDB } from "@storage/level/client";
import { ApplicationCommandType, GuildMember } from "discord.js";
import { container } from "tsyringe";

export default new Command({
  name: "level-db-get",
  description: "Test a level database",
  type: ApplicationCommandType.ChatInput,

  execute: async ({ interaction }) => {
    const localDd = container.resolve(LevelDB);
    const data = await localDd.getData<GuildMember>("testing-level", "user");

    if (!data) {
      await interaction.reply("No data found");
      return;
    }
    const user = await interaction.guild?.members.fetch(data.id);

    await interaction.reply(`salved ${user}`);
  },
});
