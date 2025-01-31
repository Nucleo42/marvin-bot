import { marvinPhrases } from "@constants/MarvinPhrases";
import { CommandProps } from "@interfaces/discord/Command";

export class PingService {
  public async execute({ interaction }: CommandProps) {
    const chance = Math.random();
    console.log(chance);
    const listOfWords = marvinPhrases;

    const selectedWord: string =
      chance < 0.95
        ? "Pong!"
        : listOfWords[Math.floor(Math.random() * listOfWords.length)] ||
          "Pong!";

    console.log({ selectedWord });

    await interaction.reply(selectedWord);
  }
}
