import { useState } from 'react';
import { useRouter } from 'next/router';
import magic from '../magic_link-config';
import Link from 'next/link';
import Image from 'next/image';

const Login = () => {
  const [email, setEmail] = useState('');
  const [goodMessage, setGoodMessage] = useState('');
  const [badMessage, setBadMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await magic.auth.loginWithMagicLink({ email });
      localStorage.setItem('userLoggedIn', "true");
      setGoodMessage(`Login feito com sucesso!`);
      router.push('/');
    } catch (error) {
      setBadMessage('Tente novamente mais tarde...');
    }
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen font-ubuntu bg-teal-800'>
      <form className='flex flex-col justify-center items-center bg-white shadow-md rounded-lg px-12 pt-8 pb-8 mb-4 -mt-20 gap-2' onSubmit={handleLogin}>
        <Link href='/'>
          <a>
            <Image src="/favicon-96x96.png" alt="icone da ameciclo" className='rounded-full' />
          </a>
        </Link>
        <h1 className='font-mono text-green-800 font-extrabold text-xl'>Olá Ameciclista!</h1>
        <input
          className='border-4 rounded-sm p-1 pb-0 mt-2 mb-0'
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Insira seu email"
          required
        /><br />
        {goodMessage && <p className='text-lg text-left font-mono  text-green-700 self-start mb-8 mt-0'>{goodMessage}</p>}
        {badMessage && <p className='text-lg text-left font-mono text-red-600 self-start mb-8 mt-0'>{badMessage}</p>}
        <button
          type="submit"
          className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg w-full'>
          Login
        </button>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSeBboZ6fDhGEuJjVSyt7r3tTe5FF8VJH1gKt95jq6JslrwOdQ/viewform"
          className='text-sm text-blue-700'
        >
          Ainda não é associado?
        </a>
      </form>
    </div>
  );
};

export default Login;
