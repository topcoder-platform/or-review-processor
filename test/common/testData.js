/*
 * Test data to be used in tests
 */

const testTopics = {
  'create': {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.score', 'payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId', 'payload.eventType'],
    integerFields: ['payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId'],
    stringFields: ['payload.eventType'],
    testMessage: {
      topic: 'or.notification.create',
      originator: 'or-app',
      timestamp: '2019-02-25T00:00:00',
      'mime-type': 'application/json',
      payload: {
        score: 90,
        submissionId: 206743,
        reviewId: 390087,
        scorecardId: 300001610,
        reviewerId: 151743,
        reviewTypeId: 2,
        eventType: 'CREATE'
      }
    }
  },
  'update': {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.score', 'payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId', 'payload.userId', 'payload.eventType'],
    integerFields: ['payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId'],
    stringFields: ['payload.userId', 'payload.eventType'],
    testMessage: {
      topic: 'or.notification.create',
      originator: 'or-app',
      timestamp: '2019-02-25T00:00:00',
      'mime-type': 'application/json',
      payload: {
        score: 95,
        submissionId: 206743,
        reviewId: 390087,
        scorecardId: 300001610,
        reviewerId: 151743,
        reviewTypeId: 2,
        userId: '8547899',
        eventType: 'UPDATE'
      }
    }
  }
}

module.exports = {
  testTopics
}
