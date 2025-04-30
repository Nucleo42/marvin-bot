import dotenv from "dotenv";
dotenv.config();

export default {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  BAN_JOB: {
    CRON_TIME: process.env.BAN_JOB_CRON_TIME,
    WAITING_TIME: process.env.BAN_JOB_WAITING_TIME,
  },
  GEMINI: {
    URL: process.env.GEMINI_URL,
    API_KEY: process.env.GEMINI_URL_API_KEY,
  },
  DM_MESSAGE_FEATURE: {
    CATEGORY_ID: process.env.DM_MESSAGE_FEATURE_CATEGORY_ID,
    ADMIN_ROLE_NAME: process.env.DM_MESSAGE_FEATURE_ADMIN_ROLE_NAME,
    MOD_ROLE_NAME: process.env.DM_MESSAGE_FEATURE_MOD_ROLE_NAME,
  },
};
