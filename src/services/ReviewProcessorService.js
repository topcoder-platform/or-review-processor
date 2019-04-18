/**
 * Review Processor Service
 */

const _ = require('lodash')
const joi = require('joi')
const config = require('config')
const logger = require('../common/logger')
const helper = require('../common/helper')

/**
 * Process create and update review message
 * @param {Object} message the kafka message
 */
async function processReview (message) {
  const eventType = _.get(message, 'payload.eventType')
  if (eventType === 'CREATE' || eventType === 'UPDATE') {
    const m2mToken = await helper.getM2Mtoken()
    const { payload } = message

    // get submission id via legacy id
    const res = await helper.getRequest(config.SUBMISSION_API_URL,
      { legacySubmissionId: payload.submissionId }, m2mToken)
    const [submission] = res.body
    if (_.isUndefined(submission)) {
      throw new Error(`Incorrect submission id ${payload.submissionId}`)
    }

    // get review type UUID
    const typeName = config.REVIEW_TYPES[payload.reviewTypeId]
    const list = await helper.fetchAll(config.REVIEW_TYPE_API_URL,
      { name: typeName, isActive: true, perPage: 100 }, m2mToken)
    const reviewType = _.reduce(list,
      (result, e) => e.name.toLowerCase() === typeName.toLowerCase() ? e : result, undefined)
    if (_.isUndefined(reviewType)) {
      throw new Error(`Incorrect review type id ${payload.reviewTypeId}`)
    }

    // Use metadata to store legacy review id
    const body = {
      score: payload.score,
      typeId: reviewType.id,
      reviewerId: payload.reviewerId,
      scoreCardId: payload.scorecardId,
      submissionId: submission.id
    }

    if (eventType === 'CREATE') {
      await helper.postRequest(config.REVIEW_API_URL, body, m2mToken)
    } else {
      // retrieve review
      let res = await helper.getRequest(config.REVIEW_API_URL,
        {
          submissionId: submission.id,
          reviewerId: payload.reviewerId,
          scoreCardId: payload.scorecardId
        },
        m2mToken)
      const reviews = res.body || []
      // find latest review
      let review
      if (reviews.length > 0) {
        review = reviews[0]
      }
      for (let i = 1; i < reviews.length; i += 1) {
        if (new Date(reviews[i].created) > new Date(review.created)) {
          review = reviews[i]
        }
      }
      if (_.isUndefined(review)) {
        throw new Error(`Review doesn't exist under criteria ${_.pick(payload, ['submissionId', 'reviewerId', 'scorecardId'])}`)
      }

      // update review
      await helper.putRequest(`${config.REVIEW_API_URL}/${review.id}`, body, m2mToken)
    }
  } else {
    throw new Error(`Invalid or not supported eventType: ${eventType}`)
  }
}

processReview.schema = {
  message: joi.object().keys({
    topic: joi.string().required(),
    originator: joi.string().required(),
    timestamp: joi.date().required(),
    'mime-type': joi.string().required(),
    payload: joi.object().keys({
      score: joi.number().min(0).required(),
      submissionId: joi.number().min(1).integer().required(),
      reviewId: joi.number().min(1).integer().required(),
      scorecardId: joi.number().min(1).integer().required(),
      reviewerId: joi.number().min(1).integer().required(),
      userId: joi.when('eventType', {
        is: 'UPDATE',
        then: joi.string().required(),
        otherwise: joi.forbidden()
      }),
      reviewTypeId: joi.number().valid(...Object.keys(config.REVIEW_TYPES).map(v => parseInt(v, 10))).required(),
      eventType: joi.string().required()
    }).required()
  }).required()
}

module.exports = {
  processReview
}

logger.buildService(module.exports)
