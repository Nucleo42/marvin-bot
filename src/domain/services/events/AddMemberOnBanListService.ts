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

  public async execute(member: GuildMember): Promise<void> {
    const guildId = member.guild.id;
    const config = await this.getAutoBanConfigForGuild(guildId);

    if (!this.isAutoBanEnabled(config)) {
      return;
    }

    await this.addMemberToBanList(member, guildId);
  }

  private isAutoBanEnabled(config: IAutoBanRepository | null): boolean {
    return config !== null && config.enabled === true;
  }

  private async addMemberToBanList(
    member: GuildMember,
    guildId: string,
  ): Promise<void> {
    const currentBanList = await this.getCurrentBanList(guildId);
    const updatedBanList = this.createUpdatedBanList(currentBanList, member);
    await this.saveBanList(guildId, updatedBanList);

    this.logBanListUpdate(member.id);
  }

  private async getCurrentBanList(
    guildId: string,
  ): Promise<IListOfMemberBan[]> {
    const currentList = await this.storage.getData<IListOfMemberBan[]>(
      "members-to-ban",
      guildId,
    );
    return currentList || [];
  }

  private createUpdatedBanList(
    currentList: IListOfMemberBan[],
    member: GuildMember,
  ): IListOfMemberBan[] {
    const newBanEntry: IListOfMemberBan = {
      userId: member.id,
      date: new Date(),
    };

    return [...currentList, newBanEntry];
  }

  private async saveBanList(
    guildId: string,
    banList: IListOfMemberBan[],
  ): Promise<void> {
    await this.storage.setData<IListOfMemberBan[]>(
      "members-to-ban",
      guildId,
      banList,
    );
  }

  private async getAutoBanConfigForGuild(
    guildId: string,
  ): Promise<IAutoBanRepository | null> {
    const localConfig = await this.getLocalAutoBanConfig(guildId);
    if (localConfig) {
      this.logLocalConfigFound(guildId);
      return localConfig;
    }

    const dbConfig = await this.getDbAutoBanConfig(guildId);
    return dbConfig[0] as IAutoBanRepository;
  }

  private async getLocalAutoBanConfig(
    guildId: string,
  ): Promise<IAutoBanRepository | null> {
    return await this.storage.getData<IAutoBanRepository>("auto-ban", guildId);
  }

  private async getDbAutoBanConfig(
    guildId: string,
  ): Promise<IAutoBanRepository[]> {
    return (await this.db.getAutoBanConfig(guildId)) as IAutoBanRepository[];
  }

  private logLocalConfigFound(guildId: string): void {
    if (isDev) {
      this.logger.debug({
        prefix: "auto-ban",
        message: `Configuração de auto-ban para o servidor ${guildId} encontrada localmente.`,
      });
    }
  }

  private logBanListUpdate(memberId: string): void {
    if (isDev) {
      this.logger.debug({
        prefix: "auto-ban",
        message: `Membro ${memberId} salvo na lista de ban existente`,
      });
    }

    this.logger.debug({
      prefix: "auto-ban",
      message: `Membro adicionado à lista de banimento`,
    });
  }
}
