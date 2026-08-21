import { Page, Locator, expect } from '@playwright/test';
import { getBaseUrl } from '@helpers/urls';

export class CartPage {
  constructor(private readonly page: Page) {}

  // ==========================================
  // 1. Actions
  // ==========================================

  static async navigate(page: Page): Promise<CartPage> {
    const baseUrl = getBaseUrl();
    await page.goto(`${baseUrl}/minhaListaDeProdutos`);
    return new CartPage(page);
  }

  async clickClearCart(): Promise<CartPage> {
    await this.clearCartButton.click();
    return this;
  }

  // ==========================================
  // 2. Assertions
  // ==========================================

  async confirmCartPage(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async confirmProductInCart(productName: string): Promise<void> {
    await expect(this.page.locator('.card, .card-body, table, section, div').filter({ hasText: productName }).first()).toBeVisible();
  }

  async confirmEmptyCart(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible();
  }

  // ==========================================
  // 3. Mechanics
  // ==========================================

  private get heading(): Locator {
    return this.page.getByRole('heading', { name: /Lista de Compras/i });
  }

  private get clearCartButton(): Locator {
    return this.page.getByRole('button', { name: /limpar lista|limpar carrinho/i }).or(this.page.locator('[data-testid="limparLista"]'));
  }

  private get emptyMessage(): Locator {
    return this.page.getByText(/seu carrinho está vazio|não há produtos na lista|lista de compras está vazia/i);
  }
}
