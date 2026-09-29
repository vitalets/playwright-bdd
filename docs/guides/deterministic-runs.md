# Deterministic runs against single-session and rate-limited apps

Some web applications keep a single shared session per user or enforce rate limiting / anti-bot measures. Running Playwright with many parallel workers against such apps can produce **flaky failures that aren't caused by your tests**. This guide collects practical settings to keep a BDD suite repeatable in those situations.

## The problem

- A **single-session app** (for example an SPA that keeps one login session per user) can bounce you out when the same credentials are exercised from several parallel browsers at once. When scenarios share one account, parallel execution causes a cascade of login bounces.
- **Public / demo apps** frequently rate-limit requests. With `fullyParallel: true` and many workers you can hit transient `net::ERR_CONNECTION_RESET` responses or HTTP 429s that disappear on the next run.

These failures are environmental, not test bugs — so the fix belongs in the runner configuration rather than in the assertions.

## Recommended settings

In your `playwright.config.ts` (the same file where you call `defineBddConfig`):

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  // playwright-bdd wiring
  ...defineBddConfig({ features: 'features/*.feature', steps: 'steps/*.ts' }),
  // serial execution keeps a single session stable
  workers: process.env.CI ? 1 : 1,
  fullyParallel: false,
  // retries absorb the occasional environment-level flake
  retries: process.env.CI ? 2 : 1,
  use: { baseURL: 'https://example.com' },
});
```

- `workers: 1` runs the scenarios serially, so a single shared session is never thrashed by concurrent browsers.
- `fullyParallel: false` prevents scenarios within a file (and by extension the shared worker) from running in parallel — the safest option for shared-session apps.
- `retries` re-runs a scenario that failed, absorbing one-off network/rate-limit flakiness instead of failing the pipeline.

## How this applies to playwright-bdd specifically

The settings above are Playwright-level, but they matter **especially** in playwright-bdd because the framework manages shared state across scenarios through worker hooks and worker-scoped fixtures.

In playwright-bdd the canonical place to establish a single shared session is a [`BeforeWorker`](../api/hooks.md) (`BeforeAll`) hook backed by a worker-scoped fixture (`$workerInfo`). That hook runs **once per worker** — so `workers: 1` opens the session exactly once, while `workers: N` would open, and often bounce, the same single session N times. `fullyParallel: true` compounds this: several feature files can run concurrently inside the same worker, thrashing a shared worker fixture on a single-session app.

Given that, serial execution (`workers: 1`, `fullyParallel: false`) is the sound default for playwright-bdd suites aimed at single-session or rate-limited targets:

- `BeforeWorker` / `AfterWorker` hooks and shared worker fixtures behave predictably when there is exactly one worker.
- A retried scenario re-runs in the same worker, reusing the already-established session instead of re-authenticating.
- Worker hooks are driven by **feature-level** tags; scenario-level tags still trigger the hook for the whole feature file — one more reason a single serial worker is the stable baseline.

## Navigation retries in Page Objects

For particularly unstable public apps, add a small retry around navigation inside your Page Object:

```ts
export class LoginPage {
  constructor(readonly page: Page) {}

  async open() {
    // attempt the navigation a few times (rate-limit / anti-bot friendly)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.page.goto('/', { waitUntil: 'domcontentloaded' });
        return;
      } catch (err) {
        if (attempt === 3) throw err;
        await this.page.waitForTimeout(2000);
      }
    }
  }
}
```

## Single shard in CI

When reporters or third-party services expect a single run, run your suite as **one shard** in CI so results and the session stay consistent:

```yaml
- name: Run BDD tests
  run: npx bddgen && npx playwright test --shard=1/1
```

## Why this works

Serial execution (`workers: 1`, `fullyParallel: false`) trades speed for determinism: the same ordering every run, a stable session, and no artificial load on a rate-limited app. Retries then handle the residual environment noise, keeping CI green without weakening your assertions.