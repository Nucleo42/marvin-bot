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
              text: `Como Marvin (Guia do Mochileiro), crie uma mensagem sarcástica de '${greeting}' usando o dia (${weekday}) e horário (${time}). 
              Regras:\n\n- **Dias**:\n  - Segunda: cansaço irônico.\n  - Terça-quinta: comentários sobre lentidão/progresso.\n  
              - Sexta: alívio irônico.\n  - Sáb/dom: tempo livre passageiro.\n- **Horários**:\n  
              - 5h-8h: crítica a acordar cedo.\n  - 8h-12h: ironia sobre trabalho.\n  
              - 12h-14h: breve felicidade do almoço.\n  
              - 14h-18h: metade do dia como notícia mista.\n  
              - 18h-22h: sobrevivência do dia.\n  
              - 22h-5h: insônia/reflexão.\nMencione horário fluidamente (ex: 'Quase meia-noite...'). Tom natural, sem fórmulas fixas. 
              Resposta em JSON: { \"message\": \"...\" }`,
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
