import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Rocket,
  Clock,
  CheckSquare,
  Bell,
  StickyNote,
  Workflow,
  Settings,
} from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();

  const navItems = [
    {
      path: '/',
      icon: LayoutDashboard,
      label: t('navigation.dashboard'),
    },
    {
      path: '/launcher',
      icon: Rocket,
      label: t('navigation.launcher'),
    },
    {
      path: '/clock-pomodoro',
      icon: Clock,
      label: t('navigation.clockPomodoro'),
    },
    {
      path: '/tasks',
      icon: CheckSquare,
      label: t('navigation.tasks'),
    },
    {
      path: '/reminders',
      icon: Bell,
      label: t('navigation.reminders'),
    },
    {
      path: '/notes',
      icon: StickyNote,
      label: t('navigation.notes'),
    },
    {
      path: '/automations',
      icon: Workflow,
      label: t('navigation.automations'),
    },
    {
      path: '/settings',
      icon: Settings,
      label: t('navigation.settings'),
    },
  ];

  return (
    <aside className="w-60 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo/App Name */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {t('app.name')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('app.tagline')}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

// Made with Bob
