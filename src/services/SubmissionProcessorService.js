/**
 * Submission Processor Service
 */

const _ = require('lodash')
const joi = require('joi')
const config = require('config')
const Kafka = require('no-kafka')
const logger = require('../common/logger')
const helper = require('../common/helper')

// global Kafka producer to send message
let producer = null

/**
 * Extract file name from URL.
 * @param {String} url the url
 * @returns {String} the extracted file name, or null if none is found
 */
function extractFileNameFromUrl (url) {
  if (!url) {
    return null
  }
  let index = url.lastIndexOf('/')
  if (index < 0) {
    return null
  }
  let s = url.substring(index + 1)
  // remove query parameters if any
  index = s.indexOf('?')
  if (index >= 0) {
    s = s.substring(0, index)
  }
  // remove state part (#) if any
  index = s.indexOf('#')
  if (index >= 0) {
    s = s.substring(0, index)
  }
  return s
}

/**
 * Generate score system message.
 * @param {Object} message the kafka message
 * @param {Object} scoreSystem the score system
 * @returns {Object} the generated message for the score system
 */
function generateScoreSystemMessage (message, scoreSystem) {
  if (scoreSystem.topic === 'avscan.action.scan') {
    return {
      topic: scoreSystem.topic,
      originator: 'tc-scorecard-processor',
      timestamp: new Date().toISOString(),
      'mime-type': 'application/json',
      payload: {
        status: 'unscanned',
        submissionId: message.payload.id,
        url: message.payload.url,
        fileName: extractFileNameFromUrl(message.payload.url)
      }
    }
  }
  if (scoreSystem.topic === 'or.action.review') {
    const payload = message.payload
    payload.eventType = message.topic === config.CREATE_SUBMISSION_TOPIC ? 'CREATE' : 'UPDATE'
    return {
      topic: scoreSystem.topic,
      originator: 'tc-scorecard-processor',
      timestamp: new Date().toISOString(),
      'mime-type': 'application/json',
      payload
    }
  }
  // add handling for other topics in future

  throw new Error(`Unsupported score system topic: ${scoreSystem.topic}`)
}

/**
 * Send message to Kafka.
 * @param {Object} message the kafka message to send.
 */
async function sendMessage (message) {
  // init producer if needed
  if (!producer) {
    producer = new Kafka.Producer(helper.getKafkaOptions())
    // init kafka producer
    try {
      await producer.init()
    } catch (e) {
      // if there is any error, reset producer to null so that it will be re-created next time
      producer = null
      throw e
    }
  }
  // send message
  await producer.send({
    topic: message.topic,
    message: {
      value: JSON.stringify(message)
    }
  })
}

/**
 * Process create/update submission message
 * @param {Object} message the kafka message
 */
async function processSubmission (message) {
  // get M2M token
  logger.debug('Get M2M token')
  const m2mToken = await helper.getM2Mtoken()

  // get challenge details
  logger.debug('Get challenge details')
  const challengeId = message.payload.challengeId
  const challengeRes = await helper.getRequest(`${config.CHALLENGE_API_URL}/${challengeId}`,
    {}, m2mToken)
  if (!_.get(challengeRes, 'body.result.success')) {
    throw new Error(`Failed to get challenge of id ${challengeId}`)
  }
  const challenge = _.get(challengeRes, 'body.result.content')
  // get scorecard id and phase from challenge details
  const scorecardId = challenge.reviewScorecardId
  if (!scorecardId) {
    throw new Error(`Missing review scorecard id for challenge id ${challengeId}`)
  }
  const currentPhase = challenge.currentPhaseName
  if (!currentPhase || currentPhase.length === 0) {
    throw new Error(`Missing current phase for challenge id ${challengeId}`)
  }
  logger.debug(`Scorecard id: ${scorecardId}`)
  logger.debug(`Current phase: ${currentPhase}`)

  // get scorecard details
  logger.debug('Get scorecard details')
  const scorecardRes = await helper.getRequest(`${config.SCORECARD_API_URL}/${scorecardId}`, {}, m2mToken)
  const scorecardDetails = _.get(scorecardRes, 'body.scorecardDetails') || []
  if (scorecardDetails.length === 0) {
    throw new Error(`There are no scorecard details for scorecard id: ${scorecardId}`)
  }

  // create message for each active score system matching current phase
  for (let i = 0; i < scorecardDetails.length; i += 1) {
    const scoreSystem = scorecardDetails[i]
    if (scoreSystem.isActive && scoreSystem.phase.toLowerCase() === currentPhase.toLowerCase()) {
      const newMsg = generateScoreSystemMessage(message, scoreSystem)
      logger.debug(`Post Kafka message for score system ${scoreSystem.name}: ${JSON.stringify(newMsg, null, 4)}`)
      // send message
      await sendMessage(newMsg)
    }
  }
}

processSubmission.schema = {
  message: joi.object().keys({
    topic: joi.string().required(),
    originator: joi.string().required(),
    timestamp: joi.date().required(),
    'mime-type': joi.string().required(),
    payload: joi.object().keys({
      resource: joi.string().valid('submission').required(),
      id: joi.string().guid().required(),
      type: joi.string().valid('Contest Submission').required(),
      url: joi.string().uri().required(),
      memberId: joi.number().integer().min(1).required(),
      challengeId: joi.number().integer().min(1).required(),
      created: joi.date(),
      updated: joi.date(),
      createdBy: joi.string(),
      updatedBy: joi.string(),
      submissionPhaseId: joi.number().integer().min(1).required(),
      fileType: joi.string().required(),
      isFileSubmission: joi.boolean().required()
    }).required()
  }).required()
}

module.exports = {
  processSubmission
}

logger.buildService(module.exports)
