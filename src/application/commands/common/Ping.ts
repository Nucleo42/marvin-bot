import { Command } from "@interfaces/discord/Command";
import { ApplicationCommandType } from "discord.js";

export default new Command({
  name: "ping",
  description: "Ping command",
  type: ApplicationCommandType.ChatInput,
  execute: async ({ interaction }) => {
    await interaction.reply("Pong!");
  },
});
