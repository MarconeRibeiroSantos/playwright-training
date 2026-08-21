# 🎯 Plano e Estratégia de Testes E2E & API — ServeRest Platform

Este documento estabelece o plano mestre de testes, a arquitetura por camadas (Pirâmide de Testes) e o modelo de execução em CI/CD para a aplicação **ServeRest** (Front-End e APIs), estruturado conforme as diretrizes do [GEMINI.md](../../GEMINI.md).

---

## 1. Visão Geral e Filosofia de Qualidade

* **Aplicações Alvo:**
  * **Front-End:** `https://front.serverest.dev`
  * **APIs REST:** `https://serverest.dev`
* **Objetivo:** Garantir a estabilidade dos fluxos críticos de negócio com custo mínimo de manutenção, tempo rápido de feedback no CI e cobertura cirúrgica de regras de negócio.
* **Princípio da Pirâmide:** 
  * 🟢 **APIs:** Absorvem 100% das combinações de campos, payloads inválidos, regras de obrigatoriedade, tipagem e limites de borda (execução ultrarrápida em milissegundos).
  * 🟡 **UI User Flows:** Restritos a *happy-paths* e fluxos de alta prioridade (Release Gates) que representam a jornada do usuário real.
  * 🔵 **UI Especializados:** Testes cirúrgicos com deep-links diretos para contratos visuais, acessibilidade (WCAG) e segurança de sessão.

```
       / \
      / E2E \       <- UI: Apenas Happy-Paths Críticos & Release Gates
     /-------\
    / UI Spec \     <- UI: A11y (Axe-core), Segurança (JWT), Contrato Visual
   /-----------\
  /  API Tests  \   <- API: Validação exaustiva de campos, contratos e status HTTP
 /---------------\
```

---

## 2. Divisão do Escopo e Matriz de Cobertura

###  camada 1: Testes de API (`tests/api/`)
*Execução via `playwright.request` (sem browser overhead).*

| Módulo / Endpoint | Tipo de Validação | Casos de Teste Chave | Tags |
| :--- | :--- | :--- | :--- |
| **`POST /login`** | Autenticação & Contrato | - Sucesso (200 + retorno de Bearer token JWT)<br>- Email/senha inválidos (401)<br>- Campos obrigatórios vazios ou ausentes (400) | `@api` `@smoke` |
| **`POST /usuarios`** | Validação de Campos | - Cadastro com dados válidos (201)<br>- Tentativa de cadastro com email duplicado (400)<br>- Validação de campos obrigatórios (nome, email, password, administrador) | `@api` `@regression` |
| **`GET /usuarios`** | Consulta & Filtros | - Listar todos os usuários (200)<br>- Filtrar por `_id`, `email` e `administrador` (200)<br>- Busca por ID inexistente (400) | `@api` `@regression` |
| **`PUT/DELETE /usuarios`**| Ciclo de Vida | - Atualizar dados de usuário existente (200) vs criar novo se inexistente (201)<br>- Exclusão de usuário com sucesso (200) vs usuário com carrinho cadastrado (400) | `@api` `@regression` |
| **`CRUD /produtos`** | Regras de Negócio | - Cadastro com token de admin (201) vs bloqueio sem token / usuário padrão (401/403)<br>- Validação de duplicidade de nome (400)<br>- Validação de tipos: `preco` e `quantidade` numéricos $\ge 0$ | `@api` `@regression` |
| **`CRUD /carrinhos`** | Integridade de Venda | - Adição de produtos ao carrinho com estoque suficiente (201)<br>- Bloqueio de múltiplos carrinhos para o mesmo usuário (400)<br>- Concluir compra e cancelar compra liberando estoque (200) | `@api` `@regression` |

---

###  Camada 2: Testes E2E de UI — Fluxos de Alta Prioridade (`tests/web/user-flows/`)
*Jornadas completas de ponta a ponta com narrativa de negócio e Page Objects.*

| Identificador do Fluxo | Descrição da Jornada | Page Objects Envolvidos | Tags |
| :--- | :--- | :--- | :--- |
| **`USER-FLOW-01`** | **Cadastro e Onboarding:** Novo cliente realiza cadastro e visualiza a vitrine de produtos. | `RegisterPage` $\rightarrow$ `HomePage` | `@pfm_smoke` `@pfm_regression` |
| **`USER-FLOW-02`** | **Autenticação Padrão:** Cliente existente efetua login com credenciais válidas e valida acesso à loja. | `LoginPage` $\rightarrow$ `HomePage` | `@pfm_smoke` `@pfm_regression` |
| **`USER-FLOW-03`** | **Autenticação Administrativa:** Administrador efetua login e acessa o painel de gestão de e-commerce. | `LoginPage` $\rightarrow$ `AdminDashboardPage` | `@pfm_regression` |
| **`USER-FLOW-04`** | **Gestão de Produtos (Admin):** Admin cadastra um novo produto e localiza o item na tabela via Row Component. | `AdminDashboardPage` $\rightarrow$ `ProductRegistrationPage` $\rightarrow$ `ProductListPage` (`ProductRow`) | `@pfm_smoke` `@pfm_regression` |
| **`USER-FLOW-05`** | **Jornada de Compras (E2E):** Cliente pesquisa produto, adiciona ao carrinho e conclui o fluxo de checkout. | `HomePage` $\rightarrow$ `CartPage` | `@pfm_smoke` `@pfm_regression` |

---

### 🔬 Camada 3: Testes Especializados de UI (Contratos e Qualidade Não-Funcional)
*Navegação direta via `helpers/deeplinks.ts` sem passos desnecessários de UI.*

| Especialidade | Diretório | Foco do Teste | Tags |
| :--- | :--- | :--- | :--- |
| **Acessibilidade WCAG** | `tests/web/wcag-compliant/` | Varredura de conformidade com Axe-core nas telas de Login e Cadastro (contraste, labels, aria). | `@pfm_a11y` |
| **Segurança de Sessão** | `tests/web/security/` | Validação de persistência e expiração do JWT no `localStorage` pós-login/logout e proteção de rotas privadas. | `@pfm_security` |
| **Contrato Visual & Responsividade** | `tests/web/ui-contract/` | Renderização do contrato de layout em resoluções Desktop e Mobile (viewport). | `@pfm_ui_contract` |

---

## 3. Arquitetura de Componentes e Page Objects (POM)

Para suportar as telas com tabelas e listagens sem poluir os specs:

```
pom/
├── LoginPage.ts                  # Ponto de entrada estático (.navigate)
├── RegisterPage.ts               # Ponto de entrada estático (.navigate)
├── HomePage.ts                   # Vitrine do cliente e checkout
├── AdminDashboardPage.ts         # Dashboard de administração
├── ProductRegistrationPage.ts    # Cadastro de produtos
├── ProductListPage.ts            # Listagem de produtos (utiliza ProductRow)
├── UserListPage.ts               # Listagem de usuários (utiliza UserRow)
└── components/
    ├── ProductRow.ts             # Encapsula a linha da tabela de produtos (mat-row/tr)
    └── UserRow.ts                # Encapsula a linha da tabela de usuários
```

* **Regra estrita:** Specs **nunca** acessam tags de tabela (`tr`, `td`, botões de ação em linha). Eles chamam `ProductListPage.deleteProduct(name)`, que delega para `ProductRow`.

---

## 4. Estratégia de Dados de Teste e Estado

1. **Testes Isolados e Concorrentes:**
   - Todos os dados transitórios utilizam a fábrica `generateTestUser()` / `generateTestProduct()` com timestamps + sufixos randômicos para garantir **colisão zero** em execuções paralelas.
2. **Pool de Contas Fixas:**
   - Contas pré-configuradas gerenciadas via `fixedUsers` em [helpers/users.ts](../../helpers/users.ts), alimentadas exclusivamente por variáveis de ambiente (`getEnv()`).
3. **Limpeza Idempotente:**
   - Operações em `afterEach` ou utilitários em `tests/utils/` para deleção de produtos ou carrinhos criados.

---

## 5. Estratégia de CI/CD e Matriz de Gatilhos

| Pipeline / Gatilho | Escopo Executado | Navegador / Runner | SLA / Timeout |
| :--- | :--- | :--- | :--- |
| **Pull Request (Merge Gate)** | `@api` + `@pfm_smoke` | **Chromium** (2 workers) | $\le 2$ minutos |
| **Nightly Build (Pipeline Noturna)** | Suíte Completa (`@api`, `@pfm_regression`, `@pfm_a11y`, `@pfm_security`) | **Chromium + Firefox + WebKit** (Paralelo) | $\le 10$ minutos |
| **Manual Trigger (Release Audit)** | Execução seletiva via tag no GitHub Actions (`workflow_dispatch`) | Configurável | Variável |

---

## 6. Status de Implementação (Faseamento Concluído)

* [x] **Fase 1 (API Layer):** Criado cliente em `helpers/api.ts` e 18 cenários de teste em `tests/api/` (`auth.api.spec.ts`, `users.api.spec.ts`, `products.api.spec.ts`, `cart.api.spec.ts`).
* [x] **Fase 2 (Row Components & Admin UI):** Implementados `ProductRegistrationPage`, `ProductListPage` e subcomponente `ProductRow` em `pom/components/` com teste em `product-management.user-flow.spec.ts`.
* [x] **Fase 3 (Checkout Flow):** Implementados `CartPage`, ações no `HomePage` e teste de jornada de compras em `checkout.user-flow.spec.ts`.
* [x] **Fase 4 (A11y, Segurança, UI Contract & Deep Links):** Criados `helpers/deeplinks.ts`, testes de acessibilidade com Axe-core (`login.a11y.spec.ts` com rastreamento `test.fail`), auditoria de sessão JWT (`login-session.security.spec.ts`) e contratos visuais/responsivos (`login.ui.spec.ts`).
