import { useEffect } from 'react';
import { useRouter } from 'next/router';
import magic from '../magic_link-config';
import Loading from '../components/Loading';

const UserLogout = () => {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await magic.user.logout();
        localStorage.removeItem('userLoggedIn');
        router.push('/');
      } catch (error) {
        console.error('Logout failed', error);
      }
    };

    logout();
  }, [router]);

  return (
    <Loading />
  )
};

export default UserLogout;
