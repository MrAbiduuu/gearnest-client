"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import ThemeToggle from "@/components/shared/themeToggle";
import { signOut, useSession } from "@/lib/auth-client";
import { dashboardNavByRole, roleLabels, type UserRole } from "./dashboard-nav";

const getInitials = (name?: string | null) => {
  const source = (name || "User").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1
      ? parts
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
      : source.slice(0, 2);

  return initials.toUpperCase() || "U";
};

export function DashboardSidebar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const user = session?.user;
  const role: UserRole =
    user?.role === "admin" || user?.role === "owner" ? user.role : "customer";
  const navItems = dashboardNavByRole[role];

  const closeMobileMenu = () => setOpenMobile(false);

  const handleLogout = async () => {
    closeMobileMenu();

    try {
      const result = await signOut();

      if (result.error) {
        toast.add({
          type: "error",
          title: "Could not log out",
          description: result.error.message ?? "Please try again.",
          timeout: 5000,
        });
        return;
      }

      router.push("/signin");
      router.refresh();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not log out",
        description:
          error instanceof Error ? error.message : "Please try again.",
        timeout: 5000,
      });
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="top-16! h-[calc(100svh-4rem)]! border-r border-sidebar-border bg-white opacity-100! sm:top-20! sm:h-[calc(100svh-5rem)]! dark:bg-[#101d16]"
    >
      <SidebarHeader className="gap-0 border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center"
            aria-label="GearNest home"
          >
            <Image
              src="/favicon.ico"
              alt="GearNest"
              width={155}
              height={50}
              priority
              className="h-auto w-30 object-contain group-data-[collapsible=icon]:hidden"
            />
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <Avatar size="lg">
            {user?.image ? (
              <AvatarImage
                src={user.image}
                alt={`${user.name || "User"}'s profile`}
                referrerPolicy="no-referrer"
              />
            ) : null}
            <AvatarFallback className="bg-green-100 font-semibold text-green-800 dark:bg-green-900/40 dark:text-lime-200">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {isPending ? (
                <span className="block h-4 w-24 animate-pulse rounded bg-muted" />
              ) : (
                user?.name || "GearNest user"
              )}
            </p>

            <Badge
              variant="secondary"
              className="mt-1 border-green-700/20 bg-green-100 text-green-800 dark:border-lime-400/20 dark:bg-green-900/40 dark:text-lime-200"
            >
              {roleLabels[role]}
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{roleLabels[role]} workspace</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={
                        <Link href={item.href} onClick={closeMobileMenu} />
                      }
                      isActive={isActive}
                      tooltip={item.title}
                      size="lg"
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" onClick={closeMobileMenu} />}
              tooltip="Back to website"
            >
              <House />
              <span>Back to website</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-700 dark:hover:text-red-300"
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
