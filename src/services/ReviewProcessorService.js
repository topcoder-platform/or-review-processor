/**
 * Review Processor Service
 */

const _ = require('lodash')
const joi = require('joi')
const config = require('config')
const logger = require('../common/logger')
const helper = require('../common/helper')
const submissionApi = require('@topcoder-platform/topcoder-submission-api-wrapper')
const submissionApiM2MClient = submissionApi(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'SUBMISSION_API_URL', 'AUTH0_PROXY_SERVER_URL']))

/**
 * Process create and update review message
 * @param {Object} message the kafka message
 */
async function processReview (message) {
  const eventType = _.get(message, 'payload.eventType')
  if (eventType === 'CREATE' || eventType === 'UPDATE') {
    const { payload } = message

    // get submission id via legacy id
    logger.debug('Get submission')
    const res = await submissionApiM2MClient.searchSubmissions({ legacySubmissionId: payload.submissionId })
    const [submission] = res.body
    if (_.isUndefined(submission)) {
      throw new Error(`Incorrect submission id ${payload.submissionId}`)
    }
    logger.debug(`Submission id: ${submission.id}`)

    // get review type UUID
    logger.debug('Get review type')
    const typeName = config.REVIEW_TYPES[payload.reviewTypeId]
    const list = await helper.fetchAll(submissionApiM2MClient, 'searchReviewTypes', { name: typeName, isActive: true, perPage: 100 })
    const reviewType = _.reduce(list,
      (result, e) => e.name.toLowerCase() === typeName.toLowerCase() ? e : result, undefined)
    if (_.isUndefined(reviewType)) {
      throw new Error(`Incorrect review type id ${payload.reviewTypeId}`)
    }
    logger.debug(`Review type id: ${reviewType.id}`)

    // Use metadata to store legacy review id
    const body = {
      score: payload.score,
      typeId: reviewType.id,
      reviewerId: payload.reviewerId,
      scoreCardId: payload.scorecardId,
      submissionId: submission.id
    }

    if (eventType === 'CREATE') {
      logger.debug('Create review')
      await submissionApiM2MClient.createReview(body)
    } else {
      // retrieve review
      logger.debug('Get review')
      let res = await submissionApiM2MClient.searchReviews(
        {
          submissionId: submission.id,
          reviewerId: payload.reviewerId,
          scoreCardId: payload.scorecardId
        }
      )
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

      logger.debug(`Review id: ${review.id}`)

      // update review
      logger.debug('Update review')
      await submissionApiM2MClient.updateReview(review.id, body)
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
