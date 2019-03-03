/**
 * Contains generic helper methods
 */

const request = require('superagent')

/**
 * Uses superagent to proxy delete request
 * @param {String} url the url
 * @param {String} m2mToken the M2M token
 * @returns {Object} the response
 */
async function deleteRequest (url, m2mToken) {
  return request
    .delete(url)
    .set('Authorization', `Bearer ${m2mToken}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
}

module.exports = {
  deleteRequest
}
