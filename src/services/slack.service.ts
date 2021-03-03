import { slackBotOAuthToken, slackSigningSecret } from '../config/config';
import { createHmacDigestBase64 } from './generate-token';
import { FastifyRequest } from 'fastify';
import { SlackUserInfoModel } from '../schemas/slack-user-info.model';
import axios from 'axios';

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

export async function getUserInfoFromSlackAPI(
  userId: string
): Promise<SlackUserInfoModel> {
  const params = new URLSearchParams();
  params.append('token', slackBotOAuthToken);
  params.append('user', userId);
  const response = await axios.post('https://slack.com/api/users.info', params);
  if (!response.data.ok) {
    throw new Error('Slack user does not exist.');
  }
  return response.data.user as SlackUserInfoModel;
}
