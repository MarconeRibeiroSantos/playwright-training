import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { deeplinks } from '@helpers/deeplinks';

test.describe('WCAG 2.1 Accessibility Audits @pfm_a11y', () => {
  test('login page accessibility audit [SERVEREST-A11Y-101] @pfm_a11y', async ({ page }) => {
    // Débito técnico conhecido documentado com test.fail conforme Seção 7 do GEMINI.md:
    // A imagem do logo do ServeRest não possui atributo alt (Violação WCAG 1.1.1 - image-alt).
    test.fail(true, 'Known issue: Logo image lacks alt attribute (WCAG 1.1.1 - https://jira.company.com/browse/SERVEREST-A11Y-101)');

    await page.goto(deeplinks.login);

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('registration page accessibility audit [SERVEREST-A11Y-102] @pfm_a11y', async ({ page }) => {
    // Débito técnico conhecido: Logo sem alt na página de cadastro
    test.fail(true, 'Known issue: Registration logo lacks alt attribute (WCAG 1.1.1 - https://jira.company.com/browse/SERVEREST-A11Y-102)');

    await page.goto(deeplinks.register);

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });
});
