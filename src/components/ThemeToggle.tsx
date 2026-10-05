import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { useControlScale } from '../hooks/useControlScale';
import SquishSwitch from './ui/SquishSwitch';

export interface ThemeToggleProps {
  id?: string;
}

// The switch at its base size, before the display's own scaling. The switch's
// geometry is arithmetic rather than CSS, so these are the numbers
// --control-scale multiplies.
const BASE_WIDTH = 68;
const BASE_HEIGHT = 34;
const BASE_RADIUS = 17;

/**
 * The header's light/dark control. The switch is "on" while the site is in its
 * musical night theme. State lives in the store, which is what persists it, so
 * nothing here reads or writes localStorage directly -- a second source of truth
 * would only fight the persisted store on reload.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ id }) => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const scale = useControlScale();
  const isDark = theme === 'dark';

  return (
    <SquishSwitch
      id={id}
      checked={isDark}
      onChange={toggleTheme}
      ariaLabel={isDark ? 'Switch to Airy Daylight' : 'Switch to Musical Night'}
      width={Math.round(BASE_WIDTH * scale)}
      height={Math.round(BASE_HEIGHT * scale)}
      radius={Math.round(BASE_RADIUS * scale)}
      trackColor="#e4e4e7"
      trackOnColor="#27272a"
      thumbColor="#ffffff"
      thumbOnColor="#09090b"
    />
  );
};

export default ThemeToggle;
