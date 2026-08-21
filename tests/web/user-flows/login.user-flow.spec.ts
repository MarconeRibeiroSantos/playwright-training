import { test } from '@playwright/test';
import { LoginPage } from '@pom/LoginPage';
import { RegisterPage } from '@pom/RegisterPage';
import { generateTestUser } from '@helpers/users';

test.describe('User Authentication Flows', () => {
  test('authenticate standard customer and land on ecommerce store @pfm_smoke @pfm_regression', async ({ page }) => {
    // Arrange: Cria usuário antes do login para garantir isolamento e independência
    const customer = generateTestUser({ isAdmin: false });
    const registerPage = await RegisterPage.navigate(page);
    await registerPage.fillName(customer.name);
    await registerPage.fillEmail(customer.email);
    await registerPage.fillPassword(customer.password);
    await registerPage.clickRegister();
    await registerPage.confirmRegistrationSuccess();

    // Act: Efetua login com o usuário criado
    const loginPage = await LoginPage.navigate(page);
    await loginPage.fillEmail(customer.email);
    await loginPage.fillPassword(customer.password);
    const homePage = await loginPage.clickLogin();

    // Assert
    await homePage.confirmCustomerDashboard();
  });

  test('authenticate administrator and land on administration dashboard @pfm_regression', async ({ page }) => {
    // Arrange: Cria administrador antes do login
    const admin = generateTestUser({ isAdmin: true });
    const registerPage = await RegisterPage.navigate(page);
    await registerPage.fillName(admin.name);
    await registerPage.fillEmail(admin.email);
    await registerPage.fillPassword(admin.password);
    await registerPage.selectAdminRole();
    await registerPage.clickRegister();
    await registerPage.confirmRegistrationSuccess();

    // Act: Efetua login administrativo
    const loginPage = await LoginPage.navigate(page);
    await loginPage.fillEmail(admin.email);
    await loginPage.fillPassword(admin.password);
    const adminDashboard = await loginPage.clickLoginAsAdmin();

    // Assert
    await adminDashboard.confirmAdminDashboard(admin.name);
  });

  test('display error message when attempting login with invalid credentials @pfm_regression', async ({ page }) => {
    // Arrange
    const invalidUser = generateTestUser();

    // Act
    const loginPage = await LoginPage.navigate(page);
    await loginPage.fillEmail(invalidUser.email);
    await loginPage.fillPassword('SenhaIncorreta999');
    await loginPage.clickLoginExpectingFailure();

    // Assert
    await loginPage.confirmLoginError();
  });
});
