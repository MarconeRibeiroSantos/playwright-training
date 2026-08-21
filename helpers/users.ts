import { getEnv } from '@helpers/env';

export interface TestUser {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

/**
 * Senha padrão para novos usuários transitórios/gerados em tempo de execução.
 * Pode ser configurada no ~/.zshrc, .env ou GitHub Secrets via TEST_USER_PASSWORD.
 */
const DEFAULT_PASSWORD = process.env.TEST_USER_PASSWORD || 'Teste@123456';

/**
 * 1. Pool de Usuários Fixos / Pré-existentes no ambiente.
 * As credenciais residem exclusivamente nas variáveis de ambiente.
 */
export const fixedUsers = {
  get admin(): TestUser {
    return {
      name: 'Administrador Pre-configurado',
      email: getEnv('ADMIN_EMAIL'),
      password: getEnv('ADMIN_PASSWORD'),
      isAdmin: true,
    };
  },
  get standard(): TestUser {
    return {
      name: 'Usuário Padrão Pre-configurado',
      email: getEnv('USER_EMAIL'),
      password: getEnv('USER_PASSWORD'),
      isAdmin: false,
    };
  },
};

/**
 * 2. Fábrica de Usuários Temporários para testes de fluxo de Cadastro.
 */
export function generateTestUser(options: { isAdmin?: boolean; prefix?: string; password?: string } = {}): TestUser {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const rolePrefix = options.isAdmin ? 'admin' : 'user';
  const prefix = options.prefix || rolePrefix;

  return {
    name: `${options.isAdmin ? 'Administrador' : 'Usuário'} QA ${uniqueSuffix}`,
    email: `${prefix}_${uniqueSuffix}@teste.com`,
    password: options.password || DEFAULT_PASSWORD,
    isAdmin: options.isAdmin ?? false,
  };
}
