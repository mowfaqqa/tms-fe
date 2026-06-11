'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, LogOut, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import { useAuth } from '@/lib/auth/auth-context';
import { useUnreadCount } from '@/lib/hooks/use-notifications';
import { initials } from '@/lib/format';

export function Topbar() {
  const { user, logout } = useAuth();
  const { data: unread = 0 } = useUnreadCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Link href="/notifications">
            <Bell className="size-5" />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">
                {unread > 99 ? '99+' : unread}
              </span>
            ) : null}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user ? initials(user.fullName) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role.toLowerCase()}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} variant="destructive">
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
