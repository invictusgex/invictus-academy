"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AdminContext } from "@/contexts/AdminContext";
import { useAuth } from "@/hooks/useAuth";
import { AdminService } from "@/lib/services/admin.service";

type AdminProviderProps = {
  children: ReactNode;
};

export function AdminProvider({ children }: AdminProviderProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const status = await AdminService.isCurrentUserAdmin();

      setIsAdmin(status.isAdmin);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshAdminStatus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshAdminStatus]);

  const value = useMemo(
    () => ({
      isAdmin,
      loading,
      refreshAdminStatus,
    }),
    [isAdmin, loading, refreshAdminStatus],
  );

  return <AdminContext value={value}>{children}</AdminContext>;
}
