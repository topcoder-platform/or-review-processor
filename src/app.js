/**
 * The application entry point
 */

require('./bootstrap')
const config = require('config')
const Kafka = require('no-kafka')
const healthcheck = require('topcoder-healthcheck-dropin')
const logger = require('./common/logger')
const helper = require('./common/helper')
const ReviewProcessorService = require('./services/ReviewProcessorService')
const SubmissionProcessorService = require('./services/SubmissionProcessorService')

// Start kafka consumer
logger.info('Starting kafka consumer')

// create consumer
let consumer
if (process.env.NODE_ENV !== 'test') {
  consumer = new Kafka.GroupConsumer(helper.getKafkaOptions())
}

/*
 * Data handler linked with Kafka consumer
 * Whenever a new message is received by Kafka consumer,
 * this function will be invoked
 */
const dataHandler = (messageSet, topic, partition) => Promise.each(messageSet, async (m) => {
  const message = m.message.value.toString('utf8')
  logger.info(`Handle Kafka event message; Topic: ${topic}; Partition: ${partition}; Offset: ${
    m.offset}; Message: ${message}.`)
  let messageJSON
  try {
    messageJSON = JSON.parse(message)
  } catch (e) {
    logger.error('Invalid message JSON.')
    logger.logFullError(e)
    return
  }

  if (messageJSON.topic !== topic) {
    logger.error(`The message topic ${messageJSON.topic} doesn't match the Kafka topic ${topic}.`)
    return
  }

  console.log(topic, config.AGGREGATE_SUBMISSION_TOPIC, messageJSON.payload.originalTopic, config.CREATE_SUBMISSION_TOPIC)
  console.log(topic === config.AGGREGATE_SUBMISSION_TOPIC, messageJSON.payload.originalTopic === config.CREATE_SUBMISSION_TOPIC)

  return (async () => {
    if (topic === config.REVIEW_TOPIC) {
      await ReviewProcessorService.processReview(messageJSON)
    } else if (topic === config.AGGREGATE_SUBMISSION_TOPIC &&
      messageJSON.payload.originalTopic === config.CREATE_SUBMISSION_TOPIC) {
      await SubmissionProcessorService.processSubmission(messageJSON)
    } else {
      throw new Error(`Invalid topic: ${topic}`)
    }
  })()
    .then(() => { logger.debug('Successfully processed message') })
    .catch((err) => { logger.logFullError(err) })
    // commit offset regardless of errors
    .finally(() => {
      if (consumer) {
        consumer.commitOffset({ topic, partition, offset: m.offset })
      }
    })
})

// check if there is kafka connection alive
function check () {
  if (!consumer.client.initialBrokers && !consumer.client.initialBrokers.length) {
    return false
  }
  let connected = true
  consumer.client.initialBrokers.forEach(conn => {
    logger.debug(`url ${conn.server()} - connected=${conn.connected}`)
    connected = conn.connected & connected
  })
  return connected
}

if (consumer) {
  const topics = [config.REVIEW_TOPIC, config.AGGREGATE_SUBMISSION_TOPIC]

  consumer
    .init([{
      subscriptions: topics,
      handler: dataHandler
    }])
    // consume configured topics
    .then(() => {
      logger.info('Initialized.......')
      healthcheck.init([check])
      logger.info('Adding topics successfully.......')
      logger.info(topics)
      logger.info('Kick Start.......')
    })
    .catch((err) => logger.error(err))
}

if (process.env.NODE_ENV === 'test') {
  module.exports = dataHandler
}
