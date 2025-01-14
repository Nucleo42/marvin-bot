import { promises as fs } from "fs";
import path from "path";
import { CommandType } from "@interfaces/commands/Command";
import { inject, injectable } from "tsyringe";
import { CommandHandler } from "@discord/handlers/CommandHandler";
import { Logger } from "@logging/logger";
import { ClientDiscord } from "@discord/client";
import { isDev } from "@utils/isDev";

@injectable()
export class CommandLoader {
  constructor(
    @inject("CommandsPath") private commandsPath: string,
    @inject(Logger) private logger: Logger,
    @inject(CommandHandler) private commandHandler: CommandHandler,
    @inject(ClientDiscord) private clientDiscord: ClientDiscord,
  ) {}

  private async loadCommands(): Promise<CommandType[]> {
    const commands: CommandType[] = [];

    async function readCommandsRecursively(dir: string): Promise<void> {
      const files = await fs.readdir(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
          if (!isDev && file.name === "development") continue;

          await readCommandsRecursively(fullPath);
        } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
          const command = await import(fullPath);

          if (command.default?.name && command.default?.execute) {
            commands.push(command.default);
          }
        }
      }
    }

    await readCommandsRecursively(this.commandsPath);
    return commands;
  }

  public async registerCommands(): Promise<void> {
    try {
      const commands = await this.loadCommands();

      for (const command of commands) {
        this.commandHandler.register(command);

        this.logger.info({
          prefix: "discord-command",
          message: `registrado o comando: ${command.name}`,
        });
      }

      this.logger.info({
        prefix: "discord-command",
        message: `Total de ${commands.length} comandos carregados`,
      });
      await this.applyCommands();
    } catch (error) {
      this.logger.error({
        prefix: "discord-command",
        message: "Erro ao carregar comandos:",
        error: error,
      });
    }
  }

  private async applyCommands() {
    const listOfCommands = this.commandHandler.getListOfSlashCommands();

    this.clientDiscord.on("ready", async () => {
      await this.clientDiscord.application?.commands.set(listOfCommands);

      this.logger.success({
        prefix: "discord-command",
        message: "Comandos aplicados com sucesso!",
      });
    });
  }
}
