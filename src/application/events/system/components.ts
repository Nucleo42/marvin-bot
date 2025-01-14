import { container } from "tsyringe";
import { Event } from "@interfaces/events/event";
import { ClientDiscord } from "@discord/client";

export default new Event({
  name: "interactionCreate",
  execute: (interaction) => {
    if (
      !interaction.isModalSubmit() &&
      !interaction.isButton() &&
      !interaction.isStringSelectMenu()
    )
      return;

    const client = container.resolve(ClientDiscord);

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
