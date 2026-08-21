import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Carrega as variáveis de ambiente do arquivo .env caso exista.
 * No CI (GitHub Actions), as variáveis são injetadas diretamente via Secrets/Environment.
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Consulte https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Execução paralela dos testes */
  fullyParallel: true,
  /* Falha no CI se houver test.only no código */
  forbidOnly: !!process.env.CI,
  /* Retry: 1 no CI, 0 localmente */
  retries: process.env.CI ? 1 : 0,
  /* Workers */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter */
  reporter: [['html', { open: 'never' }], ['list']],
  /* Configurações compartilhadas */
  use: {
    /* Base URL obtida a partir das variáveis de ambiente */
    baseURL: process.env.BASE_URL || 'https://front.serverest.dev',

    /* Traces: 'on' localmente para depuração rápida, 'on-first-retry' no CI */
    trace: process.env.CI ? 'on-first-retry' : 'on',

    /* Captura de tela somente em caso de falha */
    screenshot: 'only-on-failure',

    /* Vídeo desligado por padrão */
    video: 'off',
  },

  /* Navegadores configurados */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
