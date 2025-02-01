import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import EnvironmentVariables from "@configs/EnvironmentVariables";
import {
  CommandType,
  ComponentsButton,
  ComponentsModal,
  ComponentsSelect,
} from "@interfaces/discord/Command";

import { injectable } from "tsyringe";

@injectable()
export class ClientDiscord extends Client {
  public commands: Collection<string, CommandType> = new Collection();
  public buttons: ComponentsButton = new Collection();
  public select: ComponentsSelect = new Collection();
  public modals: ComponentsModal = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User,
      ],
    });
  }

  async start() {
    await this.login(EnvironmentVariables.DISCORD_TOKEN);
  }
}
