import { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Handle Chrome DevTools and other .well-known requests
  if (url.pathname.startsWith('/.well-known/')) {
    return new Response('Not Found', { status: 404 });
  }
  
  // For other unmatched routes, throw to trigger the regular 404 page
  throw new Response('Not Found', { status: 404 });
}