import client from "src";
import { Event } from "@structures/types/events";

export default new Event({
  name: "interactionCreate",
  execute: (interaction) => {
    if (interaction.isModalSubmit()) {
      client.modals.get(interaction.customId)?.(interaction);
    }

    if (interaction.isButton()) {
      client.buttons.get(interaction.customId)?.(interaction);
    }

    if (interaction.isStringSelectMenu()) {
      client.select.get(interaction.customId)?.(interaction);
    }
  },
});
