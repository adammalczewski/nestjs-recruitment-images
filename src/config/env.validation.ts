export function validate(config: Record<string, unknown>) {
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'PORT',
    'MINIO_ENDPOINT',
    'MINIO_PORT',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
    'MINIO_BUCKET',
  ];

  for (const key of requiredVars) {
    if (!config[key]) {
      throw new Error(`Environment variable ${key} is missing`);
    }
  }

  const port = Number(config['PORT']);
  if (isNaN(port)) {
    throw new Error('Environment variable PORT must be a number');
  }

  const dbPort = Number(config['DB_PORT']);
  if (isNaN(dbPort)) {
    throw new Error('Environment variable DB_PORT must be a number');
  }

  return config;
}
