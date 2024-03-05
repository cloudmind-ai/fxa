/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import ConfirmSignupCode from '.';
import { IntegrationType } from '../../../models';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import {
  ConfirmSignupCodeBaseIntegration,
  ConfirmSignupCodeIntegration,
} from './interfaces';

export const MOCK_AUTH_ERROR = {
  errno: 999,
  message: 'Something broke',
};

export const MOCK_SIGNUP_CODE = '123456';

export function createMockWebIntegration({
  redirectTo = undefined,
}: { redirectTo?: string } = {}): ConfirmSignupCodeBaseIntegration {
  return {
    type: IntegrationType.Web,
    data: { uid: MOCK_UID, redirectTo },
  };
}

export const Subject = ({
  integration = createMockWebIntegration(),
  newsletterSlugs,
}: {
  integration?: ConfirmSignupCodeIntegration;
  newsletterSlugs?: string[];
}) => {
  return (
    <LocationProvider>
      <ConfirmSignupCode
        {...{
          integration,
          newsletterSlugs,
        }}
        email={MOCK_EMAIL}
        finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
        keyFetchToken={MOCK_KEY_FETCH_TOKEN}
        sessionToken={MOCK_SESSION_TOKEN}
        uid={MOCK_UID}
        unwrapBKey={MOCK_UNWRAP_BKEY}
      />
    </LocationProvider>
  );
};
