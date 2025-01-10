import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import EnvironmentVariables from "@configs/EnvironmentVariables";
import {
  CommandType,
  ComponentsButton,
  ComponentsModal,
  ComponentsSelect,
} from "@structures/types/commands";
import Logging from "./Logging";
import path from "path";
import fs from "fs";
import { EventTypes } from "@structures/types/events";
import { isDev } from "@utilities/isDev";

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
    this.registerModules();
    this.registerEvents();
    this.login(EnvironmentVariables.DISCORD_TOKEN);
  }

  private registerCommands(commands: Array<ApplicationCommandDataResolvable>) {
    this.application?.commands
      .set(commands)
      .then(() => {
        Logging.success("Commands registered!");
      })
      .catch((err) => Logging.error(`Error  on registering commands: ${err}`));
  }

  private getFilterFiles() {
    return (file: string) => file.endsWith(".ts") || file.endsWith(".js");
  }

  private registerModules() {
    const slashCommands: Array<ApplicationCommandDataResolvable> = [];

    const commandsPath = path.join(__dirname, "..", "commands");

    fs.readdirSync(commandsPath)
      .filter((folder) => (isDev ? true : !folder.endsWith("development")))
      .forEach((directory) => {
        fs.readdirSync(commandsPath + "/" + directory)
          .filter(this.getFilterFiles)
          .forEach(async (file) => {
            const commands: CommandType = (
              await import(`@commands/${directory}/${file}`)
            )?.default;

            const { name, buttons, selects, modals } = commands;

            if (name) {
              this.commands.set(name, commands);
              slashCommands.push(commands);

              if (buttons) {
                buttons.forEach((execute, key) =>
                  this.buttons.set(key, execute),
                );
              }

              if (selects) {
                selects.forEach((execute, key) =>
                  this.select.set(key, execute),
                );
              }

              if (modals) {
                modals.forEach((execute, key) => this.modals.set(key, execute));
              }
            }
          });
      });

    this.on("ready", () => this.registerCommands(slashCommands));
  }

  private registerEvents() {
    const eventsPath = path.join(__dirname, "..", "events");

    fs.readdirSync(eventsPath).forEach((directory) => {
      fs.readdirSync(`${eventsPath}/${directory}`)
        .filter(this.getFilterFiles)
        .forEach(async (file) => {
          const event: EventTypes<keyof ClientEvents> = (
            await import(`@events/${directory}/${file}`)
          )?.default;

          const { name, once, execute } = event;

          try {
            if (name) {
              void (once ? this.once(name, execute) : this.on(name, execute));
            }
          } catch (error) {
            Logging.error(`Error on registering event ${name}: ${error}`);
          }
        });
    });

    Logging.success("Events registered!");
  }
}
