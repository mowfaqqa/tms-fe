import {
  Bell,
  Building2,
  FileText,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only shown to ADMIN (Super Admin) users. */
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Properties', href: '/properties', icon: Building2 },
  { label: 'Tenants', href: '/tenants', icon: Users },
  { label: 'Notices', href: '/notices', icon: FileText },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Reports', href: '/reports', icon: ScrollText },
  {
    label: 'Staff Management',
    href: '/staff',
    icon: ShieldCheck,
    adminOnly: true,
  },
];
