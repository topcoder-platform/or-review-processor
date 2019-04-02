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

  // Kafka topics related to Creation and Update of review entity
  OR_REVIEW_TOPIC: process.env.OR_REVIEW_TOPIC || 'or.notification.create',

  REVIEW_API_URL: process.env.REVIEW_API_URL || 'https://api.topcoder-dev.com/v5/reviews',
  SUBMISSION_API_URL: process.env.REVIEW_API_URL || 'https://api.topcoder-dev.com/v5/submissions',
  REVIEW_TYPE_API_URL: process.env.REVIEW_API_URL || 'https://api.topcoder-dev.com/v5/reviewTypes',

  AUTH0_URL: process.env.AUTH0_URL,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '6wzC0_gfeuM4yEWOoobl5BylXsI44lczJjGTBABM2EJpbg9zucUwTGlgO7WWbHdt',
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL || 'https://topcoder-dev.auth0.com/oauth/token',

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
