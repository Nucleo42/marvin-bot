import { AutoBanRepository } from "@database/repositories/AutoBanRepository";
import { Logger } from "@logging/Logger";
import { isDev } from "@utils/IsDev";
import { Message, OmitPartialGroupDMChannel } from "discord.js";
import { inject, injectable } from "tsyringe";

@injectable()
export class ListenIntroductoryService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(AutoBanRepository) private db: AutoBanRepository,
  ) {}

  public async execute(
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
  ) {
    if (interaction.channel.isDMBased()) return;
    if (interaction.author.bot) return;

    const channel_id = interaction.channel.id;
    const guild_id = interaction.guild?.id;

    if (!guild_id) return;

    const config = await this.db.getAutoBanConfig(guild_id);

    const configItem = config[0];
    if (!configItem) return;

    const { channel_to_listen, channel_to_logger, enabled } = configItem;

    if (channel_id !== channel_to_listen) return;

    if (!enabled) return;

    const user = interaction.guild?.members.cache.get(interaction.author.id);

    if (!user) return;

    if (user.roles.cache.some((role) => role.name === "Admin")) return;

    if (channel_to_logger) {
      const loggerChannel =
        interaction.guild?.channels.cache.get(channel_to_logger);

      if (loggerChannel?.isSendable()) {
        await loggerChannel.send(
          `Usuário ${interaction.author.tag}  enviou  uma mensagem de apresentação no  canal ${interaction.channel.name}`,
        );
        return;
      }
    }

    if (interaction.content.length < 20) {
      const botMessage = await interaction.reply({
        content:
          "Sua mensagem de apresentação é muito curta, por favor, tente novamente!",
      });

      setTimeout(() => {
        interaction.delete();
        botMessage.delete();
      }, 7000);

      return;
    }

    const role = interaction.guild?.roles.cache.find(
      (role) => role.name === "verificado",
    );

    if (!role) return;

    await user.roles.add(role);

    const botMessage = await interaction.reply({
      content: "Você  foi registrado com sucesso!",
    });

    setTimeout(() => {
      botMessage.delete();
    }, 7000);

    if (isDev) {
      this.logger.info({
        prefix: "discord-core",
        message: `O usuário ${interaction.author.tag} foi registrado com sucesso!`,
      });
    }
  }
}
