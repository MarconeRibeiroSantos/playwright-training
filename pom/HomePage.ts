import { Page, Locator, expect } from '@playwright/test';
import { LoginPage } from '@pom/LoginPage';
import { CartPage } from '@pom/CartPage';

export class HomePage {
  constructor(private readonly page: Page) {}

  // ==========================================
  // 1. Actions
  // ==========================================

  async addProductToList(productName: string): Promise<HomePage> {
    const productCard = this.page.locator('.card, .col-').filter({ hasText: productName });
    const addButton = productCard.getByRole('button', { name: /adicionar na lista/i }).or(productCard.locator('[data-testid="adicionarNaLista"]'));
    await addButton.click();
    return this;
  }

  async goToCart(): Promise<CartPage> {
    await this.shoppingListLink.click();
    return new CartPage(this.page);
  }

  async searchProduct(term: string): Promise<HomePage> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    return this;
  }

  async clickLogout(): Promise<LoginPage> {
    await this.logoutButton.click();
    return new LoginPage(this.page);
  }

  // ==========================================
  // 2. Assertions
  // ==========================================

  async confirmCustomerDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/.*home.*/);
    await expect(this.storeTitle).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  async confirmProductVisible(productName: string): Promise<void> {
    await expect(this.page.locator('.card-title, h5, h4').filter({ hasText: productName })).toBeVisible();
  }

  // ==========================================
  // 3. Mechanics
  // ==========================================

  private get storeTitle(): Locator {
    return this.page.getByRole('heading', { name: /Serverest Store/i });
  }

  private get logoutButton(): Locator {
    return this.page.getByRole('button', { name: /logout/i });
  }

  private get shoppingListLink(): Locator {
    return this.page.locator('nav').getByText(/Lista de Compras/i);
  }

  private get searchInput(): Locator {
    return this.page.getByPlaceholder(/pesquisar/i).or(this.page.locator('[data-testid="pesquisar"]'));
  }

  private get searchButton(): Locator {
    return this.page.getByRole('button', { name: /pesquisar/i }).or(this.page.locator('[data-testid="botaoPesquisar"]'));
  }
}
