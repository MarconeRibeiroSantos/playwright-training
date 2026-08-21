import { test, expect } from '@playwright/test';
import { getApiUrl } from '@helpers/urls';
import { createAndAuthenticateUser, generateTestProduct } from '@helpers/api';

test.describe('API: Gestão de Produtos (/produtos) @api', () => {
  const apiUrl = getApiUrl();

  test('deve cadastrar um produto com sucesso usando token de administrador (201) @smoke', async ({ request }) => {
    // Arrange: Autentica como Administrador
    const { token } = await createAndAuthenticateUser(request, { isAdmin: true });
    const product = generateTestProduct();

    // Act
    const response = await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: token },
      data: product,
    });

    // Assert
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('Cadastro realizado com sucesso');
    expect(body._id).toBeDefined();
  });

  test('deve proibir cadastro de produto sem token de autenticação (401) @regression', async ({ request }) => {
    const product = generateTestProduct();

    const response = await request.post(`${apiUrl}/produtos`, {
      data: product,
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toBe('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  });

  test('deve proibir cadastro de produto por usuário não-administrador (403) @regression', async ({ request }) => {
    // Arrange: Autentica como Usuário Padrão
    const { token } = await createAndAuthenticateUser(request, { isAdmin: false });
    const product = generateTestProduct();

    // Act
    const response = await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: token },
      data: product,
    });

    // Assert
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.message).toBe('Rota exclusiva para administradores');
  });

  test('deve rejeitar cadastro de produto com nome duplicado (400) @regression', async ({ request }) => {
    const { token } = await createAndAuthenticateUser(request, { isAdmin: true });
    const product = generateTestProduct();

    // 1º cadastro
    await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: token },
      data: product,
    });

    // 2º cadastro duplicado
    const duplicateRes = await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: token },
      data: product,
    });

    expect(duplicateRes.status()).toBe(400);
    const body = await duplicateRes.json();
    expect(body.message).toBe('Já existe produto com esse nome');
  });

  test('deve validar obrigatoriedade e tipos numéricos dos campos (400) @regression', async ({ request }) => {
    const { token } = await createAndAuthenticateUser(request, { isAdmin: true });

    // Payload vazio
    const emptyRes = await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: token },
      data: {},
    });

    expect(emptyRes.status()).toBe(400);
    const emptyBody = await emptyRes.json();
    expect(emptyBody.nome).toBe('nome é obrigatório');
    expect(emptyBody.preco).toBe('preco é obrigatório');
    expect(emptyBody.descricao).toBe('descricao é obrigatório');
    expect(emptyBody.quantidade).toBe('quantidade é obrigatório');
  });
});
