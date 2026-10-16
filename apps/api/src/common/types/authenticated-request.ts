import { Request } from 'express';

export type AuthenticatedUser = {
  id: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
