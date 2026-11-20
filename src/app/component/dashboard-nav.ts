import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck2,
  ChartNoAxesCombined,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
  UserCircle2,
  Users,
} from "lucide-react";

export type UserRole = "customer" | "admin" | "owner";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const customerNav: DashboardNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/customer",
    icon: LayoutDashboard,
  },
  {
    title: "My Bookings",
    href: "/dashboard/customer/bookings",
    icon: CalendarCheck2,
  },
  {
    title: "My Favorites",
    href: "/dashboard/customer/favorites",
    icon: Heart,
  },
  {
    title: "Profile Settings",
    href: "/dashboard/customer/profile",
    icon: Settings,
  },
];

const adminNav: DashboardNavItem[] = [
  { title: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { title: "All Users", href: "/dashboard/admin/users", icon: Users },
  { title: "All Equipment", href: "/dashboard/admin/equipment", icon: Package },
  {
    title: "All Rentals",
    href: "/dashboard/admin/rentals",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: ChartNoAxesCombined,
  },
  { title: "Profile", href: "/dashboard/admin/profile", icon: UserCircle2 },
];

const ownerNav: DashboardNavItem[] = [
  { title: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
  {
    title: "Add Equipment",
    href: "/dashboard/owner/add-equipment",
    icon: PlusCircle,
  },
  { title: "My Equipment", href: "/dashboard/owner/equipment", icon: Package },
  {
    title: "My Rentals",
    href: "/dashboard/owner/rentals",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    href: "/dashboard/owner/analytics",
    icon: ChartNoAxesCombined,
  },
  { title: "Profile", href: "/dashboard/owner/profile", icon: UserCircle2 },
];

export const dashboardNavByRole: Record<UserRole, DashboardNavItem[]> = {
  customer: customerNav,
  admin: adminNav,
  owner: ownerNav,
};

export const roleLabels: Record<UserRole, string> = {
  customer: "Customer",
  admin: "Admin",
  owner: "Owner",
};

export const dashboardHomeByRole: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  admin: "/dashboard/admin",
  owner: "/dashboard/owner",
};
