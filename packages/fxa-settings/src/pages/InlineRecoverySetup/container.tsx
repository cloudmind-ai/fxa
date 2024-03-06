/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback, useEffect, useState } from 'react';
import InlineRecoverySetup from './index';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { getCode } from '../../lib/totp';
import { MozServices } from '../../lib/types';
import {
  OAuthIntegration,
  useAccount,
  useAuthClient,
  useSession,
} from '../../models';
import { TotpToken } from '../InlineTotpSetup';
import { VERIFY_TOTP_MUTATION } from './gql';

export const InlineRecoverySetupContainer = ({
  isSignedIn,
  integration,
  serviceName,
}: {
  isSignedIn: boolean;
  integration: OAuthIntegration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const account = useAccount();
  const session = useSession();
  const navigate = useNavigate();
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: {
      totp: TotpToken;
    };
  };
  const totp = location.state?.totp;

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>();
  const [verifyTotp] = useMutation<{ verifyTotp: { success: boolean } }>(
    VERIFY_TOTP_MUTATION
  );

  const verifyTotpHandler = useCallback(async () => {
    const code = await getCode(totp.secret);
    const result = await verifyTotp({
      variables: { input: { code, service: serviceName } },
    });
    return result.data!.verifyTotp.success;
  }, [serviceName, totp, verifyTotp]);

  const successfulSetupHandler = useCallback(() => {
    // TODO: this is temporary until the oauth redirect with state and
    // authorization code is implemented.  This feature is not complete
    // until then.
    // const { redirect, code, state } = finishOAuthFlowHandler(
    //   account.uid,
    //   session
    // );
    const url = integration.getRedirectWithOAuthResult();
    window.location.assign(url);
  }, [integration]);

  const cancelSetupHandler = useCallback(() => {
    const error = AuthUiErrors.TOTP_REQUIRED;

    if (integration.returnOnError()) {
      const url = integration.getRedirectWithErrorUrl(error);
      window.location.assign(url);
      return;
    }

    throw error;
  }, [integration]);

  useEffect(() => {
    // Some basic sanity checks
    if (!isSignedIn || !account || !session || !totp) {
      navigate(`/signup${location.search}`);
      return;
    }

    if (account.totpActive) {
      navigate(`/signin_totp_code${location.search}`);
      return;
    }

    setRecoveryCodes(totp.recoveryCodes);
  }, [isSignedIn, account, session, totp, navigate, location.search]);

  if (!recoveryCodes) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <InlineRecoverySetup
      recoveryCodes={recoveryCodes}
      serviceName={serviceName}
      cancelSetupHandler={cancelSetupHandler}
      verifyTotpHandler={verifyTotpHandler}
      successfulSetupHandler={successfulSetupHandler}
    />
  );
};

export default InlineRecoverySetupContainer;
