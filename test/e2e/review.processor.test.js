/**
 * E2E test of the Scorecard Review Processor.
 */
process.env.NODE_ENV = 'test'

global.Promise = require('bluebird')

const _ = require('lodash')
const should = require('should')
const request = require('superagent')

const testHelper = require('../common/testHelper')
const { testTopics } = require('../common/testData')

describe('Topcoder - Scorecard Review Processor E2E Test', () => {
  before(async () => {
    // consume and commit existing messages if any
    await testHelper.consumeMessages()
    // init kafka producer
    await testHelper.initProducer()

    // intercept logger
    testHelper.interceptLogger()

    // start the application (kafka listener)
    await testHelper.initApp()
  })

  after(async () => {
    testHelper.restoreLogger()

    await testHelper.stopProducer()
  })

  beforeEach(() => {
    testHelper.clearInterceptedLogging()
  })

  it('Should setup healthcheck with check on kafka connection', async () => {
    const healthcheckEndpoint = `http://localhost:${process.env.PORT || 3000}/health`
    let result = await request.get(healthcheckEndpoint)
    should.equal(result.status, 200)
    should.deepEqual(result.body, { checksRun: 1 })
    testHelper.assertDebugMessage('connected=true')
  })

  it('Should handle invalid json message', async () => {
    const { testMessage } = testTopics.create
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
    const { testMessage } = testTopics.create
    let message = _.cloneDeep(testMessage)
    message.topic = 'invalid'
    await testHelper.getProducer().send({
      topic: testMessage.topic,
      message: {
        value: JSON.stringify(message)
      }
    })
    await testHelper.waitJob()
    testHelper.assertErrorMessage(
      'The message topic invalid doesn\'t match the Kafka topic submission.notification.score.')
  })

  it('processor create review success', async () => {
    await testHelper.sendMessage(testTopics.create.testMessage)
    await testHelper.waitJob()

    testHelper.assertDebugMessage('Get submission')
    testHelper.assertDebugMessage('Submission id: b91a0ca3-3988-4899-bab4-c789f22def39')
    testHelper.assertDebugMessage('Get review type')
    testHelper.assertDebugMessage('Review type id: ff5742d6-22bf-4734-b632-add6641078be')
    testHelper.assertDebugMessage('Create review')
  })

  it('processor update review success', async () => {
    await testHelper.sendMessage(testTopics.update.testMessage)
    await testHelper.waitJob()

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
    await testHelper.sendMessage(message)
    await testHelper.waitJob()
    testHelper.assertErrorMessage('"userId" is not allowed')
  })

  it('test invalid parameters, fail to retrieve review with given criteria.', async () => {
    let message = _.cloneDeep(testTopics.update.testMessage)
    message.payload.scorecardId = 300001611
    await testHelper.sendMessage(message)
    await testHelper.waitJob()
    testHelper.assertErrorMessage('Review doesn\'t exist under criteria')
  })

  it('test invalid eventType, fail to retrieve review with given criteria.', async () => {
    let message = _.cloneDeep(testTopics.create.testMessage)
    message.payload.eventType = 'INVALID_TYPE'
    await testHelper.sendMessage(message)
    await testHelper.waitJob()
    testHelper.assertErrorMessage('Invalid or not supported eventType: INVALID_TYPE')
  })

  for (const op of ['create', 'update']) {
    let { requiredFields, integerFields, stringFields, testMessage } = testTopics[op]

    it('test invalid parameters, field submissionId incorrect', async () => {
      let message = _.cloneDeep(testMessage)
      message.payload.submissionId = 111111111
      await testHelper.sendMessage(message)
      await testHelper.waitJob()
      testHelper.assertErrorMessage('Incorrect submission id 111111111')
    })

    it('test invalid parameters, fail to get reviewType UUID.', async () => {
      let message = _.cloneDeep(testMessage)
      message.payload.reviewTypeId = 12
      await testHelper.sendMessage(message)
      await testHelper.waitJob()
      testHelper.assertErrorMessage('Incorrect review type id 12')
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
          let message = _.cloneDeep(testMessage)
          _.set(message, stringField, 123)
          await testHelper.sendMessage(message)
          await testHelper.waitJob()
          testHelper.assertErrorMessage(`"${_.last(stringField.split('.'))}" must be a string`)
        })
      }
    }

    for (const integerField of integerFields) {
      it(`test invalid parameters, invalid integer type field ${integerField}(wrong number)`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, integerField, 'string')
        await testHelper.sendMessage(message)
        await testHelper.waitJob()
        testHelper.assertErrorMessage(`"${_.last(integerField.split('.'))}" must be a number`)
      })

      it(`test invalid parameters, invalid integer type field ${integerField}(wrong integer)`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, integerField, 1.1)
        await testHelper.sendMessage(message)
        await testHelper.waitJob()
        if (integerField === 'payload.reviewTypeId') {
          testHelper.assertErrorMessage(`"${_.last(integerField.split('.'))}" must be one of [1, 2, 5, 6, 7, 8, 9, 10, 11, 12]`)
        } else {
          testHelper.assertErrorMessage(`"${_.last(integerField.split('.'))}" must be an integer`)
        }
      })
    }
  }
})
