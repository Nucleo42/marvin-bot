import { Event } from "@interfaces/discord/Event";
import { CommandInteractionOptionResolver } from "discord.js";
import { ClientDiscord } from "@discord/client";
import { container } from "tsyringe";

export default new Event({
  name: "interactionCreate",
  execute: (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const client = container.resolve(ClientDiscord);

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    const options = interaction.options as CommandInteractionOptionResolver;

    command.execute({ client, interaction, options });
  },
});
