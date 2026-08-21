import { test, expect } from '@playwright/test';
import { LoginPage } from '@pom/LoginPage';
import { RegisterPage } from '@pom/RegisterPage';
import { generateTestUser } from '@helpers/users';
import { deeplinks } from '@helpers/deeplinks';

test.describe('Session & Security Surface Audits @pfm_security', () => {
  test('store JWT bearer token in localStorage upon successful authentication @pfm_security', async ({
    page,
  }) => {
    // Arrange: Cadastra usuário
    const user = generateTestUser();
    const registerPage = await RegisterPage.navigate(page);
    await registerPage.fillName(user.name);
    await registerPage.fillEmail(user.email);
    await registerPage.fillPassword(user.password);
    await registerPage.clickRegister();
    await registerPage.confirmRegistrationSuccess();

    // Act: Efetua login
    const loginPage = await LoginPage.navigate(page);
    await loginPage.fillEmail(user.email);
    await loginPage.fillPassword(user.password);
    const homePage = await loginPage.clickLogin();
    await homePage.confirmCustomerDashboard();

    // Assert: Valida persistência do token no localStorage
    const token = await page.evaluate(() => localStorage.getItem('serverest/userToken') || localStorage.getItem('token'));
    expect(token).toBeDefined();
    expect(token).not.toBeNull();
  });

  test('block unauthorized direct deep-link access to admin dashboard @pfm_security', async ({
    page,
  }) => {
    // Act: Tenta acessar diretamente a rota administrativa sem token
    await page.goto(deeplinks.adminHome);

    // Assert: Deve redirecionar para a tela de login
    await expect(page).toHaveURL(/.*login.*/);
    const loginPage = new LoginPage(page);
    await loginPage.confirmLoginPage();
  });
});
