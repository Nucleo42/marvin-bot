import { Event } from "@structures/types/events";
import { CommandInteractionOptionResolver } from "discord.js";
import client from "src";

export default new Event({
  name: "interactionCreate",
  execute: (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    const options = interaction.options as CommandInteractionOptionResolver;

    command.execute({ client, interaction, options });
  },
});
