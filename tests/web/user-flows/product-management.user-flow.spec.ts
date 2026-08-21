import { test } from '@playwright/test';
import { LoginPage } from '@pom/LoginPage';
import { RegisterPage } from '@pom/RegisterPage';
import { generateTestUser } from '@helpers/users';
import { generateTestProduct } from '@helpers/api';

test.describe('Product Management User Flows (Admin)', () => {
  test('register new product and manage via table row component @pfm_smoke @pfm_regression', async ({ page }) => {
    // Arrange: Cadastra o administrador
    const admin = generateTestUser({ isAdmin: true });
    const registerPage = await RegisterPage.navigate(page);
    await registerPage.fillName(admin.name);
    await registerPage.fillEmail(admin.email);
    await registerPage.fillPassword(admin.password);
    await registerPage.selectAdminRole();
    await registerPage.clickRegister();
    await registerPage.confirmRegistrationSuccess();

    // Act 1: Autentica como Administrador e navega para cadastro de produtos
    const loginPage = await LoginPage.navigate(page);
    await loginPage.fillEmail(admin.email);
    await loginPage.fillPassword(admin.password);
    const adminDashboard = await loginPage.clickLoginAsAdmin();
    await adminDashboard.confirmAdminDashboard(admin.name);

    const productForm = await adminDashboard.goToProductRegistration();
    await productForm.confirmRegistrationPage();

    // Act 2: Preenche e salva novo produto
    const product = generateTestProduct('Teclado Mecanico');
    await productForm.fillName(product.nome);
    await productForm.fillPrice(product.preco);
    await productForm.fillDescription(product.descricao);
    await productForm.fillQuantity(product.quantidade);
    const productListPage = await productForm.clickRegister();

    // Assert 1: Valida que o produto está presente na tabela gerenciado pelo Row Component
    await productListPage.confirmProductListPage();
    await productListPage.confirmProductListed(product.nome);

    // Act 3: Exclui o produto usando o método de domínio do Page Object
    await productListPage.deleteProduct(product.nome);

    // Assert 2: Confirma que o produto foi removido da tabela
    await productListPage.confirmProductNotListed(product.nome);
  });
});
