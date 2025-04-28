import { Logger } from "@logging/Logger";
import { isDev } from "@utils/IsDev";
import { GuildMember } from "discord.js";
import { inject, injectable } from "tsyringe";

@injectable()
export class WelcomeMessageChatService {
  constructor(@inject(Logger) private logger: Logger) {}

  async execute(interaction: GuildMember): Promise<void> {
    try {
      const imagePath = isDev
        ? "./src/assets/images/all-channels.png"
        : "./dist/assets/images/all-channels.png";

      const welcomeMessage =
        `A Núcleo 42 dá as boas-vindas a você, **${interaction.user.username}**! \n\n` +
        `**Esta é uma mensagem de orientação para te ajudar a se localizar no nosso servidor:**\n\n` +
        `1. Faça uma breve apresentação no canal: https://discord.com/channels/1242113182126833805/1322243132376481836 \n` +
        `2. Leia o nosso guia de onboarding para entender como tudo funciona: https://discord.com/channels/1242113182126833805/1327716961051869205 \n` +
        `3. Ative a opção **Mostrar todos os canais** para acessar todo o conteúdo:\n` +
        `   - Clique no nome **Núcleo 42** no canto superior esquerdo.\n` +
        `   - Depois, selecione **Mostrar todos os canais**.\n\n`;

      await interaction.send(welcomeMessage);
      await interaction.send({
        files: [imagePath],
      });

      if (isDev) {
        this.logger.info({
          prefix: "welcome-message",
          message: `Enviando mensagem de boas-vindas para o membro ${interaction.user.username}`,
        });
      }
    } catch (error) {
      if (isDev) {
        this.logger.error({
          prefix: "welcome-message",
          message: `Erro ao enviar mensagem de boas-vindas para o membro ${interaction.user.username}: ${error}`,
        });
      }
    }
  }
}
