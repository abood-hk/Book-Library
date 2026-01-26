import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

type AuthProviderProps = {
  children: ReactNode;
};

type User = {
  id?: string;
  username?: string;
  role?: 'user' | 'admin' | 'super admin';
};

type Auth = {
  user?: User;
  accessToken?: string;
};

type AuthContextType = {
  auth: Auth;
  setAuth: React.Dispatch<React.SetStateAction<Auth>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<Auth>({});

  return (
    <>
      <AuthContext.Provider value={{ auth, setAuth }}>
        {children}
      </AuthContext.Provider>
    </>
  );
};

export default AuthContext;
