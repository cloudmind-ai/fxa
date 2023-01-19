import React, { useState } from 'react';

import { Form } from '../components/fields';

import AppLocalizationProvider from '../AppLocalizationProvider';
import ChoosePayment from '../components/ChoosePayment';
import CreateAccount from '../components/CreateAccount';
import PlanDetails from '../components/PlanDetails';
import SubscriptionTitle from '../components/SubscriptionTitle';

import { Coupon, PaymentMethodHeaderType } from '../lib/types';
import {
  State as ValidatorState,
  useValidatorState,
  MiddlewareReducer as ValidatorMiddlewareReducer,
} from '../lib/validator';

import CouponForm from '../components/CouponForm';
import Layout from '../layouts';

import { useStaticQuery, graphql } from 'gatsby';

export type CheckoutProps = {
  validatorInitialState?: ValidatorState;
  validatorMiddlewareReducer?: ValidatorMiddlewareReducer;
};

const Checkout = ({
  validatorInitialState,
  validatorMiddlewareReducer,
}: CheckoutProps) => {
  const validator = useValidatorState({
    initialState: validatorInitialState,
    middleware: validatorMiddlewareReducer,
  });

  const [checkboxSet, setCheckboxSet] = useState(false);
  const [coupon, setCoupon] = useState<Coupon>();

  const data = useStaticQuery(graphql`
    query {
      subplat {
        plan(id: "123", locale: "en-us") {
          id
          productName
          planName
          active
          styles {
            webIconBackground
          }
          description
          subtitle
          upgradeCTA
          successActionButtonUrl
          successActionButtonLabel
          webIconUrl
          tosUrl
          tosDownloadUrl
          privacyNoticeUrl
          privacyNoticeDownloadUrl
          cancellationSurveyUrl
        }

        invoicePreview(planId: "123") {
          total
          totalExcludingTax
          subtotal
          subtotalExcludingTax
          currency
          tax {
            amount
            inclusive
            displayName
          }
          discount {
            amount
            amountOff
          }
        }
      }
    }
  `);
  // const data = {subplat: {plan: null}, site: { siteMetadata: {invoicePreview: null}}}
  const plan = {
    ...data.subplat.plan,
    currency: 'usd',
    details: [
      'Device-level encryption',
      'Servers is 30+ countries',
      'Connects 5 devices with one subscription',
      'Available for Windows, iOS and Android',
    ],
  };
  const invoicePreview = data.subplat.invoicePreview;

  return (
    <AppLocalizationProvider
      userLocales={['en-US']}
      bundles={['gatsby', 'react']}
    >
      <Layout profile={mockProfile}>
        <main className="main-content">
          <SubscriptionTitle
            screenType="create"
            // subtitle={plan.subtitle}
          />

          <div className="payment-panel">
            <PlanDetails
              selectedPlan={plan}
              // isMobile
              // showExpandButton
              invoicePreview={invoicePreview}
              coupon={coupon}
              // additionalCouponInfo={additionalCouponInfo}
            />

            <CouponForm
              readOnly={false}
              subscriptionInProgress={false}
              coupon={coupon}
              setCoupon={setCoupon}
              checkCoupon={checkCoupon}
            />
          </div>

          <Form
            className="component-card border-t-0 mb-6 py-4 px-4 rounded-t-lg text-grey-600 tablet:rounded-t-none desktop:px-12 desktop:pb-12"
            data-testid="subscription-create"
            validator={validator}
          >
            <CreateAccount />

            <hr className="mx-auto w-full" />

            <ChoosePayment
              paypalScriptLoaded
              selectedPlan={plan}
              type={PaymentMethodHeaderType.SecondStep}
              onClick={() => setCheckboxSet(!checkboxSet)}
            />
          </Form>
        </main>
      </Layout>
    </AppLocalizationProvider>
  );
};

export default Checkout;

const checkCoupon = (promo: string) => {
  return coupon;
};

const coupon: Coupon = {
  promotionCode: 'mockPromotionCode',
  type: 'mockType',
  durationInMonths: 12,
  discountAmount: 1000,
};

const mockProfile = {
  avatar: 'http://placekitten.com/256/256',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
  metricsEnabled: true,
};

const additionalCouponInfo = {
  couponDurationDate: 12,
  message: 'Your plan will automatically renew at the list price.',
};
