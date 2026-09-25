export interface SafeUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
}
