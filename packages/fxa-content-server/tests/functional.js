/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const testsSettings = require('./functional_settings');
module.exports = testsSettings.concat([
  'tests/functional/fx_browser_relier.js',
  'tests/functional/oauth_webchannel.js',
  'tests/functional/reset_password.js',
  'tests/functional/oauth_require_totp.js',
  'tests/functional/sign_up_with_code.js',
  // new and flaky tests above here',
  'tests/functional/404.js',
  'tests/functional/500.js',
  'tests/functional/avatar.js',
  'tests/functional/back_button_after_start.js',
  'tests/functional/bounced_email.js',
  'tests/functional/confirm.js',
  'tests/functional/connect_another_device.js',
  'tests/functional/cookies_disabled.js',
  'tests/functional/email_domain_mx_validation.js',
  'tests/functional/email_opt_in.js',
  'tests/functional/force_auth.js',
  'tests/functional/fx_desktop_handshake.js',
  'tests/functional/fx_firstrun_v2.js',
  'tests/functional/fx_ios_v1_sign_in.js',
  'tests/functional/fx_ios_v1_sign_up.js',
  'tests/functional/legal.js',
  'tests/functional/oauth_permissions.js',
  'tests/functional/oauth_prompt_none.js',
  'tests/functional/oauth_query_param_validation.js',
  'tests/functional/oauth_reset_password.js',
  'tests/functional/oauth_settings_clients.js',
  'tests/functional/oauth_sign_in.js',
  'tests/functional/oauth_sign_in_token_code.js',
  'tests/functional/oauth_sign_up.js',
  'tests/functional/oauth_sync_sign_in.js',
  'tests/functional/pages.js',
  'tests/functional/password_strength.js',
  'tests/functional/password_visibility.js',
  'tests/functional/post_verify/newsletters.js',
  'tests/functional/post_verify/force_password_change.js',
  'tests/functional/post_verify/account_recovery.js',
  'tests/functional/post_verify/secondary_email.js',
  'tests/functional/push.js',
  'tests/functional/pp.js',
  'tests/functional/refreshes_metrics.js',
  'tests/functional/robots_txt.js',
  'tests/functional/security_events.js',
  'tests/functional/sign_in.js',
  'tests/functional/sign_in_blocked.js',
  'tests/functional/sign_in_cached.js',
  'tests/functional/sign_in_recovery_code.js',
  'tests/functional/sign_up.js',
  'tests/functional/subscriptions.js',
  'tests/functional/support.js',
  'tests/functional/sync_v1.js',
  'tests/functional/sync_v2.js',
  'tests/functional/sync_v3_email_first.js',
  'tests/functional/sync_v3_sign_in.js',
  'tests/functional/sync_v3_sign_up.js',
  'tests/functional/sync_v3_force_auth.js',
  'tests/functional/sync_v3_reset_password.js',
  'tests/functional/sync_v3_settings.js',
  'tests/functional/tos.js',

  // Disabled because of https://github.com/mozilla/fxa/issues/9863
  // 'tests/functional/verification_reminders.js',

  // Disabled because this test migrated to Playwright
  // See `/functional-test`
  // 'tests/functional/oauth_handshake.js',
  // 'tests/functional/oauth_force_auth.js',
]);

// Mocha tests are only exposed during local dev, not on prod-like
// instances such as latest, stable, stage, and prod. To avoid
// Teamcity failing trying to run mocha tests, expose an environment
// variable it can use to skip the mocha tests.
if (!process.env.SKIP_MOCHA) {
  module.exports.unshift('tests/functional/mocha.js');
}
