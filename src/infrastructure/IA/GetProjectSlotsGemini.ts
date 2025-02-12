import { inject, injectable } from "tsyringe";
import { GeminiIA } from "./Gemini";
import { parseApiTextFromJson } from "@utils/parseApiTextJson";
import { IApiGeminiResponse as ApiResponse } from "@interfaces/GeminiResponse";

interface Slot {
  name: "front-end" | "back-end" | "design" | "dados" | "mobile";
  qtd: number;
}

interface IProjectSlots {
  slots: Slot[];
  isAffirmative: "true" | "false";
  affirmativeType: string | null;
}
@injectable()
export class getProjectSlotsGemini {
  constructor(@inject(GeminiIA) private readonly gemini: GeminiIA) {}

  public async get(message: string): Promise<IProjectSlots | null> {
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                "A mensagem a seguir contém as vagas disponíveis junto com a descrição do projeto.\n" +
                "Algumas vagas podem conter informações sobre ações afirmativas, como:\n" +
                '- "Afirmativa para mulheres"\n' +
                '- "Afirmativa para LGBTQIA+"\n' +
                "- Entre outras.\n\n" +
                "Inclua essa informação no JSON de resposta caso esteja presente na mensagem.\n\n" +
                "**Exemplo de entrada:**\n" +
                '"Preciso de 2 front-end, 3 back-end, 1 design e 1 dados. Afirmativa para mulheres."\n\n' +
                "Além disso, algumas vagas podem estar mencionadas no formato:\n" +
                '- "2 @Vagas para front-end"\n' +
                '- "3 @Vagas para back-end"\n\n' +
                'Essas menções representam vagas e devem ser convertidas da mesma forma que se tivessem sido escritas explicitamente, como "1 vaga para back-end".\n\n' +
                'Caso tenha algo como "@Vagas back-end"  no final do texto, ou no começo, sem por exemplo "1 @Vagas back-end" ou algo semelhante, ignore.\n\n' +
                "Se encontrar algo como Back-end e backend, ou back end e ...etc considere a mesma coisa, isso para todos os campos .\n\n" +
                'seguir o exemplo listado abaixo, por exemplo: se tiver "vaga para ux/ui" faça o json com "design" o mesmo para os outros campos \n' +
                "Caso a mensagem não contenha menções a vagas, retorne um JSON vazio.\n\n" +
                "Formato esperado do JSON de resposta:\n" +
                "{\n" +
                '  "slots": [\n' +
                '    { "name": "front-end", "qtd": 2 },\n' +
                '    { "name": "back-end", "qtd": 3 },\n' +
                '    { "name": "design", "qtd": 1 },\n' +
                '    { "name": "dados", "qtd": 1 }\n' +
                '    { "name": "mobile", "qtd": 1 }\n' +
                "  ],\n" +
                '  "isAffirmative": "true",\n' +
                '  "affirmativeType": "mulheres"\n' +
                "}\n\n" +
                "Entrada para análise:\n" +
                `"${message}"`,
            },
          ],
        },
      ],
    });

    const response = (await this.gemini.fetchAPI(body)) as ApiResponse;

    const text = response?.candidates[0]?.content?.parts[0]?.text;

    if (!text) return null;

    const parsed = parseApiTextFromJson(text);

    return parsed as IProjectSlots;
  }
}
