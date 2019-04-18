/**
 * The test configuration.
 */

module.exports = {
  WAIT_TIME: process.env.WAIT_TIME ? Number(process.env.WAIT_TIME) : 2000,
  REVIEW_SUMMATION_API_URL: process.env.REVIEW_SUMMATION_API_URL ||
    'https://api.topcoder-dev.com/v5/reviewSummations'
}
