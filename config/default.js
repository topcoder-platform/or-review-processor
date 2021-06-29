/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

  KAFKA_URL: process.env.KAFKA_URL || 'localhost:9092',
  // below two params are used for secure Kafka connection, they are optional
  // for the local Kafka, they are not needed
  KAFKA_CLIENT_CERT: process.env.KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY: process.env.KAFKA_CLIENT_CERT_KEY,

  // Kafka group id
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'scorecard-processor',

  // Kafka topic related to Creation and Update of review entity
  REVIEW_TOPIC: process.env.REVIEW_TOPIC || 'submission.notification.score',
  // Kafka topic related to create submission
  CREATE_SUBMISSION_TOPIC: process.env.CREATE_SUBMISSION_TOPIC || 'submission.notification.create',

  SUBMISSION_API_URL: process.env.SUBMISSION_API_URL || 'https://api.topcoder-dev.com/v5',

  CHALLENGE_API_URL: process.env.CHALLENGE_API_URL || 'https://api.topcoder-dev.com/v4/challenges',
  SCORECARD_API_URL: process.env.SCORECARD_API_URL || 'http://localhost:4000/scorecards',
  BUS_API_URL: process.env.BUS_API_URL || 'https://api.topcoder-dev.com/v5/bus/events',

  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder-dev.auth0.com/oauth/token',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '8QovDh27SrDu1XSs68m21A1NBP8isvOt',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '3QVxxu20QnagdH-McWhVz0WfsQzA1F8taDdGDI4XphgpEYZPcMTF4lX3aeOIeCzh',
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,

  // review type mapping to legacy review type id
  REVIEW_TYPES: {
    1: 'Screening',
    2: 'Review',
    5: 'Specification Review',
    6: 'Checkpoint Screening',
    7: 'Checkpoint Review',
    8: 'Iterative Review',
    9: 'Aggregation Review',
    10: 'Final Review',
    11: 'Approval',
    12: 'Post-Mortem'
  }
}
