import { Logger } from "@logging/Logger";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { inject, injectable } from "tsyringe";

@injectable()
export class DatabaseConnection {
  private bd: ReturnType<typeof drizzle>;
  private pool: Pool;

  constructor(@inject(Logger) private logger: Logger) {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async start() {
    if (!this.bd) {
      this.bd = drizzle(this.pool);

      try {
        await this.bd.execute(sql`SELECT 1`);
        this.logger.success({
          message: "Conexão com o banco de dados estabelecida",
          prefix: "Database",
        });
      } catch (error) {
        this.logger.error(
          {
            message: "Erro ao tentar conectar ao banco de dados",
            prefix: "Database",
          },
          error,
        );
        throw error;
      }
    }
  }

  async stop() {
    await this.pool.end();
    this.logger.info({
      message: "Conexão com o banco de dados encerrada",
      prefix: "Database",
    });
  }

  getBd() {
    if (!this.bd) {
      throw new Error("Banco de dados nao iniciado. Chame start() primeiro");
    }
    return this.bd;
  }
}
