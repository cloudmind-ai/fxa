/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import Signup from '.';
import { MozServices } from '../../lib/types';
import {
  IntegrationType,
  isSyncDesktopV3Integration,
  isSyncOAuthIntegration,
} from '../../models';
import { mockUrlQueryData } from '../../models/mocks';
import { SignupQueryParams } from '../../models/pages/signup';
import {
  MOCK_REDIRECT_URI,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
  MOCK_AUTH_AT,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
  MOCK_EMAIL,
  MOCK_CLIENT_ID,
} from '../mocks';
import {
  BeginSignupHandler,
  SignupBaseIntegration,
  SignupIntegration,
  SignupOAuthIntegration,
} from './interfaces';
import { getSyncEngineIds } from '../../components/ChooseWhatToSync/sync-engines';

export const MOCK_SEARCH_PARAMS = {
  email: MOCK_EMAIL,
};

export function createMockSignupWebIntegration(): SignupBaseIntegration {
  return {
    type: IntegrationType.Web,
    getService: () => Promise.resolve(MozServices.Default),
    isSync: () => false,
  };
}

export function createMockSignupSyncDesktopV3Integration(): SignupBaseIntegration {
  return {
    type: IntegrationType.SyncDesktopV3,
    getService: () => Promise.resolve(MozServices.FirefoxSync),
    isSync: () => true,
  };
}

export function createMockSignupOAuthIntegration(
  clientId?: string,
  isSync = false
): SignupOAuthIntegration {
  return {
    type: IntegrationType.OAuth,
    getRedirectUri: () => MOCK_REDIRECT_URI,
    saveOAuthState: () => {},
    getService: () => clientId || MOCK_CLIENT_ID,
    isSync: () => isSync,
  };
}

export const BEGIN_SIGNUP_HANDLER_RESPONSE = {
  data: {
    SignUp: {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      authAt: MOCK_AUTH_AT,
      keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    },
    unwrapBKey: MOCK_UNWRAP_BKEY,
  },
};

export const BEGIN_SIGNUP_HANDLER_RESPONSE_UNDER_18 = {
  data: {
    SignUp: {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      authAt: MOCK_AUTH_AT,
      keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    },
    unwrapBKey: MOCK_UNWRAP_BKEY,
  },
};

export const BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE = {
  data: null,
  error: {
    errno: 0,
    message: 'wham bam thank you Sam',
    ftlId: '',
  },
};

export const mockBeginSignupHandler: BeginSignupHandler = () =>
  Promise.resolve(BEGIN_SIGNUP_HANDLER_RESPONSE);

export const signupQueryParams = {
  email: MOCK_EMAIL,
};

export const signupQueryParamsWithContent = {
  ...signupQueryParams,
  emailStatusChecked: 'true',
};

export const Subject = ({
  queryParams = signupQueryParams,
  integration = createMockSignupWebIntegration(),
  beginSignupHandler = mockBeginSignupHandler,
}: {
  queryParams?: Record<string, string>;
  integration?: SignupIntegration;
  beginSignupHandler?: BeginSignupHandler;
}) => {
  const urlQueryData = mockUrlQueryData(queryParams);
  const queryParamModel = new SignupQueryParams(urlQueryData);
  const isSyncOAuth = isSyncOAuthIntegration(integration);
  return (
    <LocationProvider>
      <Signup
        {...{
          integration,
          queryParamModel,
          beginSignupHandler,
          isSyncOAuth,
          isSyncWebChannel:
            isSyncOAuth || isSyncDesktopV3Integration(integration),
          webChannelEngines: getSyncEngineIds(),
        }}
      />
    </LocationProvider>
  );
};
