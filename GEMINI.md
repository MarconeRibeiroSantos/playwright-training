# Guidelines & Architecture for Playwright E2E Test Suite (GEMINI.md)

Este documento estabelece as diretrizes arquiteturais, padrões de design, convenções e regras de qualidade para a criação e refatoração da suíte de testes ponta a ponta (E2E) com Playwright e TypeScript.

---

## 1. Filosofia Central e Otimização da Suíte

A suíte opera contra múltiplos ambientes hospedados (`dev`, `qa`, `acpt`, `prod`) selecionados em tempo de execução, sem servidor local, sem acesso direto a banco de dados, sem API de limpeza e sem backdoors de seeding. Ela interage com o produto exatamente como um usuário real.

### Prioridades (Nesta Ordem)
1. **Legibilidade (Readability First):** Stakeholders e desenvolvedores leem os specs para decidir se confiam na suíte.
2. **Baixa Manutenção (Low Maintenance):** Todo seletor, localizador e detalhe de mecânica do DOM fica isolado exclusivamente na camada de Page Objects e Components.
3. **Cobertura Útil (Coverage Third):** Cobertura que gera noites vermelhas com testes instáveis (*flaky*) custa mais caro do que o valor que entrega.

> **Regra de Ouro:** Código de teste **não** é código de produção. Princípio DRY (*Don't Repeat Yourself*) **não** é a prioridade máxima aqui; a **Legibilidade e Clareza da História de Usuário** vêm em primeiro lugar.

---

## 2. Estrutura de Diretórios de Teste (`tests/web/`)

Os testes são organizados pelo **tipo de garantia** que fornecem, e não meramente por página:

```
tests/
└── web/
    ├── user-flows/        # Happy-paths completos de ponta a ponta (Release Gate)
    ├── ui-contract/       # Contratos visuais: *.ui.spec.ts e *.responsive.spec.ts
    ├── wcag-compliant/    # Acessibilidade via Axe-core: *.a11y.spec.ts
    ├── security/          # Superfícies de segurança: *.security.spec.ts (csrf, cookies, headers, session)
    ├── system-behaviour/ # Armazenamento local/sessão, permissões de cargo, email lembrado
    ├── health-check/      # Testes de fumaça e carregamento de páginas críticas: *.health.spec.ts
    └── utils/             # Specs que funcionam como ferramentas CLI (seeding, cleanup)
```

### Disciplina por Propósito
- **`user-flows/`**: Mantém uma narrativa contínua de história de usuário do início ao fim.
- **`ui-contract/` e `wcag-compliant/`**: Navegam diretamente para a página testada via deep links (`helpers/deeplinks.ts`), evitando longas cadeias de cliques que aumentam *flakiness*.
- **`security/` e `system-behaviour/`**: Trocam narrativa por precisão cirúrgica (uma asserção de cabeçalho, cookie ou storage).
- **Sem DOM no Spec**: É proibido manipular elementos do DOM diretamente nos arquivos de spec, exceto quando:
  1. O spec valida o contrato da própria linha de uma tabela da qual o componente depende.
  2. A URL destino é dinâmica (ex: `/password/view/<id>`) e não permite deep-link.

---

## 3. Arquitetura de Page Objects (POM)

Localizados em `pom/` (ex: `LoginPage`, `Passwords`, `Files`, `PlanSettings`, `ProfileSettings`):

1. **Factory Estática `navigate(page)` apenas em pontos de entrada (`LoginPage`, `Register`):**
   - Nunca instanciar com `new LoginPage(page)` no spec.
   - Ponto de entrada lê-se semanticamente como `LoginPage.navigate(page)`.
2. **Encadeamento de Métodos (Method Chaining):**
   - Métodos de ação retornam a instância da próxima página onde o usuário aterrissa.
   - Exemplo: `LoginPage.clickLogin()` retorna `Passwords`; `Passwords.goToFiles()` retorna `Files`.
   - O teste se torna uma jornada fluida de cima a baixo.
3. **Três Seções Padronizadas em Todo Page Object:**
   - `Actions`: Métodos públicos que representam o que o usuário faz.
   - `Assertions`: Métodos públicos de confirmação (`confirm*`).
   - `Mechanics`: Plumbing interno e privado (como fábricas de linhas e seletores específicos).
4. **Asserções em Métodos `confirm*` (Nunca `expect()` solto no Spec):**
   - Toda asserção deve encapsular a regra em um método expressivo: `confirmPasswordDashboard()`, `confirmFileUpload()`, `confirmLoginError()`.
   - O spec comunica o que está sendo validado no vocabulário de negócio.

---

## 4. Page Objects vs Row Components (Regra de Decisão)

Tabelas e listas com múltiplas linhas utilizam subcomponentes em `pom/components/` (ex: `FileRow`, `FolderRow`, `PasswordRow`, `PlanInviteRow`):

- **Assinatura do Construtor:** `constructor(page: Page, row: Locator)`
- **Ownership Estrito:** O Page Object possui uma fábrica privada que gera o localizador com escopo (ex: `this.page.locator('mat-row').filter({ hasText: title })`) e o entrega ao componente.
- **Isolamento:** Specs **nunca** importam de `pom/components/`. Eles chamam métodos de domínio no Page Object (ex: `Files.moveFileToTrash(filename)`), que delega internamente para a linha correspondente.
- **Regra:** Ações em linhas são implementadas primeiro no Row Component e depois expostas como método de domínio no Page Object. Specs nunca acessam `mat-row`, menus de contexto ou células diretamente.

---

## 5. Estratégia de Localizadores (Locators)

- **Priorize:** `getByRole`, `getByLabel`, `getByPlaceholder`. Evite IDs e seletores CSS genéricos.
- **Expressões Regulares Insensíveis a Maiúsculas/Minúsculas:** Use `getByRole('button', { name: /log in/i })` para absorver pequenas alterações de copy.
- **Locators Re-consultados Inline:** Não armazene localizadores dinâmicos ou parametrizados em campos estáticos de classe.
- **Entendimento Playwright:** O `Locator` do Playwright é *lazy* e imune a erros de *detached-DOM*. Evite o uso de `ElementHandle` (`page.$()`, `locator.elementHandle()`).
- **Seletores de Framework (Angular Material, etc.):** Elementos como `mat-cell.mat-column-name` ou `mat-spinner:visible` são restritos ao POM/Components e nunca aparecem nos specs.

---

## 6. O Spec Abstrai a Intenção do Usuário, Não a Interface

- **Princípio:** O spec descreve **o que** o usuário tenta alcançar, não **como** a interface atual está montada.
- **Heurística de Code Review:** Se uma mudança puramente visual na UI obrigar a edição de um arquivo de spec, a abstração vazou e o ajuste deve ser feito no Page Object.
- **Exemplo Prático:** `createNewPassword()` lida internamente tanto com um cofre vazio (botão direto) quanto com um cofre preenchido (ação dentro de menu de opções). O spec possui apenas 1 linha.
- **Nomes por Intenção:**
  - ✅ `renamePasswordEntry(newName)` | ❌ `clickEditFillNameAndSave()`
  - ✅ `confirmPasswordRename(newName)` | ❌ `expect(page.locator('.title')).toHaveText()`
- **Exceção Consciente:** `ui-contract/` e `wcag-compliant/` testam a própria interface, logo são os únicos que mudam legitimamente quando o design muda.

---

## 7. Convenções de Nomenclatura

- **Terminologia Consistente nas 3 Camadas:** Spec, nome do método e nome da classe usam o mesmo vocabulário e palavras completas (ex: `createAdministrator` em vez de misturar `createAdmin`, `Administrator` e `AdminPage`).
- **Títulos de Testes como Histórias de Usuário:** `"search by password"`, `"create new generated custom password"`, `"edit password via sidebar navigation"`.
- **Débito Conhecido / Bugs:** Inclua a URL da issue/Jira no título e marque com `test.fail` para manter o débito rastreável no relatório em vez de usar `test.skip`.
- **Extensões de Arquivo:**
  - `*.user-flow.spec.ts`
  - `*.ui.spec.ts` / `*.responsive.spec.ts`
  - `*.a11y.spec.ts`
  - `*.security.spec.ts`
  - `*.health.spec.ts`

---

## 8. Estrutura de um Spec

- **Padrão:** Arrange, Act, Assert (AAA), com um quarto bloco opcional para limpeza via UI se necessário.
- **Declaração de Variáveis:** Declare variáveis próximas de onde são usadas pela primeira vez (evite blocos gigantes de setup no topo).
- **Granularidade:** Agrupe por área de funcionalidade. Divida o arquivo quando:
  1. Acumular 3 ou mais testes em uma sub-área específica.
  2. O arquivo ficar longo demais para escanear rapidamente.
  3. Houver fronteiras reais de execução (tags diferentes, fixtures diferentes).

---

## 9. Gerenciamento de Estado (Escolhido, Não Criado)

- **Pool de Usuários (`helpers/users.ts`):** Usuários pré-configurados por fixtures e estado de conta (`pfmUsers`, `pfmSecurityUsers`, `fmUsers`).
- **Seleção por Estado:** Escolha o usuário com base no estado/plano necessário, **nunca por índice de array** (`users[0]`).
- **Limpeza Idempotente via UI:** Hooks de `afterEach` (ex: `deleteAllPasswordsIfAny`, `deleteTrash`) rodam em loops até que o ambiente esteja verificavelmente limpo.
- **Ferramentas Operacionais (`tests/utils/`):** Scripts CLI via npm (`qa-create-account`, `qa-cleanup-files`, `qa-seed-data`, `qa-debug-clean`).

---

## 10. Determinismo e Disciplina Anti-Flakiness

- 🚫 **Proibido terminantemente:** `waitForTimeout()` e `networkidle`.
- **Esperas Baseadas em Condições:**
  - Esperar contagem de spinner chegar a zero (`mat-spinner:visible` count 0).
  - Esperar visibilidade de elemento-chave via `waitFor({ state: 'visible' })`.
  - Esperar resposta de rede específica via `waitForResponse`.
- **Listeners Antes da Ação:** Registre o listener antes do clique para não perder a corrida de rede:
  ```typescript
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/passwords') && resp.status() === 200),
    button.click()
  ]);
  ```
- **Estados Divergentes:** Use `locator.or(...)` e aguarde o que aparecer primeiro em vez de timeouts condicionais.
- **Comentários Obrigatórios em Esperas Específicas:** Registre o motivo e ticket de qualquer espera não óbvia.
- **Configuração de Execução:**
  - Retries: `1` no CI, `0` localmente.
  - Traces: `on` localmente, `on-first-retry` no CI.
  - Screenshots: `only-on-failure`. Vídeo: `off`.
  - Execução paralela por padrão; testes que mutam estado compartilhado usam `test.describe.configure({ mode: 'serial' })`.

---

## 11. Tags e Filtros de CI

- Todos os testes devem possuir tags de execução no título:
  - `@pfm_smoke`
  - `@pfm_regression`
  - `@pfm_security`
  - `@pfm_ui_contract`
  - `@pfm_a11y`
- **Regra:** Teste sem tag `@pfm_*` não é executado na pipeline de CI.

---

## 12. Ambientes, Segredos e Segurança

- **Resolução de URLs:** `TEST_CLIENT` + `TEST_ENV` resolvidos centralizadamente em `helpers/urls.ts`. Nunca use URLs hardcoded em specs.
- **Trava de Produção:** `getBaseUrl()` rejeita `TEST_ENV=prod` a menos que `ALLOW_PROD=1` esteja explicitamente definido.
- **Validação de Variáveis:** `helpers/env.getEnv()` lança erro imediato caso uma variável obrigatória esteja ausente.
- **Proteção de Segredos:** Credenciais residem em variáveis de ambiente, nunca no repositório. Pastas `.auth/` e `artifacts/` estão no `.gitignore`.

---

## 13. TypeScript e Regras de Lint

- **Retornos Explícitos Obrigatórios:** `@typescript-eslint/explicit-function-return-type` como erro. Toda função e método de Page Object deve declarar seu tipo de retorno (`Promise<void>`, `Promise<Passwords>`, etc.).
- **Aliases de Caminho Mandatórios:** Use `@helpers/*`, `@pom/*`, `@fixtures/*` em vez de caminhos relativos `../../..`.
- **Prettier:** Ponto e vírgula obrigatório, vírgula no final de múltiplas linhas.

---

## 14. Higiene do Git

- **Nomenclatura de Branches:**
  - Prefixo de suíte ou intenção: `user-flows/`, `security/`, `a11y/`, `feat/`, `fix/`, `chore/`, `ci/`.
  - Corpo em `kebab-case` com foco no resultado (ex: `user-flows/create-custom-password`).
- **Assuntos de Commit:** `<escopo>: <verbo imperativo> <resultado>` (ex: `global-setup: say which base URL is unreachable when pre-flight fails`).

---

## 15. Anti-Padrões Rejeitados em Code Review

1. ❌ `expect()` inline no arquivo de spec.
2. ❌ Seletores de DOM, classes CSS ou IDs no arquivo de spec.
3. ❌ `waitForTimeout` ou `networkidle` em qualquer lugar.
4. ❌ Spec importando diretamente de `pom/components/`.
5. ❌ Método de ação no Page Object que navega para outra tela mas retorna `void`.
6. ❌ Teste sem tag `@pfm_*`.
7. ❌ Usuário de teste selecionado por índice em vez de estado/perfil.
8. ❌ Asserções duplicadas para mascarar race condition.
9. ❌ `test.skip` silencioso em vez de `test.fail` com link do Jira.

---

## 16. Como Defender Essa Arquitetura em Entrevistas

- **Manutenibilidade:** O custo de manutenção de uma suíte é definido pelo volume de "conhecimento volátil" (seletores, menus, markup, spinners) que cada arquivo de teste contém. Ao isolar 100% da volatilidade nos Page Objects e Row Components, os specs tornam-se resistentes a redesigns de UI e falam a linguagem do negócio.
- **Confiança e Sinal de Qualidade:** Com métodos `confirm*` legíveis, tags que alimentam o CI, e defeitos conhecidos documentados com `test.fail`, a liderança e os stakeholders conseguem enxergar com clareza o que está coberto, o que está falhando e o que é dívida técnica conhecida.
