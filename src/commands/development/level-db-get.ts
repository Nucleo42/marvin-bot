import { Command } from "@structures/types/commands";
import { ApplicationCommandType, GuildMember } from "discord.js";
import { localDd } from "../../index";

export default new Command({
  name: "level-db-get",
  description: "Test a level database",
  type: ApplicationCommandType.ChatInput,

  execute: async ({ interaction }) => {
    const data = await localDd.getData<GuildMember>("testing", "user");

    if (!data) {
      await interaction.reply("No data found");
      return;
    }
    //const user = await interaction.guild?.members.fetch(data.id);

    console.log(data);

    await interaction.reply(`salved ${data}`);
  },
});
