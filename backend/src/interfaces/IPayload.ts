export interface IAccessPayload {
  _id: string;
  role: 'user' | 'admin' | 'super admin';
}

export interface IRefreshPayload {
  _id: string;
}
