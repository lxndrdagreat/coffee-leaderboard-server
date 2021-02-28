export type UserAppServiceName = 'slack';

export interface UserAppTokenSchema {
  service: UserAppServiceName;
  // "SSO" token from Slack or whereever
  serviceToken: string;
  app: string | null;
  appToken: string | null;
  createdOn: Date;
}

export interface AppAuthRequestModel {
  token: string;
  app: string;
  serviceName: string;
}
