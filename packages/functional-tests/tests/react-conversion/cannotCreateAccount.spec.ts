/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { test } from '../../lib/fixtures/standard';
import { getReactFeatureFlagUrl } from '../../lib/react-flag';

test.beforeEach(async ({ pages: { configPage } }) => {
  // This test requires simple react routes to be enabled
  const config = await configPage.getConfig();
  test.skip(config.showReactApp.simpleRoutes !== true);
});

test.describe('react-conversion', () => {
  test('Cannot create account', async ({ page, target }) => {
    await page.goto(getReactFeatureFlagUrl(target, '/cannot_create_account'));
    page.locator('#root');
  });
});
