import React from 'react';
import { useAppStore } from '../store/useAppStore';
import SquishSwitch from './ui/SquishSwitch';

export interface ThemeToggleProps {
  id?: string;
}

/**
 * The header's light/dark control. The switch is "on" while the site is in its
 * musical night theme. State lives in the store, which is what persists it, so
 * nothing here reads or writes localStorage directly -- a second source of truth
 * would only fight the persisted store on reload.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ id }) => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <SquishSwitch
      id={id}
      checked={isDark}
      onChange={toggleTheme}
      ariaLabel={isDark ? 'Switch to Airy Daylight' : 'Switch to Musical Night'}
      width={68}
      height={34}
      radius={17}
      trackColor="#e4e4e7"
      trackOnColor="#27272a"
      thumbColor="#ffffff"
      thumbOnColor="#09090b"
    />
  );
};

export default ThemeToggle;
