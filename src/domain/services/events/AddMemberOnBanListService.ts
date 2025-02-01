import {
  AutoBanRepository,
  IAutoBanRepository,
} from "@database/repositories/AutoBanRepository";
import { Logger } from "@logging/Logger";
import { isDev } from "@utils/IsDev";
import { inject, injectable } from "tsyringe";
import { LevelDB } from "@storage/level/Client";
import { GuildMember } from "discord.js";

export interface IListOfMemberBan {
  userId: string;
  date: Date;
}

@injectable()
export class AddMemberOnBanService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(AutoBanRepository) private db: AutoBanRepository,
    @inject(LevelDB) private storage: LevelDB,
  ) {}

  public async execute(interaction: GuildMember): Promise<void> {
    const guildId = interaction.guild.id;
    const configItem = await this.getAutoBanConfigForGuild(guildId);

    if (!configItem) return;

    if (!configItem.enabled) return;

    await this.setUserOnBanList(interaction, guildId);
  }

  private async setUserOnBanList(
    member: GuildMember,
    guildId: string,
  ): Promise<void> {
    const currentList = await this.storage.getData<IListOfMemberBan[]>(
      "members-to-ban",
      guildId,
    );

    const now = Date.now();

    if (currentList && currentList.length > 0) {
      const newList: IListOfMemberBan[] = [
        ...currentList,
        {
          userId: member.id,
          date: new Date(now),
        },
      ];

      await this.storage.setData<IListOfMemberBan[]>(
        "members-to-ban",
        guildId,
        newList,
      );

      if (isDev) {
        this.logger.info({
          prefix: "auto-ban",
          message: `Membro ${member.id} salvo na lista de ban existente`,
        });
      }
      return;
    }

    await this.storage.setData<IListOfMemberBan[]>("members-to-ban", guildId, [
      {
        userId: member.id,
        date: new Date(now),
      },
    ]);

    if (isDev) {
      this.logger.info({
        prefix: "auto-ban",
        message: `Membro ${member.id} salvo na lista de ban existente`,
      });
    }
  }

  private async getAutoBanConfigForGuild(
    guildId: string,
  ): Promise<IAutoBanRepository | null> {
    const config = await this.storage.getData<IAutoBanRepository>(
      "auto-ban",
      guildId,
    );

    if (config) {
      if (isDev) {
        this.logger.info({
          prefix: "auto-ban",
          message: `Configuração de auto-ban para o servidor ${guildId} encontrada. localmente.`,
        });
      }
      return config;
    }

    const autoBanConfig = await this.db.getAutoBanConfig(guildId);
    return autoBanConfig[0] as IAutoBanRepository;
  }
}
