export interface IAccessPayload {
  _id: string;
  role: 'user' | 'admin';
}

export interface IRefreshPayload {
  userId: string;
}
