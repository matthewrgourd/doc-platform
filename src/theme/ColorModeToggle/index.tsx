/**
 * Mintlify-style ColorModeToggle: single button with sun (left) and moon (right)
 */

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useColorMode} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import IconLightMode from '@theme/Icon/LightMode';
import IconDarkMode from '@theme/Icon/DarkMode';
import type {Props} from '@theme/ColorModeToggle';
import type {ColorMode} from '@docusaurus/theme-common';

import styles from './styles.module.css';

/**
 * Mintlify behavior: toggle only between light and dark.
 * System is the default on first load, but the UI offers no way to return to it.
 */
function getNextColorMode(
  colorMode: ColorMode | null,
  _respectPrefersColorScheme: boolean,
): ColorMode {
  if (colorMode === 'dark') {
    return 'light';
  }
  return 'dark';
}

function getColorModeLabel(colorMode: ColorMode | null): string {
  switch (colorMode) {
    case null:
      return translate({
        message: 'system mode',
        id: 'theme.colorToggle.ariaLabel.mode.system',
        description: 'The name for the system color mode',
      });
    case 'light':
      return translate({
        message: 'light mode',
        id: 'theme.colorToggle.ariaLabel.mode.light',
        description: 'The name for the light color mode',
      });
    case 'dark':
      return translate({
        message: 'dark mode',
        id: 'theme.colorToggle.ariaLabel.mode.dark',
        description: 'The name for the dark color mode',
      });
    default:
      throw new Error(`unexpected color mode ${colorMode}`);
  }
}

function getColorModeAriaLabel(colorMode: ColorMode | null) {
  return translate(
    {
      message: 'Switch between dark and light mode (currently {mode})',
      id: 'theme.colorToggle.ariaLabel',
      description: 'The ARIA label for the color mode toggle',
    },
    {mode: getColorModeLabel(colorMode)},
  );
}

function ColorModeToggle({
  className,
  buttonClassName,
  respectPrefersColorScheme,
  value,
  onChange,
}: Props): ReactNode {
  const isBrowser = useIsBrowser();
  const {colorMode} = useColorMode();

  const effectiveMode = value ?? colorMode;

  return (
    <div className={clsx(styles.toggle, className)}>
      <button
        className={clsx(
          'clean-btn',
          styles.toggleButton,
          !isBrowser && styles.toggleButtonDisabled,
          buttonClassName,
        )}
        type="button"
        onClick={() =>
          onChange(
            getNextColorMode(effectiveMode, respectPrefersColorScheme),
          )
        }
        disabled={!isBrowser}
        title={getColorModeLabel(value)}
        aria-label={getColorModeAriaLabel(value)}
      >
        <span
          className={clsx(
            styles.iconWrapper,
            styles.sunWrapper,
            effectiveMode === 'light' && styles.iconActive,
          )}
          aria-hidden
        >
          <IconLightMode className={styles.toggleIcon} />
        </span>
        <span
          className={clsx(
            styles.iconWrapper,
            styles.moonWrapper,
            effectiveMode === 'dark' && styles.iconActive,
          )}
          aria-hidden
        >
          <IconDarkMode className={styles.toggleIcon} />
        </span>
      </button>
    </div>
  );
}

export default React.memo(ColorModeToggle);
