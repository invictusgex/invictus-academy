export type AdminUserRow = {
  user_id: string;
  created_at: string;
  created_by: string | null;
};

export type AdminStatus = {
  isAdmin: boolean;
};
