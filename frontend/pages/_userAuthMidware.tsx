// _userAuthMidware.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import magic from '../magic_link-config';

const UserAuthMiddleware = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
        try {
          const isLoggedIn = await magic.user.isLoggedIn();
          if (isLoggedIn) {
            setLoading(false);
          } else {
            router.push('/login');
          }
        } catch (error) {
          router.push('/login');
        }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuthMiddleware;
