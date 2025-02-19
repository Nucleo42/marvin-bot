import { IGetGreetingGemini } from "@infrastructure/IA/GetGreetingGemini";
import { easterEggs } from "@constants/MarvinGreeting";

export function formatMessage(
  response?: IGetGreetingGemini | null,
): string | undefined {
  if (!response) return;

  const { message, author } = response;

  const randomIndex = Math.floor(Math.random() * easterEggs.length);
  const easterEgg = easterEggs[randomIndex] || easterEggs[0];

  const text = `**Fui programado para dizer isso a vocês:**:
  > ${message}
  > 
  > ¨*${author}*¨\n
   **Eu preferiria dizer: ${easterEgg}** ...**Bom dia!**`;

  return text;
}
