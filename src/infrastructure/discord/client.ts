import { Client, GatewayIntentBits, Partials } from "discord.js";
import EnvironmentVariables from "@configs/EnvironmentVariables";

export class ClientDiscord extends Client {
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
