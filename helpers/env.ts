/**
 * Helper para gerenciamento seguro e estrito de variáveis de ambiente.
 * Garante que valores ausentes falhem imediatamente de forma legível.
 */
export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}
