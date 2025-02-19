import { inject, injectable } from "tsyringe";
import { GeminiIA } from "./Gemini";
import { parseApiTextFromJson } from "@utils/parseApiTextJson";
import { IApiGeminiResponse } from "@interfaces/GeminiResponse";

export interface IGetGreetingGemini {
  message: string;
  author: string;
}

@injectable()
export class GetGreetingGemini {
  constructor(@inject(GeminiIA) private readonly gemini: GeminiIA) {}

  public async get(): Promise<IGetGreetingGemini | null> {
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Forneça um texto inspirador de uma figura histórica influente, como por exemplo,  um filósofo ou um cientista ou líder ou escritor renomado e ...etc. 
              A citação deve ter no mínimo 200 caracteres e no  máximo 500 caracteres. Retorne a resposta estritamente no seguinte formato 
              JSON:\n\n{\n  "message": "",\n  "author": ""\n}\n\nNão adicione mais nada além desse JSON.`,
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
}
