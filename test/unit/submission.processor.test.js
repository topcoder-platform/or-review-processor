/**
 * Mocha tests of the Scorecard Submission Processor.
 */
process.env.NODE_ENV = 'test'

global.Promise = require('bluebird')

const _ = require('lodash')
const config = require('config')
const testHelper = require('../common/testHelper')
const SubmissionProcessorService = require('../../src/services/SubmissionProcessorService')
const { testTopics, avScanTopic, reviewActionTopic } = require('../common/testData')

describe('Topcoder - Scorecard Submission Processor Unit Test', () => {
  before(async () => {
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

    it(`processor ${operation} submission success`, async () => {
      await SubmissionProcessorService.processSubmission(testMessage)

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
    })

    it('test challenge not found.', async () => {
      const message = _.cloneDeep(testMessage)
      message.payload.legacyChallengeId = 89898989
      try {
        await SubmissionProcessorService.processSubmission(message)
        throw new Error('should not throw error here')
      } catch (err) {
        testHelper.assertErrorMessage('Error: cannot GET /v4/challenges/89898989 (404)')
      }
    })

    it('test no matched score system.', async () => {
      const message = _.cloneDeep(testMessage)
      message.payload.legacyChallengeId = 30054674
      await SubmissionProcessorService.processSubmission(message)

      testHelper.assertDebugMessage('Scorecard id: 30001610')
      testHelper.assertDebugMessage('Current phase: Stalled')
      testHelper.assertNoDebugMessage('Post Kafka message for score system')
    })

    it('test invalid parameters, resource field is invalid', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.resource', 'abc')
      try {
        await SubmissionProcessorService.processSubmission(message)
        throw new Error('should not throw error here')
      } catch (err) {
        testHelper.assertValidationError(err, '"resource" must be one of [submission]')
      }
    })

    it('test invalid parameters, type field is invalid', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.type', 'abc')
      try {
        await SubmissionProcessorService.processSubmission(message)
        throw new Error('should not throw error here')
      } catch (err) {
        testHelper.assertValidationError(err, '"type" must be one of [Contest Submission]')
      }
    })

    it('test invalid parameters, id field is invalid GUID', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.id', 'invalid-guid')
      try {
        await SubmissionProcessorService.processSubmission(message)
        throw new Error('should not throw error here')
      } catch (err) {
        testHelper.assertValidationError(err, '"id" must be a valid GUID')
      }
    })

    it('test invalid parameters, url field is invalid URL', async () => {
      const message = _.cloneDeep(testMessage)
      _.set(message, 'payload.url', 'invalid-url')
      try {
        await SubmissionProcessorService.processSubmission(message)
        throw new Error('should not throw error here')
      } catch (err) {
        testHelper.assertValidationError(err, '"url" must be a valid uri')
      }
    })

    for (const requiredField of requiredFields) {
      if (requiredField !== 'topic') {
        it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
          let message = _.cloneDeep(testMessage)
          message = _.omit(message, requiredField)
          try {
            await SubmissionProcessorService.processSubmission(message)
            throw new Error('should not throw error here')
          } catch (err) {
            testHelper.assertValidationError(err, `"${_.last(requiredField.split('.'))}" is required`)
          }
        })
      }
    }

    for (const stringField of stringFields) {
      if (stringField !== 'topic') {
        it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
          const message = _.cloneDeep(testMessage)
          _.set(message, stringField, 123)
          try {
            await SubmissionProcessorService.processSubmission(message)
            throw new Error('should not throw error here')
          } catch (err) {
            testHelper.assertValidationError(err, `"${_.last(stringField.split('.'))}" must be a string`)
          }
        })
      }
    }

    for (const dateField of dateFields) {
      it(`test invalid parameters, invalid date type field ${dateField}`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, dateField, 'invalid-date')
        try {
          await SubmissionProcessorService.processSubmission(message)
          throw new Error('should not throw error here')
        } catch (err) {
          testHelper.assertValidationError(err,
            `"${_.last(dateField.split('.'))}" must be a number of milliseconds or valid date string`)
        }
      })
    }

    for (const booleanField of booleanFields) {
      it(`test invalid parameters, invalid boolean type field ${booleanField}`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, booleanField, 'abc')
        try {
          await SubmissionProcessorService.processSubmission(message)
          throw new Error('should not throw error here')
        } catch (err) {
          testHelper.assertValidationError(err, `"${_.last(booleanField.split('.'))}" must be a boolean`)
        }
      })
    }

    for (const integerField of integerFields) {
      it(`test invalid parameters, invalid integer type field ${integerField} (wrong number)`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, integerField, 'string')
        try {
          await SubmissionProcessorService.processSubmission(message)
          throw new Error('should not throw error here')
        } catch (err) {
          testHelper.assertValidationError(err, `"${_.last(integerField.split('.'))}" must be a number`)
        }
      })

      it(`test invalid parameters, invalid integer type field ${integerField} (wrong integer)`, async () => {
        const message = _.cloneDeep(testMessage)
        _.set(message, integerField, 1.1)
        try {
          await SubmissionProcessorService.processSubmission(message)
          throw new Error('should not throw error here')
        } catch (err) {
          testHelper.assertValidationError(err, `"${_.last(integerField.split('.'))}" must be an integer`)
        }
      })
    }
  }
})
