# Использование с Nx

Вы можете запускать Playwright-BDD тесты с [Nx](https://nx.dev) и плагином [@nx/playwright](https://nx.dev/nx-api/playwright).

Представьте следующую структуру рабочего пространства:
```
/app1
  /e2e
  ...
  project.json
  playwright.config.ts
/app2
  /e2e
  ...
  project.json
  playwright.config.ts
nx.json
```

Чтобы запустить e2e тесты внутри `app1` или `app2`, добавьте цели в `project.json` каждого приложения:
```json
{
  "targets": {
    "bddgen": {
      "command": "bddgen",
      "options": {
        "cwd": "{projectRoot}"
      }
    },
    "e2e": {
      "executor": "@nx/playwright:playwright",
      "dependsOn": ["bddgen"],
      "options": {
        "config": "{projectRoot}"
      }
    }
  }
}
```

Теперь из корня рабочего пространства вы можете запустить:
```bash
npx nx e2e app1
# или
npx nx e2e app2
```

Чтобы запустить e2e тесты в **обоих** `app1` и `app2`:
```bash
npx nx run-many -t e2e -p app1 app2
```

Если есть много проектов с одинаковой настройкой e2e, вы можете переместить настройки по умолчанию в `nx.json`:
```json
{
  "targetDefaults": {
    "bddgen": {
      "command": "bddgen",
      "options": {
        "cwd": "{projectRoot}"
      }
    },
    "e2e": {
      "executor": "@nx/playwright:playwright",
      "dependsOn": ["bddgen"],
      "options": {
        "config": "{projectRoot}"
      }
    }
  }
}
```

Затем в `project.json` оставьте пустые цели:
```json
{
  "targets": {
    "bddgen": {},
    "e2e": {}
  }
}
```

Ознакомьтесь с [рабочим примером с Nx и playwright-bdd](https://github.com/vitalets/playwright-bdd-example/tree/nx).
