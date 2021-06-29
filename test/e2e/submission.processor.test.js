/**
 * E2E test of the Scorecard Submission Processor.
 */
process.env.NODE_ENV = 'test'

global.Promise = require('bluebird')

const _ = require('lodash')
const config = require('config')
const should = require('should')
const testHelper = require('../common/testHelper')
const { testTopics, avScanTopic, reviewActionTopic } = require('../common/testData')
const dataHandler = require('../../src/app')

describe('Topcoder - Scorecard Submission Processor E2E Test', () => {
  before(async () => {
    // intercept logger
    testHelper.interceptLogger()
  })

  after(async () => {
    testHelper.restoreLogger()
  })

  beforeEach(() => {
    testHelper.clearInterceptedLogging()
  })

  for (const topic of [config.AGGREGATE_SUBMISSION_TOPIC]) {
    const { operation, requiredFields, integerFields, stringFields, dateFields,
      booleanFields, testMessage } = testTopics[topic]

    it('Should handle invalid json message', async () => {
      await dataHandler([{ message: { value: '[ invalid' }, offset: 0 }], testMessage.topic, 0)
      testHelper.assertErrorMessage('Invalid message JSON.')

      testHelper.assertErrorMessage('Invalid message JSON.')
    })

    it('Should handle incorrect topic field message', async () => {
      const message = _.cloneDeep(testMessage)
      message.topic = 'invalid'
      await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
      testHelper.assertErrorMessage(
        `The message topic invalid doesn't match the Kafka topic ${topic}.`)
    })

    it(`processor ${operation} submission success`, async () => {
      await dataHandler([{ message: { value: JSON.stringify(testMessage) }, offset: 0 }], testMessage.topic, 0)

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
      testHelper.assertDebugMessage(`"legacyChallengeId": ${testMessage.payload.legacyChallengeId}`)
      testHelper.assertDebugMessage(`"created": "${testMessage.payload.created}"`)
      testHelper.assertDebugMessage(`"updated": "${testMessage.payload.updated}"`)
      testHelper.assertDebugMessage(`"createdBy": "${testMessage.payload.createdBy}"`)
      testHelper.assertDebugMessage(`"updatedBy": "${testMessage.payload.updatedBy}"`)
      testHelper.assertDebugMessage(`"submissionPhaseId": ${testMessage.payload.submissionPhaseId}`)
      testHelper.assertDebugMessage(`"fileType": "${testMessage.payload.fileType}"`)
      testHelper.assertDebugMessage(`"isFileSubmission": ${testMessage.payload.isFileSubmission ? 'true' : 'false'}`)
      testHelper.assertDebugMessage(`"eventType": "${operation.toUpperCase()}"`)
      testHelper.assertDebugMessage('Successfully processed message')

      const debugLogs = testHelper.getDebugLogs()
      const avScanIndex = _.findIndex(debugLogs, m => m === `Send Kafka message to topic: ${avScanTopic}`)

      debugLogs[avScanIndex + 1].should.startWith('Payload: ')
      const avScanMessage = JSON.parse(debugLogs[avScanIndex + 1].substring(9))

      // check generated Kafka messages
      should.equal(avScanMessage.topic, avScanTopic)
      should.equal(avScanMessage.originator, 'tc-scorecard-processor')
      should.exist(avScanMessage.timestamp)
      should.equal(avScanMessage['mime-type'], 'application/json')
      should.exist(avScanMessage.payload)
      should.equal(avScanMessage.payload.status, 'unscanned')
      should.equal(avScanMessage.payload.submissionId, testMessage.payload.id)
      should.equal(avScanMessage.payload.url, testMessage.payload.url)
      should.equal(avScanMessage.payload.fileName, '30054740-8547899-SUBMISSION_ZIP-1554188341581.zip')

      const orReviewIndex = _.findIndex(debugLogs, m => m === `Send Kafka message to topic: ${reviewActionTopic}`)

      debugLogs[orReviewIndex + 1].should.startWith('Payload: ')
      const orReviewMessage = JSON.parse(debugLogs[orReviewIndex + 1].substring(9))
      should.equal(orReviewMessage.topic, reviewActionTopic)
      should.equal(orReviewMessage.originator, 'tc-scorecard-processor')
      should.exist(orReviewMessage.timestamp)
      should.equal(orReviewMessage['mime-type'], 'application/json')
      should.exist(orReviewMessage.payload)
      should.equal(orReviewMessage.payload.resource, testMessage.payload.resource)
      should.equal(orReviewMessage.payload.id, testMessage.payload.id)
      should.equal(orReviewMessage.payload.type, testMessage.payload.type)
      should.equal(orReviewMessage.payload.url, testMessage.payload.url)
      should.equal(orReviewMessage.payload.memberId, testMessage.payload.memberId)
      should.equal(orReviewMessage.payload.legacyChallengeId, testMessage.payload.legacyChallengeId)
      should.equal(orReviewMessage.payload.created, testMessage.payload.created)
      should.equal(orReviewMessage.payload.updated, testMessage.payload.updated)
      should.equal(orReviewMessage.payload.createdBy, testMessage.payload.createdBy)
      should.equal(orReviewMessage.payload.updatedBy, testMessage.payload.updatedBy)
      should.equal(orReviewMessage.payload.submissionPhaseId, testMessage.payload.submissionPhaseId)
      should.equal(orReviewMessage.payload.fileType, testMessage.payload.fileType)
      should.equal(orReviewMessage.payload.isFileSubmission, testMessage.payload.isFileSubmission)
      should.equal(orReviewMessage.payload.eventType, operation.toUpperCase())
    })

    it('test challenge not found.', async () => {
      const message = _.cloneDeep(testMessage)
      message.payload.legacyChallengeId = 89898989
      await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)

      testHelper.assertErrorMessage('Error: cannot GET /v4/challenges/89898989 (404)')
    })

    it('test no matched score system.', async () => {
      const message = _.cloneDeep(testMessage)
      message.payload.legacyChallengeId = 30054674
      await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)

      // check logging
      testHelper.assertDebugMessage('Scorecard id: 30001610')
      testHelper.assertDebugMessage('Current phase: Stalled')
      testHelper.assertNoDebugMessage('Post Kafka message for score system')

      // check generated Kafka messages, there should be no new messages
      const debugLogs = testHelper.getDebugLogs()
      const avScanIndex = _.findIndex(debugLogs, m => m === `Send Kafka message to topic: ${avScanTopic}`)
      should.equal(avScanIndex, -1)
      const orReviewIndex = _.findIndex(debugLogs, m => m === `Send Kafka message to topic: ${reviewActionTopic}`)
      should.equal(orReviewIndex, -1)
    })

    it('test invalid parameters, resource field is invalid', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.resource', 'abc')
      await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
      testHelper.assertErrorMessage('"resource" must be one of [submission]')
    })

    it('test invalid parameters, type field is invalid', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.type', 'abc')
      await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
      testHelper.assertErrorMessage('"type" must be one of [Contest Submission]')
    })

    it('test invalid parameters, id field is invalid GUID', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.id', 'invalid-guid')
      await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
      testHelper.assertErrorMessage('"id" must be a valid GUID')
    })

    it('test invalid parameters, url field is invalid URL', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.url', 'invalid-url')
      await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
      testHelper.assertErrorMessage('"url" must be a valid uri')
    })

    for (const requiredField of requiredFields) {
      if (requiredField !== 'topic') {
        it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
          let message = _.cloneDeep(testMessage)
          message = _.omit(message, requiredField)
          await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
          testHelper.assertErrorMessage(`"${_.last(requiredField.split('.'))}" is required`)
        })
      }
    }

    for (const stringField of stringFields) {
      if (stringField !== 'topic') {
        it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
          const message = _.cloneDeep(testMessage)
          _.set(message, stringField, 123)
          await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
          testHelper.assertErrorMessage(`"${_.last(stringField.split('.'))}" must be a string`)
        })
      }
    }

    for (const dateField of dateFields) {
      it(`test invalid parameters, invalid date type field ${dateField}`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, dateField, 'invalid-date')
        await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
        testHelper.assertErrorMessage(
          `"${_.last(dateField.split('.'))}" must be a number of milliseconds or valid date string`)
      })
    }

    for (const booleanField of booleanFields) {
      it(`test invalid parameters, invalid boolean type field ${booleanField}`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, booleanField, 'abc')
        await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
        testHelper.assertErrorMessage(`"${_.last(booleanField.split('.'))}" must be a boolean`)
      })
    }

    for (const integerField of integerFields) {
      it(`test invalid parameters, invalid integer type field ${integerField} (wrong number)`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, integerField, 'string')
        await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
        testHelper.assertErrorMessage(`"${_.last(integerField.split('.'))}" must be a number`)
      })

      it(`test invalid parameters, invalid integer type field ${integerField} (wrong integer)`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, integerField, 1.1)
        await dataHandler([{ message: { value: JSON.stringify(message) }, offset: 0 }], testMessage.topic, 0)
        testHelper.assertErrorMessage(`"${_.last(integerField.split('.'))}" must be an integer`)
      })
    }
  }
})
