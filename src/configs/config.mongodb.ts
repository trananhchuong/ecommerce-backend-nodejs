interface AppConfig {
  app: {
    port: number | string;
  };
  db: {
    host: string;
    port: number | string;
    name: string;
  };
}

const dev: AppConfig = {
  app: {
    port: process.env.DEV_APP_PORT || 3003,
  },
  db: {
    host: process.env.DEV_DB_HOST || "localhost",
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || "shopDEV",
  },
};

const pro: AppConfig = {
  app: {
    port: process.env.PRO_APP_PORT || 3000,
  },
  db: {
    host: process.env.PRO_DB_HOST || "localhost",
    port: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || "shopPRO",
  },
};

const config: Record<string, AppConfig> = { dev, pro };

const env = process.env.NODE_ENV || "dev";

export default config[env];
