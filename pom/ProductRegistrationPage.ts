import { Page, Locator, expect } from '@playwright/test';
import { getBaseUrl } from '@helpers/urls';
import { ProductListPage } from '@pom/ProductListPage';

export class ProductRegistrationPage {
  constructor(private readonly page: Page) {}

  // ==========================================
  // 1. Actions
  // ==========================================

  static async navigate(page: Page): Promise<ProductRegistrationPage> {
    const baseUrl = getBaseUrl();
    await page.goto(`${baseUrl}/admin/cadastrarprodutos`);
    return new ProductRegistrationPage(page);
  }

  async fillName(name: string): Promise<ProductRegistrationPage> {
    await this.nameInput.fill(name);
    return this;
  }

  async fillPrice(price: number | string): Promise<ProductRegistrationPage> {
    await this.priceInput.fill(String(price));
    return this;
  }

  async fillDescription(description: string): Promise<ProductRegistrationPage> {
    await this.descriptionInput.fill(description);
    return this;
  }

  async fillQuantity(quantity: number | string): Promise<ProductRegistrationPage> {
    await this.quantityInput.fill(String(quantity));
    return this;
  }

  /**
   * Salva o produto e navega automaticamente para a lista de produtos.
   */
  async clickRegister(): Promise<ProductListPage> {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/produtos') && (res.status() === 201 || res.status() === 400)
      ),
      this.saveButton.click(),
    ]);
    return new ProductListPage(this.page);
  }

  // ==========================================
  // 2. Assertions
  // ==========================================

  async confirmRegistrationPage(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  // ==========================================
  // 3. Mechanics
  // ==========================================

  private get nameInput(): Locator {
    return this.page.getByPlaceholder(/nome/i).or(this.page.locator('[data-testid="nome"]'));
  }

  private get priceInput(): Locator {
    return this.page.getByPlaceholder(/valor|preço/i).or(this.page.locator('[data-testid="preco"]'));
  }

  private get descriptionInput(): Locator {
    return this.page.getByPlaceholder(/descrição/i).or(this.page.locator('[data-testid="descricao"]'));
  }

  private get quantityInput(): Locator {
    return this.page.getByPlaceholder(/quantidade/i).or(this.page.locator('[data-testid="quantidade"]'));
  }

  private get saveButton(): Locator {
    return this.page.getByRole('button', { name: /cadastrar/i }).or(this.page.locator('[data-testid="cadatrarProdutos"]'));
  }

  private get heading(): Locator {
    return this.page.getByRole('heading', { name: /Cadastro de Produtos/i });
  }
}
