import { getBaseUrl } from '@helpers/urls';

/**
 * Utilitário de deep links diretos para testes estruturais (a11y, security, ui-contract).
 * Evita longas cadeias de cliques em testes onde o foco é o contrato da tela.
 * Conforme Seção 2 do GEMINI.md.
 */
export const deeplinks = {
  get login(): string {
    return `${getBaseUrl()}/login`;
  },
  get register(): string {
    return `${getBaseUrl()}/cadastrarusuarios`;
  },
  get customerHome(): string {
    return `${getBaseUrl()}/home`;
  },
  get adminHome(): string {
    return `${getBaseUrl()}/admin/home`;
  },
  get productList(): string {
    return `${getBaseUrl()}/admin/listarprodutos`;
  },
  get productRegistration(): string {
    return `${getBaseUrl()}/admin/cadastrarprodutos`;
  },
  get shoppingList(): string {
    return `${getBaseUrl()}/minhaListaDeProdutos`;
  },
};
