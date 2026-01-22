// lib/analytics/beta-metrics.ts
export const BETA_METRICS = {
  ACQUISITION: {
    totalSignups: 'Track total beta users',
    signupsBySource: 'Organic, referral, paid, etc.',
    inviteRedemptionRate: 'How many codes are used',
    timeToFirstAction: 'How quickly users engage'
  },
  ENGAGEMENT: {
    dailyActiveUsers: 'Users logging in daily',
    weeklyActiveUsers: 'Users active weekly',
    averageSessionDuration: 'Time spent in app',
    featuresUsed: 'Which features are popular'
  },
  RETENTION: {
    day1Retention: 'Users returning next day',
    day7Retention: 'Users returning after a week',
    day30Retention: 'Users still active after month',
    churnReasons: 'Why users stop using'
  },
  SATISFACTION: {
    npsScore: 'Net Promoter Score',
    feedbackSubmissions: 'User feedback count',
    bugReports: 'Issues reported',
    featureRequests: 'Most requested features'
  }
}