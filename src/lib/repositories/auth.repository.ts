import {
  getCurrentUser as getCurrentAuthUser,
  getSession as getAuthSession,
  resetPassword as resetAuthPassword,
  signIn as signInWithAuthService,
  signOut as signOutWithAuthService,
} from "@/lib/auth/service";

type SignInInput = {
  email: string;
  password: string;
};

type ResetPasswordInput = {
  email: string;
};

// Este repositorio es la API estable que usaran hooks y componentes futuros.
// La UI no debe conocer Supabase ni el AuthService concreto: si el proveedor
// cambia, el contrato publico del repositorio puede mantenerse.
export const AuthRepository = {
  getCurrentUser: getCurrentAuthUser,
  getSession: getAuthSession,
  signIn(input: SignInInput) {
    return signInWithAuthService(input);
  },
  signOut: signOutWithAuthService,
  resetPassword(input: ResetPasswordInput) {
    return resetAuthPassword(input);
  },
};
