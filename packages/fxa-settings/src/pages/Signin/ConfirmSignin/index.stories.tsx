/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmSignin, { ConfirmSigninProps } from '.';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Signin/ConfirmSignin',
  component: ConfirmSignin,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: ConfirmSigninProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <ConfirmSignin {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({
  email: MOCK_ACCOUNT.primaryEmail.email,
});
