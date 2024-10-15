# language: es
Característica: Sitio de Playwright

  Escenario: Verificar título
    Dado que abro la url "https://playwright.dev"
    Cuando hago clic en el enlace "Get started"
    Entonces veo en el título "Playwright"
