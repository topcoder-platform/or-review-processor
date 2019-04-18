/**
 * Mocha tests of the Scorecard Review Processor.
 */
process.env.NODE_ENV = 'test'

global.Promise = require('bluebird')

const _ = require('lodash')
const config = require('config')
const should = require('should')
const helper = require('../../src/common/helper')
const logger = require('../../src/common/logger')
const ReviewProcessorService = require('../../src/services/ReviewProcessorService')
const testHelper = require('../common/testHelper')
const { testTopics } = require('../common/testData')

describe('Topcoder - Scorecard Review Processor Unit Test', () => {
  let m2mToken

  before(async () => {
    // generate M2M token
    m2mToken = await helper.getM2Mtoken()

    // clear reviews if any
    const submissionId = '5035ded4-db41-4198-9fdf-096671114317'
    let res = await helper.getRequest(config.REVIEW_API_URL,
      { submissionId, reviewerId: 151743, scoreCardId: 300001610 },
      m2mToken)
    const reviews = res.body || []
    for (let i = 0; i < reviews.length; i += 1) {
      await testHelper.deleteRequest(`${config.REVIEW_API_URL}/${reviews[i].id}`, m2mToken)
    }

    testHelper.interceptLogger()
  })

  after(async () => {
    testHelper.restoreLogger()

    const submissionId = '5035ded4-db41-4198-9fdf-096671114317'
    let res = await helper.getRequest(config.REVIEW_API_URL,
      { submissionId, reviewerId: 151743, scoreCardId: 300001610 },
      m2mToken)
    const [review] = res.body
    await testHelper.deleteRequest(`${config.REVIEW_API_URL}/${review.id}`, m2mToken)

    res = await helper.getRequest(`${config.REVIEW_SUMMATION_API_URL}`, { submissionId }, m2mToken)
    const [reviewSummation] = res.body
    if (reviewSummation) {
      try {
        await testHelper.deleteRequest(`${config.REVIEW_SUMMATION_API_URL}/${reviewSummation.id}`, m2mToken)
      } catch (e) {
        // deleting review summation is optional, so we may ignore error here
        logger.error(`Ignored error of deleting review summation: ${e.message}`)
      }
    }
  })

  beforeEach(() => {
    testHelper.clearInterceptedLogging()
  })

  it('processor create review success', async () => {
    await ReviewProcessorService.processReview(testTopics.create.testMessage)
    // wait for the data updated in remote server
    await testHelper.sleep(config.WAIT_TIME)
    const submissionId = '5035ded4-db41-4198-9fdf-096671114317'
    let res = await helper.getRequest(config.REVIEW_API_URL,
      { submissionId, reviewerId: 151743, scoreCardId: 300001610 },
      m2mToken)
    const [review] = res.body
    should.equal(review.score, 90)
    should.equal(review.typeId, 'c56a4180-65aa-42ec-a945-5fd21dec0503')
  })

  it('processor update review success', async () => {
    await ReviewProcessorService.processReview(testTopics.update.testMessage)
    // wait for the data updated in remote server
    await testHelper.sleep(config.WAIT_TIME)
    const submissionId = '5035ded4-db41-4198-9fdf-096671114317'
    let res = await helper.getRequest(config.REVIEW_API_URL,
      { submissionId, reviewerId: 151743, scoreCardId: 300001610 },
      m2mToken)
    const [review] = res.body
    should.equal(review.score, 95)
    should.equal(review.typeId, 'c56a4180-65aa-42ec-a945-5fd21dec0503')
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
      err.message.should.containEql('Invalid or not supported eventType: INVALID_TYPE')
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
