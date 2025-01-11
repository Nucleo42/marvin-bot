import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export class Clientdrizzle {
  bd: ReturnType<typeof drizzle>;
  pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async start() {
    if (!this.bd) {
      this.bd = drizzle({ client: this.pool });
    }
  }

  async stop() {
    await this.pool.end();
  }
}
