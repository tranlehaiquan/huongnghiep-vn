import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response('healthy\n', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
};
