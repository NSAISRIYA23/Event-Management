export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

