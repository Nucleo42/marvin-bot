import { Command } from "@interfaces/discord/Command";
import { ApplicationCommandType, MessageFlags } from "discord.js";
import { container } from "tsyringe";
import { GetGreetingGemini } from "@infrastructure/IA/GetGreetingGemini";
import { formatMessage } from "@utils/formatMessage";

export default new Command({
  name: "test-greeting",
  description: "Comando de teste de saudação",
  type: ApplicationCommandType.ChatInput,
  execute: async ({ interaction }) => {
    if (!interaction.isChatInputCommand()) return;

    const getGreetingGemini = container.resolve(GetGreetingGemini);

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const greeting = await getGreetingGemini.get();

    if (!greeting) {
      await interaction.editReply("Não foi possível obter a saudação");
      return;
    }

    console.log(greeting);

    const text = formatMessage(greeting) || "";

    await interaction.editReply(text);
  },
});
