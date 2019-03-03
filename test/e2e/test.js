/**
 * E2E test of the OR Review Processor.
 */
process.env.NODE_ENV = 'test'

global.Promise = require('bluebird')

const _ = require('lodash')
const config = require('config')
const should = require('should')
const Kafka = require('no-kafka')
const request = require('superagent')
const helper = require('../../src/common/helper')
const logger = require('../../src/common/logger')

const testHelper = require('../common/testHelper')
const { testTopics } = require('../common/testData')

describe('Topcoder - OR Review Processor E2E Test', () => {
  let app
  let m2mToken
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  const producer = new Kafka.Producer(helper.getKafkaOptions())

  /**
   * Sleep with time from input
   * @param time the time input
   */
  async function sleep (time) {
    await new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  /**
   * Send message
   * @param testMessage the test message
   */
  const sendMessage = async (testMessage) => {
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
  const consumeMessages = async () => {
    // remove all not processed messages
    const consumer = new Kafka.GroupConsumer(helper.getKafkaOptions())
    await consumer.init([{
      subscriptions: [config.OR_REVIEW_TOPIC],
      handler: (messageSet, topic, partition) => Promise.each(messageSet,
        (m) => consumer.commitOffset({ topic, partition, offset: m.offset }))
    }])
    // make sure process all not committed messages before test
    await sleep(2 * config.WAIT_TIME)
    await consumer.end()
  }

  // the message patter to get topic/partition/offset
  const messagePattern = /^Handle Kafka event message; Topic: (.+); Partition: (.+); Offset: (.+); Message: (.+).$/
  /**
   * Wait job finished with successful log or error log is found
   */
  const waitJob = async () => {
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
      // use small time to wait job and will use global timeout so will not wait too long
      await sleep(config.WAIT_TIME)
    }
  }

  const assertErrorMessage = (message) => {
    errorLogs.should.not.be.empty()
    errorLogs.some(x => String(x).includes(message)).should.be.true()
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
    await consumeMessages()
    // start kafka producer
    await producer.init()
    // start the application (kafka listener)
    app = require('../../src/app')
    // wait until consumer init successfully
    while (true) {
      if (infoLogs.some(x => String(x).includes('Kick Start'))) {
        break
      }
      await sleep(config.WAIT_TIME)
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

    try {
      await producer.end()
    } catch (err) {
      // ignore
    }
    try {
      await app.end()
    } catch (err) {
      // ignore
    }
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    debugLogs = []
    errorLogs = []
  })

  it('Should setup healthcheck with check on kafka connection', async () => {
    const healthcheckEndpoint = `http://localhost:${process.env.PORT || 3000}/health`
    let result = await request.get(healthcheckEndpoint)
    should.equal(result.status, 200)
    should.deepEqual(result.body, { checksRun: 1 })
    debugLogs.should.match(/connected=true/)
  })

  it('Should handle invalid json message', async () => {
    const { testMessage } = testTopics.create
    await producer.send({
      topic: testMessage.topic,
      message: {
        value: '[ invalid'
      }
    })
    await waitJob()
    should.equal(errorLogs[0], 'Invalid message JSON.')
  })

  it('Should handle incorrect topic field message', async () => {
    const { testMessage } = testTopics.create
    let message = _.cloneDeep(testMessage)
    message.topic = 'invalid'
    await producer.send({
      topic: testMessage.topic,
      message: {
        value: JSON.stringify(message)
      }
    })
    await waitJob()
    should.equal(errorLogs[0], 'The message topic invalid doesn\'t match the Kafka topic or.notification.create.')
  })

  it('processor create review success', async () => {
    await sendMessage(testTopics.create.testMessage)
    await waitJob()
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
    await sendMessage(testTopics.update.testMessage)
    await waitJob()
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
    await sendMessage(message)
    await waitJob()
    assertErrorMessage('"userId" is not allowed')
  })

  it('test invalid parameters, fail to retrieve review with given criteria.', async () => {
    let message = _.cloneDeep(testTopics.update.testMessage)
    message.payload.scorecardId = 300001611
    await sendMessage(message)
    await waitJob()
    assertErrorMessage('Review doesn\'t exist under criteria')
  })

  it('test invalid eventType, fail to retrieve review with given criteria.', async () => {
    let message = _.cloneDeep(testTopics.create.testMessage)
    message.payload.eventType = 'INVALID_TYPE'
    await sendMessage(message)
    await waitJob()
    assertErrorMessage('Invalid or not supported eventType: INVALID_TYPE')
  })

  for (const op of ['create', 'update']) {
    let { requiredFields, integerFields, stringFields, testMessage } = testTopics[op]

    it('test invalid parameters, field submissionId incorrect', async () => {
      let message = _.cloneDeep(testMessage)
      message.payload.submissionId = 111111111
      await sendMessage(message)
      await waitJob()
      assertErrorMessage('Incorrect submission id 111111111')
    })

    it('test invalid parameters, fail to get reviewType UUID.', async () => {
      let message = _.cloneDeep(testMessage)
      message.payload.reviewTypeId = 12
      await sendMessage(message)
      await waitJob()
      assertErrorMessage('Incorrect review type id 12')
    })

    for (const requiredField of requiredFields) {
      if (requiredField !== 'topic') {
        it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
          let message = _.cloneDeep(testMessage)
          message = _.omit(message, requiredField)
          await sendMessage(message)
          await waitJob()
          assertErrorMessage(`"${_.last(requiredField.split('.'))}" is required`)
        })
      }
    }

    for (const stringField of stringFields) {
      if (stringField !== 'topic') {
        it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
          let message = _.cloneDeep(testMessage)
          _.set(message, stringField, 123)
          await sendMessage(message)
          await waitJob()
          assertErrorMessage(`"${_.last(stringField.split('.'))}" must be a string`)
        })
      }
    }

    for (const integerField of integerFields) {
      it(`test invalid parameters, invalid integer type field ${integerField}(wrong number)`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, integerField, 'string')
        await sendMessage(message)
        await waitJob()
        assertErrorMessage(`"${_.last(integerField.split('.'))}" must be a number`)
      })

      it(`test invalid parameters, invalid integer type field ${integerField}(wrong integer)`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, integerField, 1.1)
        await sendMessage(message)
        await waitJob()
        if (integerField === 'payload.reviewTypeId') {
          assertErrorMessage(`"${_.last(integerField.split('.'))}" must be one of [1, 2, 5, 6, 7, 8, 9, 10, 11, 12]`)
        } else {
          assertErrorMessage(`"${_.last(integerField.split('.'))}" must be an integer`)
        }
      })
    }
  }
})
