import { test, expect } from '@playwright/test';
import { getApiUrl } from '@helpers/urls';
import { createAndAuthenticateUser, generateTestProduct } from '@helpers/api';

test.describe('API: Gestão de Carrinhos (/carrinhos) @api', () => {
  const apiUrl = getApiUrl();

  test('deve criar um carrinho com sucesso para usuário autenticado (201) @smoke', async ({ request }) => {
    // 1. Cria admin para cadastrar produto
    const admin = await createAndAuthenticateUser(request, { isAdmin: true });
    const productData = generateTestProduct();
    const prodRes = await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: admin.token },
      data: productData,
    });
    const { _id: idProduto } = await prodRes.json();

    // 2. Cria cliente comprador
    const customer = await createAndAuthenticateUser(request, { isAdmin: false });

    // 3. Adiciona produto ao carrinho
    const cartRes = await request.post(`${apiUrl}/carrinhos`, {
      headers: { Authorization: customer.token },
      data: {
        produtos: [
          {
            idProduto,
            quantidade: 2,
          },
        ],
      },
    });

    expect(cartRes.status()).toBe(201);
    const cartBody = await cartRes.json();
    expect(cartBody.message).toBe('Cadastro realizado com sucesso');
    expect(cartBody._id).toBeDefined();
  });

  test('deve proibir criação de mais de 1 carrinho simultâneo para o mesmo usuário (400) @regression', async ({ request }) => {
    const admin = await createAndAuthenticateUser(request, { isAdmin: true });
    const productData = generateTestProduct();
    const prodRes = await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: admin.token },
      data: productData,
    });
    const { _id: idProduto } = await prodRes.json();

    const customer = await createAndAuthenticateUser(request, { isAdmin: false });

    // 1º carrinho
    await request.post(`${apiUrl}/carrinhos`, {
      headers: { Authorization: customer.token },
      data: {
        produtos: [{ idProduto, quantidade: 1 }],
      },
    });

    // 2º carrinho para o mesmo usuário
    const secondCartRes = await request.post(`${apiUrl}/carrinhos`, {
      headers: { Authorization: customer.token },
      data: {
        produtos: [{ idProduto, quantidade: 1 }],
      },
    });

    expect(secondCartRes.status()).toBe(400);
    const secondBody = await secondCartRes.json();
    expect(secondBody.message).toBe('Não é permitido ter mais de 1 carrinho');
  });

  test('deve concluir a compra e limpar o carrinho (200) @regression', async ({ request }) => {
    const admin = await createAndAuthenticateUser(request, { isAdmin: true });
    const productData = generateTestProduct();
    const prodRes = await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: admin.token },
      data: productData,
    });
    const { _id: idProduto } = await prodRes.json();

    const customer = await createAndAuthenticateUser(request, { isAdmin: false });

    await request.post(`${apiUrl}/carrinhos`, {
      headers: { Authorization: customer.token },
      data: {
        produtos: [{ idProduto, quantidade: 1 }],
      },
    });

    // Conclui a compra
    const checkoutRes = await request.delete(`${apiUrl}/carrinhos/concluir-compra`, {
      headers: { Authorization: customer.token },
    });

    expect(checkoutRes.status()).toBe(200);
    const checkoutBody = await checkoutRes.json();
    expect(checkoutBody.message).toBe('Registro excluído com sucesso');
  });

  test('deve cancelar a compra e liberar o estoque (200) @regression', async ({ request }) => {
    const admin = await createAndAuthenticateUser(request, { isAdmin: true });
    const productData = generateTestProduct();
    const prodRes = await request.post(`${apiUrl}/produtos`, {
      headers: { Authorization: admin.token },
      data: productData,
    });
    const { _id: idProduto } = await prodRes.json();

    const customer = await createAndAuthenticateUser(request, { isAdmin: false });

    await request.post(`${apiUrl}/carrinhos`, {
      headers: { Authorization: customer.token },
      data: {
        produtos: [{ idProduto, quantidade: 1 }],
      },
    });

    // Cancela a compra
    const cancelRes = await request.delete(`${apiUrl}/carrinhos/cancelar-compra`, {
      headers: { Authorization: customer.token },
    });

    expect(cancelRes.status()).toBe(200);
    const cancelBody = await cancelRes.json();
    expect(cancelBody.message).toBe('Registro excluído com sucesso. Estoque dos produtos reabastecido');
  });
});
