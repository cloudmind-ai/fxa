/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLError } from 'graphql';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { BeginSigninError, NavigationOptions } from './interfaces';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../lib/auth-errors/auth-errors';
import { isOAuthIntegration } from '../../models';
import { NavigateFn } from '@reach/router';
import { hardNavigate } from 'fxa-react/lib/utils';
import { FinishOAuthFlowHandler } from '../../lib/oauth/hooks';

// TODO in Sync signin ticket
// function getSyncNavigate() {
// const searchParams = new URLSearchParams(location.search);
// searchParams.set('showSuccessMessage', 'true');
// const to = `/connect_another_device?${searchParams}`
// }

export async function handleNavigation(
  navigationOptions: NavigationOptions,
  navigate: NavigateFn
) {
  const { to, state, shouldHardNavigate } = await getNavigationTarget(
    navigationOptions
  );
  if (shouldHardNavigate) {
    // Hard navigate to RP, or (temp until CAD is Reactified) CAD
    hardNavigate(to);
    return;
  }
  if (state) {
    navigate(to, { state });
  } else {
    navigate(to);
  }
}

export async function getOAuthRedirectAndHandleSync(
  finishOAuthFlowHandler: FinishOAuthFlowHandler,
  {
    uid,
    sessionToken,
    keyFetchToken,
    unwrapBKey,
  }: {
    uid: hexstring;
    sessionToken: hexstring;
    keyFetchToken?: string;
    unwrapBKey?: string;
  }
) {
  const { redirect, code, state } = await finishOAuthFlowHandler(
    uid,
    sessionToken,
    keyFetchToken,
    unwrapBKey
  );

  // TODO in Sync signin ticket. Do we want to do firefox.fxAOAuthLogin here
  // if the session isn't verified?
  //
  // if (integration.isSync()) {
  //   firefox.fxaOAuthLogin({
  //     action: 'signin',
  //     code,
  //     redirect,
  //     state,
  //   })
  // TODO: don't hard navigate once CAD is converted to React
  //   return { to: getSyncNavigate(), shouldHardNavigate: true }
  // }
  return { to: redirect, shouldHardNavigate: true };
}

const getNavigationTarget = async ({
  email,
  signinData: {
    verified,
    verificationReason,
    verificationMethod,
    keyFetchToken,
    uid,
    sessionToken,
  },
  unwrapBKey,
  integration,
  finishOAuthFlowHandler,
  queryParams,
}: NavigationOptions) => {
  const isOAuth = isOAuthIntegration(integration);

  // Note, all navigations are missing query params. Add these when working on
  // subsequent tickets.
  if (!verified) {
    // TODO: Does force password change ever reach here, or can we move
    // CHANGE_PASSWORD checks to another page?
    if (
      ((verificationReason === VerificationReasons.SIGN_IN ||
        verificationReason === VerificationReasons.CHANGE_PASSWORD) &&
        verificationMethod === VerificationMethods.TOTP_2FA) ||
      (isOAuth && integration.wantsTwoStepAuthentication())
    ) {
      const oAuthResult = isOAuth
        ? await getOAuthRedirectAndHandleSync(finishOAuthFlowHandler, {
            uid,
            sessionToken,
            keyFetchToken,
            unwrapBKey,
          })
        : undefined;
      return {
        to: `/signin_totp_code${queryParams}`,
        state: { verificationReason, verificationMethod, oAuthResult },
      };
    } else if (verificationReason === VerificationReasons.SIGN_UP) {
      // do we need this?
      // if (verificationMethod !== VerificationMethods.EMAIL_OTP) {
      //  send email verification since this screen doesn't do it automatically
      // }

      // OAUTH TODO in FXA-6518: something's not quite right with the state here
      return {
        to: `/confirm_signup_code${queryParams}`,
        state: {
          keyFetchToken,
          unwrapBKey,
          sessionToken,
          email,
        },
      };
    } else {
      // TODO: Pretty sure we want this to be the default. The check used to be:
      // if (
      //   verificationMethod === VerificationMethods.EMAIL_OTP &&
      //   (verificationReason === VerificationReasons.SIGN_IN || verificationReason === VerificationReasons.CHANGE_PASSWORD)) {

      const oAuthResult = isOAuth
        ? await getOAuthRedirectAndHandleSync(finishOAuthFlowHandler, {
            uid,
            sessionToken,
            keyFetchToken,
            unwrapBKey,
          })
        : undefined;
      return {
        to: `/signin_token_code${queryParams}`,
        state: {
          email,
          // TODO: FXA-9177 We may want to store this in local apollo cache
          // instead of passing it via location state, depending on
          // if we reference it in another spot or two and if we need
          // some action to happen dependent on it that should occur
          // without first reaching /signin.
          verificationReason,
          oAuthResult,
        },
      };
    }
  }

  if (isOAuth) {
    const oAuthResult = await getOAuthRedirectAndHandleSync(
      finishOAuthFlowHandler,
      {
        uid,
        sessionToken,
        keyFetchToken,
        unwrapBKey,
      }
    );
    return {
      to: oAuthResult.to,
      shouldHardNavigate: oAuthResult.shouldHardNavigate,
    };
  }

  return { to: '/settings' };
};

export const handleGQLError = (error: any) => {
  const graphQLError: GraphQLError = error.graphQLErrors?.[0];
  const errno = graphQLError?.extensions?.errno as number;

  if (errno && AuthUiErrorNos[errno]) {
    const uiError = {
      message: AuthUiErrorNos[errno].message,
      errno,
      verificationMethod:
        (graphQLError.extensions.verificationMethod as VerificationMethods) ||
        undefined,
      verificationReason:
        (graphQLError.extensions.verificationReason as VerificationReasons) ||
        undefined,
      retryAfter: (graphQLError?.extensions?.retryAfter as number) || undefined,
      retryAfterLocalized:
        (graphQLError?.extensions?.retryAfterLocalized as string) || undefined,
    };
    return { error: uiError as BeginSigninError };
    // if not a graphQLError or if no localizable message available for error
  }

  return { error: AuthUiErrors.UNEXPECTED_ERROR as BeginSigninError };
};
