import api from '../api/axiosInstance';
import useAuth from '../hooks/UseAuth';
import { useNavigate } from 'react-router-dom';

const SignoutButton = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const signout = async () => {
    try {
      await api.delete('/users/logout');
    } catch {
      console.error('signout unseccesful');
    } finally {
      <h1>Successful signout</h1>;
      setAuth({});
      navigate('/login');
    }
  };
  return (
    <>
      <button
        className="
        px-3 py-2 rounded-md text-sm font-medium transition
        text-[rgb(var(--text-muted))]
        hover:text-[rgb(var(--primary))]
        hover:bg-[rgb(var(--bg-muted))] border-0
      "
        onClick={(e) => {
          e.preventDefault();
          signout();
        }}
      >
        Signout
      </button>
    </>
  );
};

export default SignoutButton;
