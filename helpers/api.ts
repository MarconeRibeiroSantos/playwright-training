import { APIRequestContext } from '@playwright/test';
import { getApiUrl } from '@helpers/urls';
import { generateTestUser, TestUser } from '@helpers/users';

export interface AuthResponse {
  message: string;
  authorization: string;
}

export interface ProductPayload {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

/**
 * Cria e autentica um usuário via API, retornando o token de autorização Bearer.
 */
export async function createAndAuthenticateUser(
  request: APIRequestContext,
  options: { isAdmin?: boolean } = {}
): Promise<{ user: TestUser; token: string }> {
  const apiUrl = getApiUrl();
  const user = generateTestUser(options);

  // 1. Cadastra o usuário via API
  const regResponse = await request.post(`${apiUrl}/usuarios`, {
    data: {
      nome: user.name,
      email: user.email,
      password: user.password,
      administrador: user.isAdmin ? 'true' : 'false',
    },
  });

  if (!regResponse.ok()) {
    const errorBody = await regResponse.text();
    throw new Error(`Failed to create test user via API: ${errorBody}`);
  }

  // 2. Realiza o login para obter o Bearer token
  const loginResponse = await request.post(`${apiUrl}/login`, {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  if (!loginResponse.ok()) {
    const errorBody = await loginResponse.text();
    throw new Error(`Failed to authenticate test user via API: ${errorBody}`);
  }

  const authData: AuthResponse = await loginResponse.json();
  return { user, token: authData.authorization };
}

/**
 * Gera dados únicos para criação de produtos de teste.
 */
export function generateTestProduct(prefix = 'Produto'): ProductPayload {
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    nome: `${prefix} QA ${uniqueId}`,
    preco: Math.floor(Math.random() * 500) + 10,
    descricao: `Descrição detalhada do ${prefix} para testes automatizados`,
    quantidade: Math.floor(Math.random() * 50) + 5,
  };
}
