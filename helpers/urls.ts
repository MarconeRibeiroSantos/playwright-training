import { getEnv } from '@helpers/env';

/**
 * Resolução centralizada de URLs por ambiente.
 * Bloqueia execuções acidentais contra o ambiente de produção sem a flag explícita ALLOW_PROD=1.
 */
export function getBaseUrl(): string {
  const env = process.env.TEST_ENV || 'dev';
  
  if (env === 'prod' && process.env.ALLOW_PROD !== '1') {
    throw new Error(
      'Execution against PROD is blocked by default. Set ALLOW_PROD=1 to explicitly allow running against production.'
    );
  }

  return process.env.BASE_URL || 'https://front.serverest.dev';
}

export function getApiUrl(): string {
  return process.env.API_URL || 'https://serverest.dev';
}
