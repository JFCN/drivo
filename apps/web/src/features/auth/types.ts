export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};
