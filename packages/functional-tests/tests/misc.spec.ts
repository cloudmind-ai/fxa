import { test, expect } from '../lib/fixtures/standard';

test.describe('severity-1', () => {
  // runs all mocha tests - see output here: http://127.0.0.1:3030/tests/index.html
  test('content-server mocha tests', async ({ target, page }, { project }) => {
    test.skip(project.name !== 'local', 'mocha tests are local only');
    test.slow();
    await page.goto(`${target.contentServerUrl}/tests/index.html`, {
      waitUntil: 'load',
    });
    await page.waitForTimeout(2000); // wait for mocha to load
    await page.evaluate(() =>
      globalThis.runner.on('end', () => (globalThis.done = true))
    );
    await page.waitForFunction(() => globalThis.done, {}, { timeout: 0 });
    const failures = await page.evaluate(() => globalThis.runner.failures);
    expect(failures).toBe(0);
  });

  test('prompt=consent', async ({
    credentials,
    pages: { page, relier, login },
  }, { project }) => {
    await relier.goto('prompt=consent');
    await relier.clickEmailFirst();
    await login.login(credentials.email, credentials.password);
    expect(await login.permissionsHeader()).toBeVisible();
    await login.submit();
    expect(await relier.isLoggedIn()).toBeVisible();
  });
});

test.describe('robots.txt', () => {
  test('should allow bots to access all pages', async ({ target, page }) => {
    await page.goto(`${target.contentServerUrl}/robots.txt`, {
      waitUntil: 'load',
    });
    const text = await page.locator('body').innerText();
    expect(/^Allow:/gm.test(text)).toBeTruthy();
  });
});
