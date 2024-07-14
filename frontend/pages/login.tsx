import { useState } from 'react';
import { useRouter } from 'next/router';
import magic from '../magic_link-config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await magic.auth.loginWithMagicLink({ email });
      localStorage.setItem('userLoggedIn', "true");
      setMessage(`Login feito com sucesso!`);
      router.push('/');
    } catch (error) {
      setMessage('Tente novamente mais tarde...');
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Insira o email"
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
