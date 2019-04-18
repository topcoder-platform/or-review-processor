/*
 * Test data to be used in tests
 */

const avScanTopic = 'avscan.action.scan'

const reviewActionTopic = 'or.action.review'

const testTopics = {
  'create': {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.score', 'payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId', 'payload.eventType'],
    integerFields: ['payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId'],
    stringFields: ['payload.eventType'],
    testMessage: {
      topic: 'submission.notification.score',
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
      topic: 'submission.notification.score',
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
  },
  'submission.notification.create': {
    operation: 'create',
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.resource', 'payload.id', 'payload.type', 'payload.url',
      'payload.memberId', 'payload.challengeId', 'payload.submissionPhaseId', 'payload.fileType',
      'payload.isFileSubmission'],
    integerFields: ['payload.memberId', 'payload.challengeId', 'payload.submissionPhaseId'],
    stringFields: ['originator', 'mime-type', 'payload.resource', 'payload.id', 'payload.type',
      'payload.url', 'payload.createdBy', 'payload.updatedBy', 'payload.fileType'],
    dateFields: ['timestamp', 'payload.created', 'payload.updated'],
    booleanFields: ['payload.isFileSubmission'],
    testMessage: {
      topic: 'submission.notification.create',
      originator: 'or-app',
      timestamp: '2019-02-25T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'submission',
        id: '104366f8-f46b-45db-a971-11bc69e6c8ff',
        type: 'Contest Submission',
        url: 'https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip?query=test',
        memberId: 12345,
        challengeId: 30049360,
        created: '2019-04-02T06:59:29.785Z',
        updated: '2019-04-03T06:59:29.785Z',
        createdBy: 'user1',
        updatedBy: 'user2',
        submissionPhaseId: 123123,
        fileType: 'zip',
        isFileSubmission: false
      }
    }
  },
  'submission.notification.update': {
    operation: 'update',
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.resource', 'payload.id', 'payload.type', 'payload.url',
      'payload.memberId', 'payload.challengeId', 'payload.submissionPhaseId', 'payload.fileType',
      'payload.isFileSubmission'],
    integerFields: ['payload.memberId', 'payload.challengeId', 'payload.submissionPhaseId'],
    stringFields: ['originator', 'mime-type', 'payload.resource', 'payload.id', 'payload.type',
      'payload.url', 'payload.createdBy', 'payload.updatedBy', 'payload.fileType'],
    dateFields: ['timestamp', 'payload.created', 'payload.updated'],
    booleanFields: ['payload.isFileSubmission'],
    testMessage: {
      topic: 'submission.notification.update',
      originator: 'or-app',
      timestamp: '2019-02-25T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'submission',
        id: '104366f8-f46b-45db-a971-11bc69e6c8ff',
        type: 'Contest Submission',
        url: 'https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip#testing',
        memberId: 121212,
        challengeId: 30049360,
        created: '2019-04-02T06:59:29.785Z',
        updated: '2019-04-03T06:59:29.785Z',
        createdBy: 'user3',
        updatedBy: 'user4',
        submissionPhaseId: 345345,
        fileType: 'zip',
        isFileSubmission: true
      }
    }
  }
}

module.exports = {
  avScanTopic,
  reviewActionTopic,
  testTopics
}
