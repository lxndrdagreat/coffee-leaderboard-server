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
