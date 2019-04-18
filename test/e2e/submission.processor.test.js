/**
 * E2E test of the Scorecard Submission Processor.
 */
process.env.NODE_ENV = 'test'

global.Promise = require('bluebird')

const _ = require('lodash')
const config = require('config')
const Kafka = require('no-kafka')
const should = require('should')
const helper = require('../../src/common/helper')
const logger = require('../../src/common/logger')
const testHelper = require('../common/testHelper')
const { testTopics, avScanTopic, reviewActionTopic } = require('../common/testData')

describe('Topcoder - Scorecard Submission Processor E2E Test', () => {
  // score system consumer and messages
  let scoreSystemConsumer
  let avScanMessages = []
  let orReviewMessages = []

  before(async () => {
    // consume and commit existing messages if any
    await testHelper.consumeMessages()
    // init kafka producer
    await testHelper.initProducer()

    // intercept logger
    testHelper.interceptLogger()

    // start the application (kafka listener)
    await testHelper.initApp()

    // start score system consumer
    scoreSystemConsumer = new Kafka.GroupConsumer(helper.getKafkaOptions())
    await scoreSystemConsumer.init([{
      subscriptions: [avScanTopic, reviewActionTopic],
      handler: (messageSet, topic, partition) => Promise.each(messageSet, (m) => {
        return (async () => {
          const message = m.message.value.toString('utf8')
          const messageJSON = JSON.parse(message)
          if (messageJSON.topic === avScanTopic) {
            avScanMessages.push(messageJSON)
          } else if (messageJSON.topic === reviewActionTopic) {
            orReviewMessages.push(messageJSON)
          }
        })()
          .catch((e) => { logger.logFullError(e) })
          .finally(() => scoreSystemConsumer.commitOffset({ topic, partition, offset: m.offset }))
      })
    }])
  })

  after(async () => {
    testHelper.restoreLogger()

    await testHelper.stopProducer()

    try {
      await scoreSystemConsumer.end()
    } catch (e) {
      // ignore
    }
  })

  beforeEach(() => {
    testHelper.clearInterceptedLogging()

    avScanMessages = []
    orReviewMessages = []
  })

  for (const topic of [config.CREATE_SUBMISSION_TOPIC, config.UPDATE_SUBMISSION_TOPIC]) {
    const { operation, requiredFields, integerFields, stringFields, dateFields,
      booleanFields, testMessage } = testTopics[topic]

    it('Should handle invalid json message', async () => {
      await testHelper.getProducer().send({
        topic: testMessage.topic,
        message: {
          value: '[ invalid'
        }
      })
      await testHelper.waitJob()
      testHelper.assertErrorMessage('Invalid message JSON.')
    })

    it('Should handle incorrect topic field message', async () => {
      const message = _.cloneDeep(testMessage)
      message.topic = 'invalid'
      await testHelper.getProducer().send({
        topic: testMessage.topic,
        message: {
          value: JSON.stringify(message)
        }
      })
      await testHelper.waitJob()
      testHelper.assertErrorMessage(
        `The message topic invalid doesn't match the Kafka topic ${topic}.`)
    })

    it(`processor ${operation} submission success`, async () => {
      await testHelper.sendMessage(testMessage)
      await testHelper.waitJob()
      // wait for the score system consumer handles new messages if any
      await testHelper.sleep(config.WAIT_TIME * 3)

      // check loggin
      testHelper.assertDebugMessage('Scorecard id: 30001610')
      testHelper.assertDebugMessage('Current phase: Registration')
      testHelper.assertDebugMessage('Post Kafka message for score system AV Scan')
      testHelper.assertDebugMessage(`"topic": "${avScanTopic}"`)
      testHelper.assertDebugMessage('"originator": "tc-scorecard-processor"')
      testHelper.assertDebugMessage('"timestamp": "')
      testHelper.assertDebugMessage('"mime-type": "application/json"')
      testHelper.assertDebugMessage('"status": "unscanned"')
      testHelper.assertDebugMessage(`"submissionId": "${testMessage.payload.id}"`)
      testHelper.assertDebugMessage(`"url": "${testMessage.payload.url}"`)
      testHelper.assertDebugMessage('"fileName": "30054740-8547899-SUBMISSION_ZIP-1554188341581.zip"')
      testHelper.assertDebugMessage('Post Kafka message for score system OR')
      testHelper.assertDebugMessage(`"topic": "${reviewActionTopic}"`)
      testHelper.assertDebugMessage(`"resource": "${testMessage.payload.resource}"`)
      testHelper.assertDebugMessage(`"id": "${testMessage.payload.id}"`)
      testHelper.assertDebugMessage(`"type": "${testMessage.payload.type}"`)
      testHelper.assertDebugMessage(`"url": "${testMessage.payload.url}"`)
      testHelper.assertDebugMessage(`"memberId": ${testMessage.payload.memberId}`)
      testHelper.assertDebugMessage(`"challengeId": ${testMessage.payload.challengeId}`)
      testHelper.assertDebugMessage(`"created": "${testMessage.payload.created}"`)
      testHelper.assertDebugMessage(`"updated": "${testMessage.payload.updated}"`)
      testHelper.assertDebugMessage(`"createdBy": "${testMessage.payload.createdBy}"`)
      testHelper.assertDebugMessage(`"updatedBy": "${testMessage.payload.updatedBy}"`)
      testHelper.assertDebugMessage(`"submissionPhaseId": ${testMessage.payload.submissionPhaseId}`)
      testHelper.assertDebugMessage(`"fileType": "${testMessage.payload.fileType}"`)
      testHelper.assertDebugMessage(`"isFileSubmission": ${testMessage.payload.isFileSubmission ? 'true' : 'false'}`)
      testHelper.assertDebugMessage(`"eventType": "${operation.toUpperCase()}"`)
      testHelper.assertDebugMessage('Successfully processed message')

      // check generated Kafka messages
      should.equal(avScanMessages.length, 1)
      should.equal(avScanMessages[0].topic, avScanTopic)
      should.equal(avScanMessages[0].originator, 'tc-scorecard-processor')
      should.exist(avScanMessages[0].timestamp)
      should.equal(avScanMessages[0]['mime-type'], 'application/json')
      should.exist(avScanMessages[0].payload)
      should.equal(avScanMessages[0].payload.status, 'unscanned')
      should.equal(avScanMessages[0].payload.submissionId, testMessage.payload.id)
      should.equal(avScanMessages[0].payload.url, testMessage.payload.url)
      should.equal(avScanMessages[0].payload.fileName, '30054740-8547899-SUBMISSION_ZIP-1554188341581.zip')

      should.equal(orReviewMessages.length, 1)
      should.equal(orReviewMessages[0].topic, reviewActionTopic)
      should.equal(orReviewMessages[0].originator, 'tc-scorecard-processor')
      should.exist(orReviewMessages[0].timestamp)
      should.equal(orReviewMessages[0]['mime-type'], 'application/json')
      should.exist(orReviewMessages[0].payload)
      should.equal(orReviewMessages[0].payload.resource, testMessage.payload.resource)
      should.equal(orReviewMessages[0].payload.id, testMessage.payload.id)
      should.equal(orReviewMessages[0].payload.type, testMessage.payload.type)
      should.equal(orReviewMessages[0].payload.url, testMessage.payload.url)
      should.equal(orReviewMessages[0].payload.memberId, testMessage.payload.memberId)
      should.equal(orReviewMessages[0].payload.challengeId, testMessage.payload.challengeId)
      should.equal(orReviewMessages[0].payload.created, testMessage.payload.created)
      should.equal(orReviewMessages[0].payload.updated, testMessage.payload.updated)
      should.equal(orReviewMessages[0].payload.createdBy, testMessage.payload.createdBy)
      should.equal(orReviewMessages[0].payload.updatedBy, testMessage.payload.updatedBy)
      should.equal(orReviewMessages[0].payload.submissionPhaseId, testMessage.payload.submissionPhaseId)
      should.equal(orReviewMessages[0].payload.fileType, testMessage.payload.fileType)
      should.equal(orReviewMessages[0].payload.isFileSubmission, testMessage.payload.isFileSubmission)
      should.equal(orReviewMessages[0].payload.eventType, operation.toUpperCase())
    })

    it('test challenge not found.', async () => {
      const message = _.cloneDeep(testMessage)
      message.payload.challengeId = 89898989
      await testHelper.sendMessage(message)
      await testHelper.waitJob()

      testHelper.assertErrorMessage('Error: cannot GET /v4/challenges/89898989 (404)')
    })

    it('test no matched score system.', async () => {
      const message = _.cloneDeep(testMessage)
      message.payload.challengeId = 30054674
      await testHelper.sendMessage(message)
      await testHelper.waitJob()
      // wait for the score system consumer handles new messages if any
      await testHelper.sleep(config.WAIT_TIME * 3)

      // check logging
      testHelper.assertDebugMessage('Scorecard id: 30001610')
      testHelper.assertDebugMessage('Current phase: Stalled')
      testHelper.assertNoDebugMessage('Post Kafka message for score system')

      // check generated Kafka messages, there should be no new messages
      should.equal(avScanMessages.length, 0)
      should.equal(orReviewMessages.length, 0)
    })

    it('test invalid parameters, resource field is invalid', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.resource', 'abc')
      await testHelper.sendMessage(message)
      await testHelper.waitJob()
      testHelper.assertErrorMessage('"resource" must be one of [submission]')
    })

    it('test invalid parameters, type field is invalid', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.type', 'abc')
      await testHelper.sendMessage(message)
      await testHelper.waitJob()
      testHelper.assertErrorMessage('"type" must be one of [Contest Submission]')
    })

    it('test invalid parameters, id field is invalid GUID', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.id', 'invalid-guid')
      await testHelper.sendMessage(message)
      await testHelper.waitJob()
      testHelper.assertErrorMessage('"id" must be a valid GUID')
    })

    it('test invalid parameters, url field is invalid URL', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.url', 'invalid-url')
      await testHelper.sendMessage(message)
      await testHelper.waitJob()
      testHelper.assertErrorMessage('"url" must be a valid uri')
    })

    for (const requiredField of requiredFields) {
      if (requiredField !== 'topic') {
        it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
          let message = _.cloneDeep(testMessage)
          message = _.omit(message, requiredField)
          await testHelper.sendMessage(message)
          await testHelper.waitJob()
          testHelper.assertErrorMessage(`"${_.last(requiredField.split('.'))}" is required`)
        })
      }
    }

    for (const stringField of stringFields) {
      if (stringField !== 'topic') {
        it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
          const message = _.cloneDeep(testMessage)
          _.set(message, stringField, 123)
          await testHelper.sendMessage(message)
          await testHelper.waitJob()
          testHelper.assertErrorMessage(`"${_.last(stringField.split('.'))}" must be a string`)
        })
      }
    }

    for (const dateField of dateFields) {
      it(`test invalid parameters, invalid date type field ${dateField}`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, dateField, 'invalid-date')
        await testHelper.sendMessage(message)
        await testHelper.waitJob()
        testHelper.assertErrorMessage(
          `"${_.last(dateField.split('.'))}" must be a number of milliseconds or valid date string`)
      })
    }

    for (const booleanField of booleanFields) {
      it(`test invalid parameters, invalid boolean type field ${booleanField}`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, booleanField, 'abc')
        await testHelper.sendMessage(message)
        await testHelper.waitJob()
        testHelper.assertErrorMessage(`"${_.last(booleanField.split('.'))}" must be a boolean`)
      })
    }

    for (const integerField of integerFields) {
      it(`test invalid parameters, invalid integer type field ${integerField} (wrong number)`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, integerField, 'string')
        await testHelper.sendMessage(message)
        await testHelper.waitJob()
        testHelper.assertErrorMessage(`"${_.last(integerField.split('.'))}" must be a number`)
      })

      it(`test invalid parameters, invalid integer type field ${integerField} (wrong integer)`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, integerField, 1.1)
        await testHelper.sendMessage(message)
        await testHelper.waitJob()
        testHelper.assertErrorMessage(`"${_.last(integerField.split('.'))}" must be an integer`)
      })
    }
  }
})
