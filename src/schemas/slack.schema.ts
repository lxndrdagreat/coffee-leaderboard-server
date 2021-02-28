export interface SlackMessageBody {
  token: string;
}

export interface SlackEventBody extends SlackMessageBody {
  type: string;
}

export interface SlackEventUrlVerificationBody extends SlackEventBody {
  type: 'url_verification';
  challenge: string;
}

export interface SlackLogBody extends SlackMessageBody {
  user_name: string;
  text: string;
  channel_name: string;
  channel_id: string;
}

export interface SlackCreateAppAuthRequestBody extends SlackMessageBody {
  user_name: string;
}
