import {
  Bell,
  FileText,
  LayoutDashboard,
  ScrollText,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tenants', href: '/tenants', icon: Users },
  { label: 'Notices', href: '/notices', icon: FileText },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Reports', href: '/reports', icon: ScrollText },
];
