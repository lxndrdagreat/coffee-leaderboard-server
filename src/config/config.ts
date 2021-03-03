import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const packageJSON = JSON.parse(fs.readFileSync('./package.json').toString());

function getEnvironmentValue(name: string): string {
  if (process.env[name]) {
    return process.env[name] as string;
  }

  throw new Error(
    `Environment variable: ${name} is not set. If using .env please check your .env file`
  );
}

export const serverPort: number = parseInt(getEnvironmentValue('SERVER_PORT'));
export const isProduction: boolean = !!(
  process.env.hasOwnProperty('NODE_ENV') &&
  process.env.NODE_ENV &&
  process.env.NODE_ENV.toLowerCase() === 'production'
);

export const logLevel: string = getEnvironmentValue('LOG_LEVEL');

export const appName: string = packageJSON.name;
export const appVersion: string = packageJSON.version;

export const slackToken: string = getEnvironmentValue('SLACK_TOKEN');
export const slackClientId: string = getEnvironmentValue('SLACK_CLIENT_ID');
export const slackClientSecret: string = getEnvironmentValue(
  'SLACK_CLIENT_SECRET'
);
export const slackSigningSecret: string = getEnvironmentValue(
  'SLACK_SIGNING_SECRET'
);
export const slackBotOAuthToken: string = getEnvironmentValue(
  'SLACK_BOT_OAUTH_TOKEN'
);
export const slackChannelIds: string[] = process.env.hasOwnProperty(
  'SLACK_COFFEE_CHANNEL_IDS'
)
  ? (process.env['SLACK_COFFEE_CHANNEL_IDS'] as string).split(',')
  : [];

export const databaseURL: string = getEnvironmentValue('DATABASE_URL');
export const databaseName: string = getEnvironmentValue('DATABASE_NAME');
export const databaseUser: string = getEnvironmentValue('DATABASE_ROOT_USER');
export const databasePassword: string = getEnvironmentValue(
  'DATABASE_ROOT_PASSWORD'
);

export const appPepper: string = getEnvironmentValue('APP_TOKEN_PEPPER');
