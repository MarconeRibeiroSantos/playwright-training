import { Page, Locator, expect } from '@playwright/test';
import { LoginPage } from '@pom/LoginPage';
import { ProductRegistrationPage } from '@pom/ProductRegistrationPage';
import { ProductListPage } from '@pom/ProductListPage';

export class AdminDashboardPage {
  constructor(private readonly page: Page) {}

  // ==========================================
  // 1. Actions
  // ==========================================

  async goToProductRegistration(): Promise<ProductRegistrationPage> {
    await this.registerProductsLink.click();
    return new ProductRegistrationPage(this.page);
  }

  async goToProductList(): Promise<ProductListPage> {
    await this.listProductsLink.click();
    return new ProductListPage(this.page);
  }

  async clickLogout(): Promise<LoginPage> {
    await this.logoutButton.click();
    return new LoginPage(this.page);
  }

  // ==========================================
  // 2. Assertions
  // ==========================================

  async confirmAdminDashboard(adminName?: string): Promise<void> {
    await expect(this.page).toHaveURL(/.*admin\/home.*/);
    await expect(this.welcomeHeading).toBeVisible();
    if (adminName) {
      await expect(this.welcomeHeading).toContainText(adminName);
    }
    await expect(this.adminDescription).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  // ==========================================
  // 3. Mechanics
  // ==========================================

  private get welcomeHeading(): Locator {
    return this.page.getByRole('heading', { name: /Bem Vindo/i });
  }

  private get adminDescription(): Locator {
    return this.page.getByText(/Este é seu sistema para administrar seu ecommerce/i);
  }

  private get registerProductsLink(): Locator {
    return this.page.getByRole('link', { name: /cadastrar produtos/i }).or(this.page.locator('[data-testid="cadastrar-produtos"]'));
  }

  private get listProductsLink(): Locator {
    return this.page.getByRole('link', { name: /listar produtos/i }).or(this.page.locator('[data-testid="listar-produtos"]'));
  }

  private get logoutButton(): Locator {
    return this.page.getByRole('button', { name: /logout/i });
  }
}
