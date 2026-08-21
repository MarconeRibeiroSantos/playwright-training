import { test } from '@playwright/test';
import { RegisterPage } from '@pom/RegisterPage';
import { generateTestUser } from '@helpers/users';

test.describe('User Registration Flows', () => {
  test('register new standard customer user successfully @pfm_smoke @pfm_regression', async ({ page }) => {
    // Arrange
    const user = generateTestUser({ isAdmin: false });

    // Act
    const registerPage = await RegisterPage.navigate(page);
    await registerPage.fillName(user.name);
    await registerPage.fillEmail(user.email);
    await registerPage.fillPassword(user.password);
    await registerPage.clickRegister();

    // Assert
    await registerPage.confirmRegistrationSuccess();
  });

  test('register new administrator user successfully @pfm_regression', async ({ page }) => {
    // Arrange
    const adminUser = generateTestUser({ isAdmin: true });

    // Act
    const registerPage = await RegisterPage.navigate(page);
    await registerPage.fillName(adminUser.name);
    await registerPage.fillEmail(adminUser.email);
    await registerPage.fillPassword(adminUser.password);
    await registerPage.selectAdminRole();
    await registerPage.clickRegister();

    // Assert
    await registerPage.confirmRegistrationSuccess();
  });
});
