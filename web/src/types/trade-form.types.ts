export type StrategyGroup = {
  readonly name: string;
  readonly strategyType: 'CALENDAR_SPREAD' | 'RATIO_CALENDAR_SPREAD' | 'CUSTOM';
  readonly notes: string;
};
