import { AdminRepository } from "@/lib/repositories/admin.repository";
import type { AdminStatus } from "@/lib/types/admin.types";

export const AdminService = {
  async isCurrentUserAdmin(): Promise<AdminStatus> {
    const adminUser = await AdminRepository.findCurrentAdminUser();

    return {
      isAdmin: Boolean(adminUser),
    };
  },
};
