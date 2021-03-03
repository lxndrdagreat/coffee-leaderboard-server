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

export interface SlackEventBase extends SlackEventBody {
  type: 'event_callback';
  team_id: string;
  api_app_id: string;
  authed_teams: string[];
  event_id: string;
  event_time: number;
  event: {
    type: string;
    channel: string;
    user: string;
    text: string;
    ts: string;
    event_ts: string;
    channel_type: string; /// channel and dm?
  };
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
