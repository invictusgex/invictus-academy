"use client";

import { createContext, useContext } from "react";

export type AdminContextValue = {
  isAdmin: boolean;
  loading: boolean;
  refreshAdminStatus: () => Promise<void>;
};

export const AdminContext = createContext<AdminContextValue | undefined>(
  undefined,
);

export function useAdminContext() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider.");
  }

  return context;
}
