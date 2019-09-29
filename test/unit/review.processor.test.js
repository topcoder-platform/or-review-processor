/**
 * Mocha tests of the Scorecard Review Processor.
 */
process.env.NODE_ENV = 'test'

global.Promise = require('bluebird')

const _ = require('lodash')
const config = require('config')
const ReviewProcessorService = require('../../src/services/ReviewProcessorService')
const testHelper = require('../common/testHelper')
const { testTopics } = require('../common/testData')

describe('Topcoder - Scorecard Review Processor Unit Test', () => {
  before(async () => {
    testHelper.interceptLogger()
  })

  after(async () => {
    testHelper.restoreLogger()
  })

  beforeEach(() => {
    testHelper.clearInterceptedLogging()
  })

  it('processor create review success', async () => {
    await ReviewProcessorService.processReview(testTopics.create.testMessage)

    testHelper.assertDebugMessage('Get submission')
    testHelper.assertDebugMessage('Submission id: b91a0ca3-3988-4899-bab4-c789f22def39')
    testHelper.assertDebugMessage('Get review type')
    testHelper.assertDebugMessage('Review type id: ff5742d6-22bf-4734-b632-add6641078be')
    testHelper.assertDebugMessage('Create review')
  })

  it('processor update review success', async () => {
    await ReviewProcessorService.processReview(testTopics.update.testMessage)

    testHelper.assertDebugMessage('Get submission')
    testHelper.assertDebugMessage('Submission id: b91a0ca3-3988-4899-bab4-c789f22def39')
    testHelper.assertDebugMessage('Get review type')
    testHelper.assertDebugMessage('Review type id: ff5742d6-22bf-4734-b632-add6641078be')
    testHelper.assertDebugMessage('Get review')
    testHelper.assertDebugMessage('Review id: 9c1c080a-b54f-46c4-b87b-6218038be765')
    testHelper.assertDebugMessage('Update review')
  })

  it('test invalid parameters, userId is forbidden for create review message.', async () => {
    let message = _.cloneDeep(testTopics.create.testMessage)
    message.payload.userId = '12345'
    try {
      await ReviewProcessorService.processReview(message)
      throw new Error('should not throw error here')
    } catch (err) {
      testHelper.assertValidationError(err, '"userId" is not allowed')
    }
  })

  it('test invalid parameters, fail to retrieve review with given criteria.', async () => {
    let message = _.cloneDeep(testTopics.update.testMessage)
    message.payload.scorecardId = 300001611
    try {
      await ReviewProcessorService.processReview(message)
      throw new Error('should not throw error here')
    } catch (err) {
      testHelper.assertErrorMessage('Review doesn\'t exist under criteria')
    }
  })

  it('test invalid eventType, fail to retrieve review with given criteria.', async () => {
    let message = _.cloneDeep(testTopics.create.testMessage)
    message.payload.eventType = 'INVALID_TYPE'
    try {
      await ReviewProcessorService.processReview(message)
      throw new Error('should not throw error here')
    } catch (err) {
      testHelper.assertErrorMessage('Invalid or not supported eventType: INVALID_TYPE')
    }
  })

  for (const op of ['create', 'update']) {
    let { requiredFields, integerFields, stringFields, testMessage } = testTopics[op]

    it('test invalid parameters, field submissionId incorrect', async () => {
      let message = _.cloneDeep(testMessage)
      message.payload.submissionId = 111111111
      try {
        await ReviewProcessorService.processReview(message)
        throw new Error('should not throw error here')
      } catch (err) {
        testHelper.assertErrorMessage('Incorrect submission id 111111111')
      }
    })

    it('test invalid parameters, fail to get reviewType UUID.', async () => {
      let message = _.cloneDeep(testMessage)
      message.payload.reviewTypeId = 12
      try {
        await ReviewProcessorService.processReview(message)
        throw new Error('should not throw error here')
      } catch (err) {
        testHelper.assertErrorMessage('Incorrect review type id 12')
      }
    })

    for (const requiredField of requiredFields) {
      if (requiredField !== 'topic') {
        it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
          let message = _.cloneDeep(testMessage)
          message = _.omit(message, requiredField)
          try {
            await ReviewProcessorService.processReview(message)
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
          let message = _.cloneDeep(testMessage)
          _.set(message, stringField, 123)
          try {
            await ReviewProcessorService.processReview(message)
            throw new Error('should not throw error here')
          } catch (err) {
            testHelper.assertValidationError(err, `"${_.last(stringField.split('.'))}" must be a string`)
          }
        })
      }
    }

    for (const integerField of integerFields) {
      it(`test invalid parameters, invalid integer type field ${integerField}(wrong number)`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, integerField, 'string')
        try {
          await ReviewProcessorService.processReview(message)
          throw new Error('should not throw error here')
        } catch (err) {
          testHelper.assertValidationError(err, `"${_.last(integerField.split('.'))}" must be a number`)
        }
      })

      it(`test invalid parameters, invalid integer type field ${integerField}(wrong integer)`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, integerField, 1.1)
        try {
          await ReviewProcessorService.processReview(message)
          throw new Error('should not throw error here')
        } catch (err) {
          console.log(err.message)
          if (integerField === 'payload.reviewTypeId') {
            testHelper.assertValidationError(err, `"${_.last(integerField.split('.'))}" must be one of [${Object.keys(config.REVIEW_TYPES).join(', ')}]`)
          } else {
            testHelper.assertValidationError(err, `"${_.last(integerField.split('.'))}" must be an integer`)
          }
        }
      })
    }
  }
})
