declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    DISCORD_TOKEN: string;
    DATABASE_URL: string;
  }
}
