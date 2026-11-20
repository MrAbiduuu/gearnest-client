"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  dashboardHomeByRole,
  type UserRole,
} from "../component/dashboard-nav";

const UserDashBoard = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const role: UserRole =
    session?.user.role === "admin" || session?.user.role === "owner"
      ? session.user.role
      : "customer";

  useEffect(() => {
    if (!isPending) {
      router.replace(dashboardHomeByRole[role]);
    }
  }, [isPending, role, router]);

  return (
    <div className="flex min-h-60 items-center justify-center text-sm text-muted-foreground">
      Redirecting to your dashboard…
    </div>
  );
};

export default UserDashBoard;
