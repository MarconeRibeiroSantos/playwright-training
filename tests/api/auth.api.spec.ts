import { test, expect } from '@playwright/test';
import { getApiUrl } from '@helpers/urls';
import { generateTestUser } from '@helpers/users';

test.describe('API: Autenticação (/login) @api', () => {
  const apiUrl = getApiUrl();

  test('deve autenticar usuário com credenciais válidas e retornar token JWT @smoke', async ({ request }) => {
    // Arrange: Cadastra o usuário primeiro
    const user = generateTestUser();
    await request.post(`${apiUrl}/usuarios`, {
      data: {
        nome: user.name,
        email: user.email,
        password: user.password,
        administrador: 'false',
      },
    });

    // Act: Efetua login
    const response = await request.post(`${apiUrl}/login`, {
      data: {
        email: user.email,
        password: user.password,
      },
    });

    // Assert
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Login realizado com sucesso');
    expect(body.authorization).toBeDefined();
    expect(body.authorization).toMatch(/^Bearer\s.+/);
  });

  test('deve rejeitar autenticação com senha incorreta (401) @regression', async ({ request }) => {
    // Arrange: Cadastra o usuário
    const user = generateTestUser();
    await request.post(`${apiUrl}/usuarios`, {
      data: {
        nome: user.name,
        email: user.email,
        password: user.password,
        administrador: 'false',
      },
    });

    // Act
    const response = await request.post(`${apiUrl}/login`, {
      data: {
        email: user.email,
        password: 'SenhaTotalmenteIncorreta999',
      },
    });

    // Assert
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toBe('Email e/ou senha inválidos');
  });

  test('deve validar obrigatoriedade dos campos de email e senha (400) @regression', async ({ request }) => {
    // Act: Envia payload vazio
    const response = await request.post(`${apiUrl}/login`, {
      data: {},
    });

    // Assert
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.email).toBe('email é obrigatório');
    expect(body.password).toBe('password é obrigatório');
  });
});
