import { PiSun, PiMoon, PiDesktopTower } from 'react-icons/pi';
import useTheme from '../lib/useTheme';

const ICONS = { system: PiDesktopTower, light: PiSun, dark: PiMoon };
const NEXT_LABEL = { system: 'light', light: 'dark', dark: 'system' };

export default function ThemeToggle({ className = '' }) {
  const { mode, cycle } = useTheme();
  const Icon = ICONS[mode];

  return (
    <button
      type='button'
      onClick={cycle}
      title={`Theme: ${mode}. Click for ${NEXT_LABEL[mode]}.`}
      aria-label={`Theme is set to ${mode}. Switch to ${NEXT_LABEL[mode]}.`}
      className={`btn btn-sm btn-ghost w-9 px-0 ${className}`}
    >
      <Icon aria-hidden='true' className='h-[18px] w-[18px]' />
    </button>
  );
}
