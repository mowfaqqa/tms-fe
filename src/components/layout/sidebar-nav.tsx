'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { NAV_ITEMS } from './nav';
import { cn } from '@/lib/utils';

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Building2 className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Tenancy Manager</p>
          <p className="text-xs text-muted-foreground">A.T Properties</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 text-xs text-muted-foreground">
        Tenancy Reminder &amp; Notice System
      </div>
    </div>
  );
}
