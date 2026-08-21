import { Page, Locator, expect } from '@playwright/test';
import { getBaseUrl } from '@helpers/urls';
import { LoginPage } from '@pom/LoginPage';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  // ==========================================
  // 1. Actions (O que o usuário faz)
  // ==========================================

  /**
   * Ponto de entrada estático para navegar até a tela de Cadastro de Usuários.
   */
  static async navigate(page: Page): Promise<RegisterPage> {
    const baseUrl = getBaseUrl();
    await page.goto(`${baseUrl}/cadastrarusuarios`);
    return new RegisterPage(page);
  }

  async fillName(name: string): Promise<RegisterPage> {
    await this.nameInput.fill(name);
    return this;
  }

  async fillEmail(email: string): Promise<RegisterPage> {
    await this.emailInput.fill(email);
    return this;
  }

  async fillPassword(password: string): Promise<RegisterPage> {
    await this.passwordInput.fill(password);
    return this;
  }

  async selectAdminRole(): Promise<RegisterPage> {
    await this.adminCheckbox.check();
    return this;
  }

  /**
   * Submete o formulário aguardando a resposta da API antes de resolver a ação.
   */
  async clickRegister(): Promise<RegisterPage> {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/usuarios') && (res.status() === 201 || res.status() === 400),
        { timeout: 10000 }
      ),
      this.registerButton.click(),
    ]);
    return this;
  }

  async goToLogin(): Promise<LoginPage> {
    await this.loginLink.click();
    return new LoginPage(this.page);
  }

  // ==========================================
  // 2. Assertions (Métodos confirm*)
  // ==========================================

  async confirmRegistrationPage(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.registerButton).toBeVisible();
  }

  async confirmRegistrationSuccess(): Promise<void> {
    await expect(this.successAlert).toBeVisible({ timeout: 10000 });
  }

  async confirmErrorMessage(expectedMessage: string | RegExp): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(expectedMessage);
  }

  // ==========================================
  // 3. Mechanics (Locators & Plumbing Interno)
  // ==========================================

  private get nameInput(): Locator {
    return this.page.getByPlaceholder(/digite seu nome/i);
  }

  private get emailInput(): Locator {
    return this.page.getByPlaceholder(/digite seu email/i);
  }

  private get passwordInput(): Locator {
    return this.page.getByPlaceholder(/digite sua senha/i);
  }

  private get adminCheckbox(): Locator {
    return this.page.getByLabel(/cadastrar como administrador/i);
  }

  private get registerButton(): Locator {
    return this.page.getByRole('button', { name: /cadastrar/i });
  }

  private get loginLink(): Locator {
    return this.page.getByRole('link', { name: /entrar/i });
  }

  private get heading(): Locator {
    return this.page.getByRole('heading', { name: /cadastro/i });
  }

  private get successAlert(): Locator {
    return this.page.locator('.alert').filter({ hasText: /Cadastro realizado com sucesso/i });
  }

  private get errorAlert(): Locator {
    return this.page.locator('.alert').filter({ hasNotText: /sucesso/i });
  }
}
