/**
 * Mocha tests of the OR review Processor.
 */
process.env.NODE_ENV = 'test'

const _ = require('lodash')
const config = require('config')
const should = require('should')
const helper = require('../../src/common/helper')
const logger = require('../../src/common/logger')
const ProcessorService = require('../../src/services/ProcessorService')
const testHelper = require('../common/testHelper')
const { testTopics } = require('../common/testData')

describe('Topcoder - OR Review Processor Unit Test', () => {
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug
  let m2mToken

  /**
   * Assert validation error
   * @param err the error
   * @param message the message
   */
  const assertValidationError = (err, message) => {
    err.isJoi.should.be.true()
    should.equal(err.name, 'ValidationError')
    err.details.map(x => x.message).should.containEql(message)
    errorLogs.should.not.be.empty()
    errorLogs.should.containEql(err.stack)
  }

  /**
   * Sleep with time from input
   * @param time the time input
   */
  async function sleep (time) {
    await new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  before(async () => {
    // generate M2M token
    m2mToken = await helper.getM2Mtoken()
    // inject logger with log collector
    logger.info = (message) => {
      infoLogs.push(message)
      info(message)
    }
    logger.debug = (message) => {
      debugLogs.push(message)
      debug(message)
    }
    logger.error = (message) => {
      errorLogs.push(message)
      error(message)
    }
  })

  after(async () => {
    const submissionId = '5035ded4-db41-4198-9fdf-096671114317'
    let res = await helper.getRequest(config.REVIEW_API_URL,
      { submissionId, reviewerId: 151743, scoreCardId: 300001610 },
      m2mToken)
    const [review] = res.body
    await testHelper.deleteRequest(`${config.REVIEW_API_URL}/${review.id}`, m2mToken)

    res = await helper.getRequest(`${config.REVIEW_SUMMATION_API_URL}`, { submissionId }, m2mToken)
    const [reviewSummation] = res.body
    await testHelper.deleteRequest(`${config.REVIEW_SUMMATION_API_URL}/${reviewSummation.id}`, m2mToken)

    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    debugLogs = []
    errorLogs = []
  })

  it('processor create review success', async () => {
    await ProcessorService.process(testTopics.create.testMessage)
    // wait for the data updated in remote server
    await sleep(config.WAIT_TIME)
    const submissionId = '5035ded4-db41-4198-9fdf-096671114317'
    let res = await helper.getRequest(config.REVIEW_API_URL,
      { submissionId, reviewerId: 151743, scoreCardId: 300001610 },
      m2mToken)
    const [review] = res.body
    should.equal(review.score, 90)
    should.equal(review.typeId, 'c56a4180-65aa-42ec-a945-5fd21dec0503')
  })

  it('processor update review success', async () => {
    await ProcessorService.process(testTopics.update.testMessage)
    // wait for the data updated in remote server
    await sleep(config.WAIT_TIME)
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
      await ProcessorService.process(message)
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, '"userId" is not allowed')
    }
  })

  it('test invalid parameters, fail to retrieve review with given criteria.', async () => {
    let message = _.cloneDeep(testTopics.update.testMessage)
    message.payload.scorecardId = 300001611
    try {
      await ProcessorService.process(message)
      throw new Error('should not throw error here')
    } catch (err) {
      errorLogs.should.not.be.empty()
      errorLogs[1].should.containEql('Review doesn\'t exist under criteria')
    }
  })

  it('test invalid eventType, fail to retrieve review with given criteria.', async () => {
    let message = _.cloneDeep(testTopics.create.testMessage)
    message.payload.eventType = 'INVALID_TYPE'
    try {
      await ProcessorService.process(message)
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
        await ProcessorService.process(message)
        throw new Error('should not throw error here')
      } catch (err) {
        errorLogs.should.not.be.empty()
        errorLogs[1].should.containEql('Incorrect submission id 111111111')
      }
    })

    it('test invalid parameters, fail to get reviewType UUID.', async () => {
      let message = _.cloneDeep(testMessage)
      message.payload.reviewTypeId = 12
      try {
        await ProcessorService.process(message)
        throw new Error('should not throw error here')
      } catch (err) {
        errorLogs.should.not.be.empty()
        errorLogs[1].should.containEql('Incorrect review type id 12')
      }
    })

    for (const requiredField of requiredFields) {
      if (requiredField !== 'topic') {
        it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
          let message = _.cloneDeep(testMessage)
          message = _.omit(message, requiredField)
          try {
            await ProcessorService.process(message)
            throw new Error('should not throw error here')
          } catch (err) {
            assertValidationError(err, `"${_.last(requiredField.split('.'))}" is required`)
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
            await ProcessorService.process(message)
            throw new Error('should not throw error here')
          } catch (err) {
            assertValidationError(err, `"${_.last(stringField.split('.'))}" must be a string`)
          }
        })
      }
    }

    for (const integerField of integerFields) {
      it(`test invalid parameters, invalid integer type field ${integerField}(wrong number)`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, integerField, 'string')
        try {
          await ProcessorService.process(message)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${_.last(integerField.split('.'))}" must be a number`)
        }
      })

      it(`test invalid parameters, invalid integer type field ${integerField}(wrong integer)`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, integerField, 1.1)
        try {
          await ProcessorService.process(message)
          throw new Error('should not throw error here')
        } catch (err) {
          console.log(err.message)
          if (integerField === 'payload.reviewTypeId') {
            assertValidationError(err, `"${_.last(integerField.split('.'))}" must be one of [${Object.keys(config.REVIEW_TYPES).join(', ')}]`)
          } else {
            assertValidationError(err, `"${_.last(integerField.split('.'))}" must be an integer`)
          }
        }
      })
    }
  }
})
