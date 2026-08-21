import { test } from '@playwright/test';
import { LoginPage } from '@pom/LoginPage';
import { RegisterPage } from '@pom/RegisterPage';
import { generateTestUser } from '@helpers/users';
import { createAndAuthenticateUser, generateTestProduct } from '@helpers/api';
import { getApiUrl } from '@helpers/urls';

test.describe('E-commerce Shopping and Cart Flows (Customer)', () => {
  test('customer searches product, adds to cart and verifies cart items @pfm_smoke @pfm_regression', async ({
    page,
    request,
  }) => {
    // Arrange 1: Garante via API que existe um produto único na loja
    const admin = await createAndAuthenticateUser(request, { isAdmin: true });
    const product = generateTestProduct('Mouse Gamer');
    await request.post(`${getApiUrl()}/produtos`, {
      headers: { Authorization: admin.token },
      data: product,
    });

    // Arrange 2: Cria cliente comprador
    const customer = generateTestUser({ isAdmin: false });
    const registerPage = await RegisterPage.navigate(page);
    await registerPage.fillName(customer.name);
    await registerPage.fillEmail(customer.email);
    await registerPage.fillPassword(customer.password);
    await registerPage.clickRegister();
    await registerPage.confirmRegistrationSuccess();

    // Act 1: Autentica cliente e acessa a vitrine de produtos
    const loginPage = await LoginPage.navigate(page);
    await loginPage.fillEmail(customer.email);
    await loginPage.fillPassword(customer.password);
    const homePage = await loginPage.clickLogin();
    await homePage.confirmCustomerDashboard();

    // Act 2: Adiciona produto à lista de compras
    await homePage.addProductToList(product.nome);
    const cartPage = await homePage.goToCart();

    // Assert: Valida que o produto está presente na lista de compras
    await cartPage.confirmCartPage();
    await cartPage.confirmProductInCart(product.nome);
  });
});
