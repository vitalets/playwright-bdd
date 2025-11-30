# Использование с BrowserStack

Вы можете запускать Playwright-BDD тесты в облаке на платформе [BrowserStack](https://www.browserstack.com/).

#### 1. Установите `browserstack-node-sdk`
```
npm i -D browserstack-node-sdk
```

#### 2. Настройте учетные данные BrowserStack
Создайте файл `browserstack.yml` в корне проекта и добавьте ваше имя пользователя и ключ доступа BrowserStack [username and access key](https://www.browserstack.com/accounts/settings):
```yaml
userName: YOUR_USERNAME
accessKey: YOUR_ACCESS_KEY
```

#### 3. Настройте браузеры
Добавьте [конфигурацию](https://www.browserstack.com/docs/automate/playwright/project-config) для метаданных сборки и браузеров для запуска ваших тестов:
```yaml
userName: YOUR_USERNAME
accessKey: YOUR_ACCESS_KEY

projectName: playwright-bdd sample
buildName: my-build-name
buildIdentifier: '#${BUILD_NUMBER}'
platforms:
  - os: Windows
    osVersion: 11
    browserName: chrome
    browserVersion: latest
    playwrightConfigOptions:
      name: chromium
  - os: OS X
    osVersion: Ventura
    browserName: playwright-webkit
    browserVersion: latest
    playwrightConfigOptions:
      name: osx

  # больше браузеров
```

#### 4. Запустите тесты

Запустите тесты следующей командой:
```
npx bddgen && npx browserstack-node-sdk playwright test
```

Проверьте результаты тестов в [дашборде BrowserStack](https://automate.browserstack.com/dashboard):

![BrowserStack dashboard](./../../guides/_media/browserstack.png)

> Вот [полностью рабочий пример с BrowserStack](https://github.com/vitalets/playwright-bdd-example/tree/browserstack).
