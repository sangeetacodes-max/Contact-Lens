import { Env } from '../types';
import { verifyFirebaseAuth } from '../middleware/auth';
import { jsonResponse } from '../utils/errors';

export async function handleAuthRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  if (pathname === '/api/auth/verify' && request.method === 'POST') {
    const user = await verifyFirebaseAuth(request, env);
    return jsonResponse({
      authenticated: true,
      user
    });
  }

  return new Response('Not Found', { status: 404 });
}
