// Infrastructure configuration ONLY - no provider API keys here
// Provider API keys are stored in DB (provider_configs table)

export interface AppConfig {
  nodeEnv: string;
  port: number;
  // Database connections (infra only)
  databaseUrl: string;
  mongodbUrl: string;
  redisUrl: string;
  elasticsearchUrl: string;
  // App secrets
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  encryptionKey: string; // For encrypting provider API keys in DB
  // CORS
  frontendUrl: string;
  adminUrl: string;
  // Google OAuth (optional)
  googleClientId?: string;
  googleClientSecret?: string;
  googleCallbackUrl?: string;
}

export default (): AppConfig => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  databaseUrl: process.env['DATABASE_URL'] ?? 'postgresql://localedge:localedge@localhost:5432/localedge',
  mongodbUrl: process.env['MONGODB_URL'] ?? 'mongodb://localedge:localedge@localhost:27017/localedge',
  redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  elasticsearchUrl: process.env['ELASTICSEARCH_URL'] ?? 'http://localhost:9200',
  jwtSecret: process.env['JWT_SECRET'] ?? 'change-this-secret',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  refreshTokenSecret: process.env['REFRESH_TOKEN_SECRET'] ?? 'change-this-refresh-secret',
  refreshTokenExpiresIn: process.env['REFRESH_TOKEN_EXPIRES_IN'] ?? '30d',
  encryptionKey: process.env['ENCRYPTION_KEY'] ?? 'change-this-32-char-encryption-key!',
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  adminUrl: process.env['ADMIN_URL'] ?? 'http://localhost:3002',
  googleClientId: process.env['GOOGLE_CLIENT_ID'],
  googleClientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  googleCallbackUrl: process.env['GOOGLE_CALLBACK_URL'],
});
