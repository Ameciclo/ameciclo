import { Magic } from 'magic-sdk';

let magic = typeof window !== 'undefined' ? new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY) : null;

export default magic;   