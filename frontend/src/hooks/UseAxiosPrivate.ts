import { useEffect } from 'react';
import { privateApi } from '../api/axiosInstance';
import useAuth from './UseAuth';

const useAxiosPrivate = () => {
  const { auth } = useAuth();

  useEffect(() => {
    const requestIntercepter = privateApi.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      (err) => Promise.reject(err),
    );
    return () => {
      privateApi.interceptors.request.eject(requestIntercepter);
    };
  }, [auth]);
  return privateApi;
};

export default useAxiosPrivate;
