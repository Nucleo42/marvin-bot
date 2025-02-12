import { inject, injectable } from "tsyringe";
import { GeminiIA } from "./Gemini";
import { parseApiTextFromJson } from "@utils/parseApiTextJson";
import { IApiGeminiResponse } from "@interfaces/GeminiResponse";
import { getDayAndTime } from "@utils/getDayAndTime";

export interface IGetGreetingGemini {
  message: string;
}

@injectable()
export class GetGreetingGemini {
  constructor(@inject(GeminiIA) private readonly gemini: GeminiIA) {}

  public async get(): Promise<IGetGreetingGemini | null> {
    const { weekday, time, hour } = getDayAndTime();

    const greeting = this.getGreeting(hour);

    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                "Imagine que você é o Marvin, o robô do Guia do Mochileiro das Galáxias, conhecido por seu sarcasmo e humor ácido." +
                `Sua tarefa é criar uma mensagem de "${greeting}" com seu tom sarcástico característico, levando em conta o dia da semana e o horário.` +
                "O tom deve ser irônico e cômico, mas sem ser excessivamente pessimista. Deve fazer piadas sobre o dia e o horário, sem soar mecânico.\n\n" +
                "Aqui estão algumas direções:\n" +
                "- Segunda-feira: 'Ah, segunda-feira... aquele dia que insiste em existir.'\n" +
                "- Terça-feira: 'Sabe o que é pior que segunda? Terça. Porque ainda falta muito para o fim de semana.'\n" +
                "- Quarta-feira: 'Meio da semana... se fosse uma maratona, você só teria corrido a primeira metade.'\n" +
                "- Quinta-feira: 'Quase lá! Mas 'quase' ainda não é sexta, né?'\n" +
                "- Sexta-feira: 'Sobrevivemos até aqui! Agora é só aguentar mais um pouco.'\n" +
                "- Sábado e domingo: 'Final de semana! Ou como eu chamo: o curto intervalo antes da realidade bater novamente.'\n\n" +
                "Além disso, o horário também afeta o tom:\n" +
                "- Das 5h às 8h: 'Acordar cedo? Interessante escolha. Provavelmente errada.'\n" +
                "- Das 8h às 12h: 'O sol está brilhando, os pássaros estão cantando... e você tem que trabalhar. Divirta-se.'\n" +
                "- Das 12h às 14h: 'Hora do almoço! Esse breve momento de felicidade antes da realidade voltar com tudo.'\n" +
                "- Das 14h às 18h: 'A boa notícia: metade do dia já foi. A má notícia: ainda tem outra metade.'\n" +
                "- Das 18h às 22h: 'Parabéns, você sobreviveu ao dia! Agora só precisa sobreviver ao de amanhã.'\n" +
                "- Das 22h às 5h: 'Ainda acordado? Bom, pelo menos você não está sozinho. A insônia e as preocupações da vida também estão aqui.'\n\n" +
                `Hoje é ${weekday} e são ${time}, mas eu sei que isso não faz muita diferença para você.` +
                "Agora gere uma mensagem apropriada para esse contexto de forma natural e evite algo como 'Boa noite. Terça-feira, 22:33. '.\n" +
                "Me retorne a resposta no seguinte formato JSON:\n" +
                "{\n" +
                '  "message": ""\n' +
                "}\n\n",
            },
          ],
        },
      ],
    });

    const response = (await this.gemini.fetchAPI(body)) as IApiGeminiResponse;

    const text = response?.candidates[0]?.content?.parts[0]?.text;

    if (!text) return null;

    const parsed = parseApiTextFromJson(text);

    return parsed as IGetGreetingGemini;
  }

  private getGreeting(hour: number = 6) {
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    if (hour >= 18 || hour < 5) return "Boa noite";
    return "Olá";
  }
}
