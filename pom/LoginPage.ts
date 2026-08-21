import { Page, Locator, expect } from '@playwright/test';
import { getBaseUrl } from '@helpers/urls';
import { RegisterPage } from '@pom/RegisterPage';
import { HomePage } from '@pom/HomePage';
import { AdminDashboardPage } from '@pom/AdminDashboardPage';

export class LoginPage {
  constructor(private readonly page: Page) {}

  // ==========================================
  // 1. Actions (O que o usuário faz)
  // ==========================================

  /**
   * Ponto de entrada estático para abrir a página de Login.
   */
  static async navigate(page: Page): Promise<LoginPage> {
    const baseUrl = getBaseUrl();
    await page.goto(`${baseUrl}/login`);
    return new LoginPage(page);
  }

  async fillEmail(email: string): Promise<LoginPage> {
    await this.emailInput.fill(email);
    return this;
  }

  async fillPassword(password: string): Promise<LoginPage> {
    await this.passwordInput.fill(password);
    return this;
  }

  /**
   * Realiza login como cliente padrão e navega até a Home da Loja.
   */
  async clickLogin(): Promise<HomePage> {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/login') && res.status() === 200
      ),
      this.loginButton.click(),
    ]);
    return new HomePage(this.page);
  }

  /**
   * Realiza login como administrador e navega até o Painel Administrativo.
   */
  async clickLoginAsAdmin(): Promise<AdminDashboardPage> {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/login') && res.status() === 200
      ),
      this.loginButton.click(),
    ]);
    return new AdminDashboardPage(this.page);
  }

  /**
   * Submete credenciais inválidas esperando resposta de erro da API.
   */
  async clickLoginExpectingFailure(): Promise<LoginPage> {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/login') && res.status() === 401
      ),
      this.loginButton.click(),
    ]);
    return this;
  }

  async goToRegister(): Promise<RegisterPage> {
    await this.registerLink.click();
    return new RegisterPage(this.page);
  }

  // ==========================================
  // 2. Assertions (Métodos confirm*)
  // ==========================================

  async confirmLoginPage(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async confirmLoginError(expectedMessage: string | RegExp = /Email e\/ou senha inválidos/i): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(expectedMessage);
  }

  // ==========================================
  // 3. Mechanics (Locators & Plumbing Interno)
  // ==========================================

  private get emailInput(): Locator {
    return this.page.getByPlaceholder(/digite seu email/i);
  }

  private get passwordInput(): Locator {
    return this.page.getByPlaceholder(/digite sua senha/i);
  }

  private get loginButton(): Locator {
    return this.page.getByRole('button', { name: /entrar/i });
  }

  private get registerLink(): Locator {
    return this.page.getByRole('link', { name: /cadastre-se/i });
  }

  private get heading(): Locator {
    return this.page.getByRole('heading', { name: /login/i });
  }

  private get errorAlert(): Locator {
    return this.page.locator('.alert-danger, .alert');
  }
}
