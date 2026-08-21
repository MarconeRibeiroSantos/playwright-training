import { test, expect } from '@playwright/test';
import { LoginPage } from '@pom/LoginPage';
import { deeplinks } from '@helpers/deeplinks';

test.describe('UI Visual Contract & Responsiveness @pfm_ui_contract', () => {
  test('verify login form visual contract and elements integrity @pfm_ui_contract', async ({ page }) => {
    // Act: Deep link direto para a tela sob teste
    await page.goto(deeplinks.login);

    const loginPage = new LoginPage(page);
    await loginPage.confirmLoginPage();

    // Assert: Contrato de visibilidade dos elementos essenciais
    await expect(page.getByPlaceholder(/digite seu email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/digite sua senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    await expect(page.getByText(/cadastre-se/i)).toBeVisible();
  });

  test('render login form properly on mobile viewport @pfm_ui_contract', async ({ page }) => {
    // Arrange: Define viewport de celular (iPhone / Mobile)
    await page.setViewportSize({ width: 375, height: 667 });

    // Act
    await page.goto(deeplinks.login);

    // Assert: O formulário deve continuar visível e acessível sem quebra de layout
    const loginPage = new LoginPage(page);
    await loginPage.confirmLoginPage();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeInViewport();
  });
});
