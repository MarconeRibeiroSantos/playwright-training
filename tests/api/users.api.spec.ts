import { test, expect } from '@playwright/test';
import { getApiUrl } from '@helpers/urls';
import { generateTestUser } from '@helpers/users';

test.describe('API: Gestão de Usuários (/usuarios) @api', () => {
  const apiUrl = getApiUrl();

  test('deve cadastrar um novo usuário com sucesso (201) @smoke', async ({ request }) => {
    const user = generateTestUser();

    const response = await request.post(`${apiUrl}/usuarios`, {
      data: {
        nome: user.name,
        email: user.email,
        password: user.password,
        administrador: 'true',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('Cadastro realizado com sucesso');
    expect(body._id).toBeDefined();
  });

  test('deve rejeitar cadastro com email já utilizado (400) @regression', async ({ request }) => {
    const user = generateTestUser();

    // 1º cadastro
    await request.post(`${apiUrl}/usuarios`, {
      data: {
        nome: user.name,
        email: user.email,
        password: user.password,
        administrador: 'false',
      },
    });

    // 2º cadastro com o mesmo email
    const duplicateResponse = await request.post(`${apiUrl}/usuarios`, {
      data: {
        nome: 'Outro Nome',
        email: user.email,
        password: 'OutraSenha123',
        administrador: 'false',
      },
    });

    expect(duplicateResponse.status()).toBe(400);
    const body = await duplicateResponse.json();
    expect(body.message).toBe('Este email já está sendo usado');
  });

  test('deve validar obrigatoriedade de todos os campos no cadastro (400) @regression', async ({ request }) => {
    const response = await request.post(`${apiUrl}/usuarios`, {
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.nome).toBe('nome é obrigatório');
    expect(body.email).toBe('email é obrigatório');
    expect(body.password).toBe('password é obrigatório');
    expect(body.administrador).toBe('administrador é obrigatório');
  });

  test('deve listar usuários cadastrados e permitir busca por ID (200) @regression', async ({ request }) => {
    // Cadastra um usuário para garantir que teremos pelo menos um registro
    const user = generateTestUser();
    const createRes = await request.post(`${apiUrl}/usuarios`, {
      data: {
        nome: user.name,
        email: user.email,
        password: user.password,
        administrador: 'false',
      },
    });
    const createdData = await createRes.json();
    const userId = createdData._id;

    // Busca o usuário específico por ID
    const getRes = await request.get(`${apiUrl}/usuarios/${userId}`);
    expect(getRes.status()).toBe(200);
    const getUserBody = await getRes.json();
    expect(getUserBody.nome).toBe(user.name);
    expect(getUserBody.email).toBe(user.email);
    expect(getUserBody._id).toBe(userId);
  });

  test('deve atualizar dados de um usuário via PUT (200) @regression', async ({ request }) => {
    // Cadastra usuário
    const user = generateTestUser();
    const createRes = await request.post(`${apiUrl}/usuarios`, {
      data: {
        nome: user.name,
        email: user.email,
        password: user.password,
        administrador: 'false',
      },
    });
    const { _id } = await createRes.json();

    // Atualiza nome
    const updatedName = `${user.name} Atualizado`;
    const putRes = await request.put(`${apiUrl}/usuarios/${_id}`, {
      data: {
        nome: updatedName,
        email: user.email,
        password: user.password,
        administrador: 'false',
      },
    });

    expect(putRes.status()).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.message).toBe('Registro alterado com sucesso');

    // Valida alteração
    const verifyRes = await request.get(`${apiUrl}/usuarios/${_id}`);
    const verifyBody = await verifyRes.json();
    expect(verifyBody.nome).toBe(updatedName);
  });

  test('deve excluir um usuário via DELETE (200) @regression', async ({ request }) => {
    // Cadastra usuário
    const user = generateTestUser();
    const createRes = await request.post(`${apiUrl}/usuarios`, {
      data: {
        nome: user.name,
        email: user.email,
        password: user.password,
        administrador: 'false',
      },
    });
    const { _id } = await createRes.json();

    // Deleta usuário
    const deleteRes = await request.delete(`${apiUrl}/usuarios/${_id}`);
    expect(deleteRes.status()).toBe(200);
    const deleteBody = await deleteRes.json();
    expect(deleteBody.message).toBe('Registro excluído com sucesso');

    // Valida que não existe mais
    const getRes = await request.get(`${apiUrl}/usuarios/${_id}`);
    expect(getRes.status()).toBe(400);
    const getBody = await getRes.json();
    expect(getBody.message).toBe('Usuário não encontrado');
  });
});
