import { slackSigningSecret } from '../config/config';
// import { SlackEventBody, SlackMessageBody } from '../schemas/slack.schema';
import { createHmacDigestBase64 } from './generate-token';
import { FastifyRequest } from 'fastify';

export function hashSlackMessage(
  requestBody: string,
  timestampHeader: string
): string {
  return createHmacDigestBase64(
    slackSigningSecret,
    `v0:${timestampHeader}:${requestBody}`
  );
}

export function requireSlackAuth(request: FastifyRequest) {
  if (
    !request.headers ||
    !request.headers.hasOwnProperty('x-slack-signature') ||
    !request.headers.hasOwnProperty('x-slack-request-timestamp')
  ) {
    throw new Error('Unauthorized');
  }
  const wholeSignature = request.headers['x-slack-signature'] as string;
  const [_version, hash] = wholeSignature.split('=');
  const timestamp = request.headers['x-slack-request-timestamp'] as string;
  const signed = hashSlackMessage((request.rawBody as string) || '', timestamp);

  // TODO: enable signature check
  if (hash !== signed) {
    throw new Error('Unauthorized');
  }
}

// export const validateSlackWebhook = dataMiddleware(
//   (context: RouteContext): MiddlewareResult => {
//     const payload = context.body as SlackEventBody;
//
//     if (!payload.type) {
//       return MiddlewareResult.unauthorized();
//     }
//
//     return MiddlewareResult.continue();
//   }
// );
//
// export const validateSlackToken = dataMiddleware(
//   (context: RouteContext): MiddlewareResult => {
//     if (!context.body) {
//       return MiddlewareResult.unauthorized();
//     }
//
//     const payload = context.body as SlackMessageBody;
//     if (!payload.token || payload.token !== slackToken) {
//       return MiddlewareResult.unauthorized();
//     }
//
//     return MiddlewareResult.continue();
//   }
// );
