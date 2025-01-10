import { Command } from "@structures/types/commands";
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  Collection,
} from "discord.js";

export default new Command({
  name: "button",
  description: "A command for testing buttons",
  type: ApplicationCommandType.ChatInput,
  execute: async ({ interaction }) => {
    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          customId: "button-test",
          label: "Click me!",
          style: ButtonStyle.Primary,
        }),
      ],
    });

    await interaction.reply({
      content: "Click the button!",
      components: [row],
    });
  },
  buttons: new Collection([
    [
      "button-test",
      async (interaction) => {
        await interaction.reply("Button clicked!");
      },
    ],
  ]),
});
