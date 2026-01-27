import { useEffect } from 'react';
import api, { privateApi } from '../api/axiosInstance';
import useAuth from './UseAuth';

const useAxiosPrivate = () => {
  const { auth, setAuth } = useAuth();

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

    const responseIntercepter = privateApi.interceptors.response.use(
      (res) => res,
      async (err) => {
        const prevRequest = err.config;
        if (err?.response?.status === 401 && !prevRequest.sent) {
          prevRequest.sent = true;
          try {
            const refreshRes = await api.get('/users/refresh');
            const newAccessToken = refreshRes.data.accessToken;
            setAuth({ accessToken: newAccessToken });
            prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return privateApi(prevRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(err);
      },
    );
    return () => {
      privateApi.interceptors.request.eject(requestIntercepter);
      privateApi.interceptors.response.eject(responseIntercepter);
    };
  }, [auth, setAuth]);
  return privateApi;
};

export default useAxiosPrivate;
