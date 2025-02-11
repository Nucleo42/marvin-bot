import { inject, injectable } from "tsyringe";
import configs from "@configs/EnvironmentVariables";
import { Logger } from "@logging/Logger";

const { API_KEY, URL } = configs.GEMINI;

@injectable()
export class GeminiIA {
  constructor(@inject(Logger) private logger: Logger) {}

  public async fetchAPI(body: string) {
    const request = await fetch(`${URL}?key=${API_KEY}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body,
    });

    if (request.status !== 200) {
      this.logger.error({
        prefix: "GeminiIA",
        message: "Ocorreu um erro ao tentar acessar a API do Gemini",
      });
    }

    return await request.json();
  }
}
