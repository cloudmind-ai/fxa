/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { currentAccount } from '../../../lib/cache';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
} from '../../../models';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import ConfirmSignupCode from '.';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { GetEmailBounceStatusResponse, LocationState } from './interfaces';
import sentryMetrics from 'fxa-shared/sentry/browser';
import { useQuery } from '@apollo/client';
import { EMAIL_BOUNCE_STATUS_QUERY } from './gql';

export const POLL_INTERVAL = 5000;

function getAccountInfo(
  emailFromLocationState?: string,
  sessionTokenFromLocationState?: string,
  uidFromLocationState?: string
) {
  let email = emailFromLocationState;
  let sessionToken = sessionTokenFromLocationState;
  let uid = uidFromLocationState;
  // only read from local storage if email isn't provided via router state
  if (!email || !sessionToken || !uid) {
    const storedLocalAccount = currentAccount();
    email = storedLocalAccount?.email;
    sessionToken = storedLocalAccount?.sessionToken;
    uid = storedLocalAccount?.uid;
  }
  return { email, sessionToken, uid };
}

const SignupConfirmCodeContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const {
    origin,
    selectedNewsletterSlugs: newsletterSlugs,
    offeredSyncEngines,
    declinedSyncEngines,
    keyFetchToken,
    unwrapBKey,
    sessionToken: sessionTokenFromLocationState,
    email: emailFromLocationState,
    uid: uidFromLocationState,
  } = location.state || {};
  const navigate = useNavigate();

  // If a user tries to signin and they haven't verified their account yet, we pass
  // this state through router state and redirect here. Otherwise, we read from localStorage.
  const { email, sessionToken, uid } = getAccountInfo(
    emailFromLocationState,
    sessionTokenFromLocationState,
    uidFromLocationState
  );

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const navigateToContentServer = useCallback(
    (path: string, hasBounced?: boolean) => {
      const params = new URLSearchParams(location.search);

      // If the user reached this page from React signup,
      // 'email' and 'emailStatusChecked' will be set as params
      // when the user was navigated from Backbone to React.
      // This is temporary until index is converted to React.
      // Passing back the 'email' param causes various behaviors in
      // content-server since it marks the email as "coming from a RP".
      params.delete('emailStatusChecked');
      params.delete('email');
      // passing the 'bouncedEmail' param will display an error tooltip
      // on the email-first signin/signup page and allow to check
      // if the entered email matches the bounced email
      hasBounced && email && params.set('bouncedEmail', email);
      if (Array.from(params).length > 0) {
        path += `?${params.toString()}`;
      }
      hardNavigateToContentServer(path);
    },
    [email, location.search]
  );

  // Poll for hard bounces registered in database for the entered email.
  // Previously, we checked if the account was deleted, and assumed
  // that implied the email bounced/was invalid.
  const { data } = useQuery<GetEmailBounceStatusResponse>(
    EMAIL_BOUNCE_STATUS_QUERY,
    {
      variables: { input: email },
      pollInterval: POLL_INTERVAL,
    }
  );

  // Handle email bounces
  useEffect(() => {
    if (data?.emailBounceStatus.hasHardBounce) {
      const hasBounced = true;
      // if arriving from signup, return to '/' and allow user to signup with another email
      if (origin === 'signup') {
        navigateToContentServer('/', hasBounced);
      } else {
        // if not arriving from signup, redirect to signin_bounced for support info
        navigateToContentServer('/signin_bounced', hasBounced);
      }
    }
  }, [data, origin, navigate, navigateToContentServer]);

  // TODO: This check and related test can be moved up the tree to the App component,
  // where a missing integration should be caught and handled.
  if (!integration) {
    return <LoadingSpinner fullScreen />;
  }

  if (!uid || !sessionToken || !email) {
    navigateToContentServer('/');
    return <LoadingSpinner fullScreen />;
  }

  // TODO: UX for this, FXA-8106
  if (oAuthDataError) {
    return (
      <AppLayout>
        <CardHeader
          headingText="Unexpected error"
          headingTextFtlId="auth-error-999"
        />
      </AppLayout>
    );
  }

  // Users in this state should never reach this as they should see the Backbone version
  // of this page until we convert signin to React, but guard against anyway. See
  // comment in `router.js` for this route for more info.
  if (isOAuthIntegration(integration) && (!keyFetchToken || !unwrapBKey)) {
    // Report an error to Sentry on the off-chance that this React page is reached without required state
    sentryMetrics.captureException(
      new Error(
        'WARNING: User should not have reached ConfirmSignupCode in React without required state for OAuth integration. Redirecting to Backbone signin page.'
      )
    );
    navigateToContentServer('/');
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ConfirmSignupCode
      {...{
        uid,
        email,
        sessionToken,
        integration,
        finishOAuthFlowHandler,
        newsletterSlugs,
        offeredSyncEngines,
        declinedSyncEngines,
        keyFetchToken,
        unwrapBKey,
      }}
    />
  );
};
export default SignupConfirmCodeContainer;
