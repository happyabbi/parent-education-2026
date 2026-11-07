# End-to-end tests
Run `npm install`, `npx playwright install chromium`, then `npm run test:e2e`.
The suite tests the static GitHub Pages content locally in Chromium desktop and mobile emulation. CI runs on pushes to main and pull requests; see GitHub Actions for actual pass/fail results. No production user data is accessed.
