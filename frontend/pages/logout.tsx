import { useEffect } from 'react';
import { useRouter } from 'next/router';
import magic from '../magic_link-config';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

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
    <Layout>
      <SEO title='Loggout...'/>
    </Layout>
  )
};

export default UserLogout;
