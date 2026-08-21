# 🎭 Playwright & TypeScript E2E and API Test Automation Suite

[![Playwright Tests](https://github.com/MarconeRibeiroSantos/playwright-training/actions/workflows/playwright.yml/badge.svg)](https://github.com/MarconeRibeiroSantos/playwright-training/actions/workflows/playwright.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-v1.62%2B-blue.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Axe-core](https://img.shields.io/badge/WCAG-Axe--core-orange.svg)](https://github.com/dequelabs/axe-core-npm)

Suíte completa e profissional de automação de testes ponta a ponta (E2E) e de API desenvolvida com **Playwright** e **TypeScript**, aplicada sobre a plataforma [ServeRest](https://front.serverest.dev) (Front-End React & REST APIs).

O projeto adota rigorosamente as diretrizes arquiteturais e padrões de qualidade definidos no [GEMINI.md](./GEMINI.md) e o plano de testes no [.gemini/prd/test_plan.md](./.gemini/prd/test_plan.md).

---

## 🏛️ Filosofia e Padrões Arquiteturais

### 1. Pirâmide de Testes
* 🟢 **Camada de API (`tests/api/`):** Absorve 100% das combinações de campos, tipos, payloads inválidos, duplicidade e status HTTP (`200`, `201`, `400`, `401`, `403`) com altíssima velocidade via `playwright.request`.
* 🟡 **Camada de UI E2E (`tests/web/user-flows/`):** Foco exclusivo nas jornadas críticas de usuário (*happy-paths* e *release gates*).
* 🔵 **Camadas Especializadas de UI:** Acessibilidade automatizada (Axe-core), segurança de sessão (JWT/localStorage) e contratos visuais responsivos (Mobile Viewport).

### 2. Page Object Model (POM) & Row Components
* **Ponto de Entrada Estático:** `LoginPage.navigate(page)` e `RegisterPage.navigate(page)` são as únicas formas de iniciar uma jornada.
* **Encadeamento Fluido (Method Chaining):** Toda ação de navegação retorna a próxima tela (`loginPage.clickLogin()` $\rightarrow$ `HomePage`).
* **Três Seções Padronizadas:** Todo Page Object divide-se em `Actions`, `Assertions` e `Mechanics`.
* **Zero `expect()` e Zero DOM nos Specs:** Asserções residem em métodos expressivos `confirm*` no Page Object. O teste descreve a **intenção de negócio**, nunca o markup HTML.
* **Row Components (`pom/components/`):** Tabelas e listagens utilizam subcomponentes (`ProductRow`) para isolamento de linhas e menus de contexto.

### 3. Determinismo & Tolerância Zero a Flakiness
* 🚫 Proibição estrita de `waitForTimeout()` e `networkidle`.
* ⚡ Sincronização determinística via `Promise.all([page.waitForResponse(...), button.click()])`.
* 🔍 Rastreamento de débito técnico e bugs conhecidos documentados via `test.fail` com link da issue no Jira (sem skips silenciosos).

---

## 📁 Estrutura do Repositório

```
playwright-training/
├── .github/
│   └── workflows/
│       └── playwright.yml            # Pipeline de CI/CD no GitHub Actions (2 workers)
├── .gemini/
│   └── prd/
│       └── test_plan.md              # Plano mestre de testes e estratégia de release
├── helpers/
│   ├── env.ts                        # Resolução estrita de variáveis de ambiente
│   ├── urls.ts                       # Gerenciamento de URLs com trava de proteção para Produção
│   ├── users.ts                      # Fábrica determinística de dados e pool de contas
│   ├── api.ts                        # Utilitários de API para seeding rápido de estado
│   └── deeplinks.ts                  # Deep links diretos para testes estruturais/a11y
├── pom/
│   ├── LoginPage.ts                  # Page Object da tela de Login
│   ├── RegisterPage.ts               # Page Object da tela de Cadastro
│   ├── HomePage.ts                   # Vitrine da loja e busca de produtos
│   ├── AdminDashboardPage.ts         # Dashboard administrativo
│   ├── ProductRegistrationPage.ts    # Cadastro de produtos (Admin)
│   ├── ProductListPage.ts            # Tabela de produtos
│   ├── CartPage.ts                   # Carrinho e checkout
│   └── components/
│       └── ProductRow.ts             # Row Component para isolar linhas de tabela
├── tests/
│   ├── api/                          # Testes de API REST (Auth, Usuários, Produtos, Carrinhos)
│   └── web/
│       ├── user-flows/               # Happy-paths E2E (Cadastro, Login, Gestão, Compras)
│       ├── ui-contract/              # Contrato visual e responsividade mobile
│       ├── wcag-compliant/           # Conformidade de acessibilidade (Axe-core)
│       └── security/                 # Persistência de JWT e rotas protegidas
├── .env.example                      # Modelo de variáveis de ambiente
├── GEMINI.md                         # Diretrizes arquiteturais e regras de ouro da suíte
├── playwright.config.ts              # Configuração global do Playwright
└── tsconfig.json                     # TypeScript estrito + Path Aliases (@helpers/*, @pom/*)
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
* **Node.js:** Versão 20 ou superior recomendada.
* **npm:** Versão 9 ou superior.

### 2. Instalação das Dependências
```bash
git clone https://github.com/MarconeRibeiroSantos/playwright-training.git
cd playwright-training
npm ci
npx playwright install --with-deps
```

### 3. Configuração do Ambiente
Copie o arquivo de exemplo [.env.example](./.env.example) para `.env` (ou configure no seu `~/.zshrc`):
```bash
cp .env.example .env
```

Conteúdo esperado no `.env`:
```env
BASE_URL=https://front.serverest.dev
API_URL=https://serverest.dev
TEST_USER_PASSWORD=Teste@123456
USER_EMAIL=usuario_teste@qa.com
USER_PASSWORD=senha_secreta_usuario
ADMIN_EMAIL=admin_teste@qa.com
ADMIN_PASSWORD=senha_secreta_admin
TEST_ENV=dev
```

---

## 🧪 Comandos de Execução de Testes

| Comando | Descrição |
| :--- | :--- |
| `npx playwright test` | Executa **toda a suíte** em todos os navegadores (Chromium, Firefox, WebKit). |
| `npx playwright test --project=chromium` | Executa a suíte rapidamente apenas no **Chromium**. |
| `npx playwright test tests/api/` | Executa exclusivamente os **testes de API**. |
| `npx playwright test tests/web/user-flows/` | Executa exclusivamente os **fluxos E2E de UI**. |
| `npx playwright test --grep "@pfm_smoke"` | Executa apenas os testes marcados com a tag de **Smoke**. |
| `npx playwright test --grep "@pfm_a11y"` | Executa as auditorias de **Acessibilidade WCAG**. |
| `npx playwright test --ui` | Abre a interface interativa do **Playwright UI Mode**. |
| `npx playwright show-report` | Abre o **Relatório HTML** com traces, screenshots e métricas. |

---

## ⚙️ Integração Contínua (GitHub Actions CI/CD)

A pipeline está configurada em [.github/workflows/playwright.yml](./.github/workflows/playwright.yml) e é acionada automaticamente a cada `push` ou `pull_request` para a branch `main`.

### Segredos do Repositório (GitHub Secrets)
Para execuções no CI, configure as variáveis em **Settings** > **Secrets and variables** > **Actions**:
* `BASE_URL`: `https://front.serverest.dev`
* `API_URL`: `https://serverest.dev`
* `TEST_USER_PASSWORD`: Senha padrão para cadastros temporários.
* `USER_EMAIL` / `USER_PASSWORD`: Credenciais do usuário fixo.
* `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Credenciais do administrador fixo.

---

## 📄 Licença
Este projeto faz parte de um treinamento avançado de automação de testes ponta a ponta com Playwright.
Sinta-se à vontade para utilizar como base e referência para entrevistas e projetos profissionais.
