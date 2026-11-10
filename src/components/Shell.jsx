import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserRound, Sparkles, Briefcase, Compass, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Board', short: 'Board', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', short: 'Discover', icon: Compass },
  { to: '/projects', label: 'Projects', short: 'Projects', icon: FolderOpen },
  { to: '/coach', label: 'Career Coach', short: 'Coach', icon: Sparkles },
  { to: '/profile', label: 'Profile', short: 'Profile', icon: UserRound },
];

export default function Shell() {
  const { pathname } = useLocation();
  const activeJob = pathname.startsWith('/jobs/');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-4 py-3 sm:px-6 lg:px-10">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" />
            </span>
            <span className="hidden font-heading text-[15px] font-medium tracking-tight sm:block">
              Career Command Center
            </span>
          </NavLink>

          <nav className="ml-auto flex items-center gap-1 overflow-x-auto no-scrollbar">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === '/' ? pathname === '/' || activeJob : pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={cn(
                    'group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline sm:inline">{label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:px-10">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-background/95 backdrop-blur-xl sm:hidden">
        {NAV.map(({ to, short, icon: Icon }) => {
          const active = to === '/' ? pathname === '/' || activeJob : pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5 py-2.5 text-[9px] leading-tight transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active && 'text-accent-foreground')} />
              <span className="w-full truncate text-center">{short}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}