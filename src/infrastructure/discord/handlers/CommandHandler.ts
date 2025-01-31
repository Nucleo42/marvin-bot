import { ApplicationCommandDataResolvable } from "discord.js";
import { ClientDiscord } from "@discord/client";
import { injectable, inject } from "tsyringe";
import { CommandType } from "@interfaces/discord/Command";

@injectable()
export class CommandHandler {
  private slashCommands: Array<ApplicationCommandDataResolvable> = [];

  constructor(@inject(ClientDiscord) private client: ClientDiscord) {}

  public getListOfSlashCommands(): Array<ApplicationCommandDataResolvable> {
    return this.slashCommands;
  }

  public register(commands: CommandType): void {
    const { name, buttons, selects, modals } = commands;

    if (name) {
      this.client.commands.set(name, commands);
      this.slashCommands.push(commands);

      if (buttons) {
        buttons.forEach((execute, key) =>
          this.client.buttons.set(key, execute),
        );
      }

      if (selects) {
        selects.forEach((execute, key) => this.client.select.set(key, execute));
      }

      if (modals) {
        modals.forEach((execute, key) => this.client.modals.set(key, execute));
      }
    }
  }
}
