/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback, ChangeEvent } from 'react';
import InputText, { InputTextProps } from '../InputText';
import { ReactComponent as OpenEye } from './eye-open.svg';
import { ReactComponent as ClosedEye } from './eye-closed.svg';
import { useLocalization } from '@fluent/react';

type OptionalSyncedVisibilityProps =
  | {
      areBothPasswordsVisible?: boolean;
      setAreBothPasswordsVisible?: React.Dispatch<
        React.SetStateAction<boolean>
      >;
    }
  | { areBothPasswordsVisible?: never; setAreBothPasswordsVisible?: never };

export type InputPasswordProps = Omit<InputTextProps, 'type'> &
  OptionalSyncedVisibilityProps;

export const InputPassword = ({
  defaultValue,
  disabled,
  label,
  placeholder,
  className,
  onChange,
  onFocusCb,
  onBlurCb,
  inputRef,
  hasErrors,
  errorText,
  name,
  prefixDataTestId = '',
  tooltipPosition,
  anchorStart,
  areBothPasswordsVisible,
  setAreBothPasswordsVisible,
  autoFocus,
}: InputPasswordProps) => {
  const [hasContent, setHasContent] = useState<boolean>(defaultValue != null);
  const [visible, setVisible] = useState<boolean>(false);
  const { l10n } = useLocalization();

  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setHasContent(event.target.value.length > 0);
      onChange && onChange(event);
    },
    [onChange]
  );

  return (
    <InputText
      type={
        (areBothPasswordsVisible ? areBothPasswordsVisible : visible)
          ? 'text'
          : 'password'
      }
      {...{
        defaultValue,
        disabled,
        label,
        placeholder,
        onChange: onInputChange,
        onFocusCb,
        onBlurCb,
        className,
        inputRef,
        hasErrors,
        errorText,
        name,
        prefixDataTestId,
        tooltipPosition,
        anchorStart,
        autoFocus,
      }}
    >
      <button
        type="button"
        data-testid={formatDataTestId('visibility-toggle')}
        className={`px-3 py-2 text-grey-900 box-content ${
          !hasContent && 'hidden'
        }`}
        tabIndex={-1}
        onClick={() => {
          setVisible(!visible);
          if (setAreBothPasswordsVisible) {
            setAreBothPasswordsVisible(!visible);
          }
        }}
        title={
          (areBothPasswordsVisible ? areBothPasswordsVisible : visible)
            ? l10n.getString('input-password-hide', null, 'Hide password')
            : l10n.getString('input-password-show', null, 'Show password')
        }
        aria-label={
          (areBothPasswordsVisible ? areBothPasswordsVisible : visible)
            ? l10n.getString(
                'input-password-hide-aria',
                null,
                'Hide password from screen.'
              )
            : l10n.getString(
                'input-password-show-aria',
                null,
                'Show password as plain text. Your password will be visible on screen.'
              )
        }
      >
        {(areBothPasswordsVisible ? areBothPasswordsVisible : visible) ? (
          <ClosedEye
            width="24"
            height="24"
            className="stroke-current"
            aria-hidden="true"
          />
        ) : (
          <OpenEye
            width="24"
            height="18"
            className="stroke-current"
            aria-hidden="true"
          />
        )}
      </button>
    </InputText>
  );
};

export default InputPassword;
