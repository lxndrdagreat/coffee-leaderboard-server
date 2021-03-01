export interface LeaderboardModel {
  today: LeaderboadLineItemModel[];
  week: LeaderboadLineItemModel[];
  all: LeaderboadLineItemModel[];
}

export interface LeaderboadLineItemModel {
  count: number;
  userName: string;
}
