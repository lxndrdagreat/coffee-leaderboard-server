export type UserAppServiceName = 'slack';

export interface UserAppTokenSchema {
  user: string;
  service: UserAppServiceName;
  // "SSO" token from Slack or whereever
  serviceToken: string;
  app: string;
  appToken: string | null;
}
