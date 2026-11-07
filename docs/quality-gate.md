# Quality gate / merge policy

This repository runs Playwright E2E tests on every pull request and every push to main.

## Enforce the gate in GitHub

A workflow alone does **not** block direct pushes or prevent GitHub Pages branch deployments. A repository administrator must configure a branch ruleset or branch protection for `main`:

1. Open **Settings → Rules → Rulesets → New branch ruleset** (or **Settings → Branches → Add branch protection rule**).
2. Target `main`; set enforcement to **Active**.
3. Require a pull request before merging and require status checks to pass.
4. Select the exact check **quality-gate** from the **E2E Playwright** workflow (run the workflow at least once so the check appears).
5. Require branches to be up to date before merging, and block force pushes/deletions.
6. Disable bypass permissions for ordinary contributors and, if appropriate, include administrators.
7. Save and test using a pull request that deliberately fails E2E.

**Important:** Existing GitHub Pages configured to deploy directly from the `main` branch will publish any commit that reaches `main`. The ruleset prevents untested merges only when configured correctly. Direct pushes and admin bypasses must also be restricted.

For stronger release gating, move Pages deployment to a GitHub Actions workflow that depends on `quality-gate`, then change Pages **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Do not enable two competing deployment methods.

## Local checks

```sh
npm install
npx playwright install chromium
npm run test:e2e
```

The suite covers desktop Chromium and Pixel mobile emulation. Test artifacts and traces are uploaded to GitHub Actions on each run.
