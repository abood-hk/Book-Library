export interface IAuthResponse {
  accessToken: string;
  _id?: string;
  role?: 'user' | 'admin' | 'super admin';
  username?: string;
}
