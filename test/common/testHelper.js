/**
 * Contains generic helper methods for tests
 */
const _ = require('lodash')
const request = require('superagent')
const should = require('should')
const config = require('config')
const Kafka = require('no-kafka')
const logger = require('../../src/common/logger')
const helper = require('../../src/common/helper')
const testData = require('./testData')

let infoLogs = []
let errorLogs = []
let debugLogs = []
const info = logger.info
const error = logger.error
const debug = logger.debug

let app
let producer

/**
 * Intercept logger.
 */
function interceptLogger () {
  logger.info = (message) => {
    infoLogs.push(message)
    info(message)
  }
  logger.debug = (message) => {
    debugLogs.push(message)
    debug(message)
  }
  logger.error = (message) => {
    if (_.isError(message)) {
      errorLogs.push(message.message || '')
    } else {
      errorLogs.push(String(message))
    }
    error(message)
  }
}

/**
 * Restore logger.
 */
function restoreLogger () {
  logger.error = error
  logger.info = info
  logger.debug = debug
}

/**
 * Clear intercepted logging.
 */
function clearInterceptedLogging () {
  infoLogs = []
  debugLogs = []
  errorLogs = []
}

/**
 * Get intercepted error logs.
 * @returns {Array} the error logs
 */
function getErrorLogs () {
  return errorLogs
}

/**
 * Get intercepted info logs.
 * @returns {Array} the info logs
 */
function getInfoLogs () {
  return infoLogs
}

/**
 * Get intercepted debug logs.
 * @returns {Array} the debug logs
 */
function getDebugLogs () {
  return debugLogs
}

/**
 * Assert validation error
 * @param {Error} err the error
 * @param {String} message the message
 */
function assertValidationError (err, message) {
  err.isJoi.should.be.true()
  should.equal(err.name, 'ValidationError')
  err.details.map(x => x.message).should.containEql(message)
  errorLogs.should.not.be.empty()
  errorLogs.should.containEql(err.stack)
}

/**
 * Assert error message
 * @param {String} message the message
 */
function assertErrorMessage (message) {
  errorLogs.should.not.be.empty()
  errorLogs.join('|').should.containEql(message)
}

/**
 * Assert info message
 * @param {String} message the message
 */
function assertInfoMessage (message) {
  infoLogs.should.not.be.empty()
  infoLogs.join('|').should.containEql(message)
}

/**
 * Assert debug message
 * @param {String} message the message
 */
function assertDebugMessage (message) {
  debugLogs.should.not.be.empty()
  debugLogs.join('|').should.containEql(message)
}

/**
 * Assert no debug message
 * @param {String} message the message
 */
function assertNoDebugMessage (message) {
  debugLogs.join('|').should.not.containEql(message)
}

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

/**
 * Sleep with time from input
 * @param {Number} time the time input
 */
async function sleep (time) {
  await new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

/**
 * Init producer
 */
async function initProducer () {
  producer = new Kafka.Producer(helper.getKafkaOptions())
  await producer.init()
}

/**
 * Stop producer
 */
async function stopProducer () {
  try {
    await producer.end()
  } catch (err) {
    // ignore
  }
}

/**
 * Get producer
 * @returns {Object} the producer
 */
function getProducer () {
  return producer
}

/**
 * Send message
 * @param {Object} testMessage the test message to send
 */
async function sendMessage (testMessage) {
  await producer.send({
    topic: testMessage.topic,
    message: {
      value: JSON.stringify(testMessage)
    }
  })
}

/**
 * Consume not committed messages before e2e test
 */
async function consumeMessages () {
  // consume and commit all not processed messages
  const consumer = new Kafka.GroupConsumer(helper.getKafkaOptions())
  await consumer.init([{
    subscriptions: [config.REVIEW_TOPIC, config.CREATE_SUBMISSION_TOPIC, config.UPDATE_SUBMISSION_TOPIC,
      testData.avScanTopic, testData.reviewActionTopic],
    handler: (messageSet, topic, partition) => Promise.each(messageSet,
      (m) => consumer.commitOffset({ topic, partition, offset: m.offset }))
  }])
  // make sure process all not committed messages before test
  await sleep(3 * config.WAIT_TIME)
  await consumer.end()
}

/**
 * Wait job finished with successful log or error log is found
 */
async function waitJob () {
  // the message pattern to get topic/partition/offset
  const messagePattern = /^Handle Kafka event message; Topic: (.+); Partition: (.+); Offset: (.+); Message: (.+).$/
  while (true) {
    if (errorLogs.length > 0) {
      if (infoLogs.length && messagePattern.exec(infoLogs[0])) {
        const matchResult = messagePattern.exec(infoLogs[0])
        // only manually commit for error message during test
        await app.commitOffset({
          topic: matchResult[1],
          partition: parseInt(matchResult[2]),
          offset: parseInt(matchResult[3])
        })
      }
      break
    }
    if (debugLogs.some(x => String(x).includes('Successfully processed message'))) {
      break
    }
    // wait
    await sleep(config.WAIT_TIME)
  }
}

/**
 * Init the processor app
 */
async function initApp () {
  if (!app) {
    // start the application (kafka listener)
    app = require('../../src/app')
    // wait until consumer init successfully
    while (true) {
      if (infoLogs.some(x => String(x).includes('Kick Start'))) {
        break
      }
      await sleep(config.WAIT_TIME)
    }
  }
}

module.exports = {
  interceptLogger,
  restoreLogger,
  clearInterceptedLogging,
  getErrorLogs,
  getInfoLogs,
  getDebugLogs,
  assertValidationError,
  assertErrorMessage,
  assertInfoMessage,
  assertDebugMessage,
  assertNoDebugMessage,
  deleteRequest,
  sleep,
  initProducer,
  stopProducer,
  getProducer,
  sendMessage,
  consumeMessages,
  waitJob,
  initApp
}
