import { Command } from "@interfaces/discord/Command";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import { container } from "tsyringe";
import { getProjectSlotsGemini } from "@infrastructure/IA/GetProjectSlotsGemini";

export default new Command({
  name: "test-ia",
  description: "testa a conexão a IA",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "message",
      description: "Mensagem para testar a IA",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  execute: async ({ interaction }) => {
    if (!interaction.isChatInputCommand()) return;
    const message = interaction.options.getString("message", true);

    await interaction.deferReply();

    const getProjectSlots = container.resolve(getProjectSlotsGemini);

    const response = await getProjectSlots.get(message);

    if (response) {
      console.log(response);
    }

    await interaction.editReply({
      content: "aguardando resposta da IA",
    });
  },
});
