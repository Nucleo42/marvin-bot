import { Level } from "level";

interface DataWrapper<T> {
  type: string;
  value: T;
}

export class LevelClient {
  private db: Level<string, unknown>;

  constructor(dbPath: string) {
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
      console.error(
        `Error saving data to collection: "${collection}", key: "${key}"\n`,
        err,
      );
      throw err;
    }
  }

  async getData<T>(collection: string, key: string): Promise<T | null> {
    try {
      const fullKey = `${collection}:${key}`;
      const data = (await this.db.get(fullKey)) as DataWrapper<T>;

      return data.value;
    } catch (err) {
      if (err.notFound) {
        console.error(
          `Data not found in collection: "${collection}", key: "${key}"`,
        );
        return null;
      } else {
        console.error(
          `Error retrieving data from collection: "${collection}", key: "${key}"\n`,
          err,
        );
        throw err;
      }
    }
  }

  async delete(collection: string, key: string): Promise<void> {
    try {
      const fullKey = `${collection}:${key}`;
      await this.db.del(fullKey);
    } catch (err) {
      console.error(
        `Error deleting data from collection: "${collection}", key: "${key}"`,
        err,
      );
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
      console.error(`Error listing keys in collection: "${collection}"\n`, err);
      throw err;
    }
  }
}
