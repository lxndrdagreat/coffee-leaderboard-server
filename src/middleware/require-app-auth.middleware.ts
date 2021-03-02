import { getUserByAppToken } from '../services/user-profile.service';
import { FastifyRequest } from 'fastify';

export async function requireAppAuthMiddleware(request: FastifyRequest) {
  if (!request.headers || !request.headers['x-app-token']) {
    throw new Error('Unauthorized');
  }

  const token = request.headers['x-app-token'] as string;
  try {
    await getUserByAppToken(token);
  } catch (e) {
    throw new Error('Unauthorized');
  }
}
