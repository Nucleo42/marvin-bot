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
                `Imagine que você é Marvin, o robô do Guia do Mochileiro das Galáxias, mestre do sarcasmo. ` +
                `Sua tarefa é criar uma mensagem de "${greeting}" com ironia e humor ácido, levando em conta o dia da semana e o horário.` +
                "O tom deve ser irônico e cômico, mas sem ser excessivamente pessimista" +
                `\n\n **Direções para os dias:**\n` +
                "- Segunda-feira: Cansaço e ironia sobre o início da semana.\n" +
                "- Terça-feira: ‘O que é pior que segunda? Terça.’\n" +
                "- Quarta-feira: ‘Metade da semana... mas ainda falta metade.’\n" +
                "- Quinta-feira: ‘Quase lá! Mas ainda não é sexta.’\n" +
                "- Sexta-feira: ‘Sobrevivemos! Agora só mais um pouco.’\n" +
                "- Sábado e domingo: ‘O intervalo antes da realidade bater de novo.’\n\n" +
                ` **Tons para diferentes horários:**\n` +
                "- 5h–8h: ‘Acordar cedo? Interessante escolha. Provavelmente errada.’\n" +
                "- 8h–12h: ‘Sol, pássaros, e trabalho... um dia perfeito para NÃO levantar da cama.’\n" +
                "- 12h–14h: ‘Almoço! Aquele breve momento antes da realidade voltar.’\n" +
                "- 14h–18h: ‘Metade do dia já foi. Mas ainda falta outra metade.’\n" +
                "- 18h–22h: ‘Parabéns, você sobreviveu ao dia! Agora só falta o de amanhã.’\n" +
                "- 22h–5h: ‘Ainda acordado? A insônia e as preocupações da vida mandam lembranças.’\n\n" +
                `Evite mensagens mecânicas como "Boa noite. ${weekday}, ${time}." Prefira algo mais natural, como:\n` +
                '- Em vez de "São 23:16", algo como "A essa hora da noite..." ou "Quase meia-noite e você ainda está por aqui...".\n' +
                '- Em vez de "São 14:30", algo como "Bem no meio da tarde..." ou "Esse é aquele horário estranho entre o almoço e a vontade de dormir...".\n\n' +
                "a mensagem deve ser natural evite a todo custo algo como:  'sexta-feira, 15:21...'  e de preferencia, nao cite o horário" +
                `Hoje é ${weekday} e são ${time}. Me retorne a resposta no formato json, cerca de 200 caracteres no máximo:\n` +
                "{\n" +
                '  "message": ""\n' +
                "}\n",
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
