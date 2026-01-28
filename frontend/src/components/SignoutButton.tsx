import api from '../api/axiosInstance';
import useAuth from '../hooks/UseAuth';

const SignoutButton = () => {
  const { setAuth } = useAuth();

  const signout = async () => {
    try {
      await api.delete('/users/logout');
    } catch {
      console.error('signout unseccesful');
    } finally {
      setAuth({});
    }
  };
  return (
    <>
      <button
        className="cursor-pointer"
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
