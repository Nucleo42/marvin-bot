import { Logger } from "@logging/Logger";
import { Level } from "level";
import { inject, injectable } from "tsyringe";

interface DataWrapper<T> {
  type: string;
  value: T;
}

@injectable()
export class LevelDB {
  private db: Level<string, unknown>;

  constructor(
    @inject("dbPath") dbPath: string,
    @inject(Logger) private logger: Logger,
  ) {
    this.db = new Level(dbPath, { valueEncoding: "json" });
  }

  async setData<T>(collection: string, key: string, value: T): Promise<void> {
    try {
      const wrappedData: DataWrapper<T> = {
        type: typeof value,
        value: value,
      };

      const fullKey = `${collection}:${key}`;
      await this.db.put(fullKey, wrappedData);
    } catch (err) {
      this.logger.error({
        prefix: "LevelDB",
        message: `Error ao salvar  dados  na collection: "${collection}", key: "${key}"`,
        error: err,
      });

      throw err;
    }
  }

  async getData<T>(collection: string, key: string): Promise<T | null> {
    try {
      const fullKey = `${collection}:${key}`;
      const data = (await this.db.get(fullKey)) as DataWrapper<T>;

      if (!data?.value) return null;

      return data?.value;
    } catch (err) {
      if (err.notFound) {
        this.logger.error({
          prefix: "LevelDB",
          message: `Dados não encontrado na  collection: "${collection}", key: "${key}"`,
        });

        return null;
      } else {
        this.logger.error({
          prefix: "LevelDB",
          message: `Error ao recuperar dados na collection: "${collection}", key: "${key}"`,
          error: err,
        });

        throw err;
      }
    }
  }

  async delete(collection: string, key: string): Promise<void> {
    try {
      const fullKey = `${collection}:${key}`;
      await this.db.del(fullKey);
    } catch (err) {
      this.logger.error({
        prefix: "LevelDB",
        message: `Error ao deletar dados na collection: "${collection}", key: "${key}"`,
        error: err,
      });

      throw err;
    }
  }

  async listKeys(collection: string): Promise<string[]> {
    const keys: string[] = [];
    try {
      for await (const key of this.db.keys()) {
        if (key.startsWith(`${collection}:`)) {
          keys.push(key.split(":")[1] as string);
        }
      }
      return keys;
    } catch (err) {
      this.logger.error({
        prefix: "LevelDB",
        message: `Error ao listar chaves na collection: "${collection}"`,
        error: err,
      });
      throw err;
    }
  }
}
