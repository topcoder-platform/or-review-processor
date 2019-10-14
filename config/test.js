/**
 * The test configuration.
 */

module.exports = {
  WAIT_TIME: process.env.WAIT_TIME ? Number(process.env.WAIT_TIME) : 2000,
  SCORECARD_API_URL: 'https://api.topcoder-dev.com/scorecards'
}
