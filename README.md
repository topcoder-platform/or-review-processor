# Topcoder - Scorecard Processor

## Dependencies

- nodejs https://nodejs.org/en/ (v10+)
- Kafka

## Configuration

Configuration for the Scorecard processor is at `config/default.js`.
The following parameters can be set in config files or in env variables:
- LOG_LEVEL: the log level; default value: 'debug'
- KAFKA_URL: comma separated Kafka hosts; default value: 'localhost:9092'
- KAFKA_CLIENT_CERT: Kafka connection certificate, optional; default value is undefined;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to certificate file or certificate content
- KAFKA_CLIENT_CERT_KEY: Kafka connection private key, optional; default value is undefined;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to private key file or private key content
- KAFKA_GROUP_ID: consumer group id; default value: 'scorecard-processor'
- REVIEW_TOPIC : Review topic, default value is 'submission.notification.score'
- CREATE_SUBMISSION_TOPIC : create submission topic, default value is 'submission.notification.create'
- UPDATE_SUBMISSION_TOPIC : update submission topic, default value is 'submission.notification.update'
- SUBMISSION_API_URL: submission api url, default is 'https://api.topcoder-dev.com/v5'
- CHALLENGE_API_URL: challenge API URL, default is 'https://api.topcoder-dev.com/v4/challenges'
- SCORECARD_API_URL: scorecard API URL, default is 'http://localhost:4000/scorecards'
- BUS_API_URL: bus API URL, default is 'https://api.topcoder-dev.com/v5/bus/events'
- AUTH0_URL: Auth0 URL, used to get TC M2M token
- AUTH0_AUDIENCE: Auth0 audience, used to get TC M2M token
- TOKEN_CACHE_TIME: Auth0 token cache time, used to get TC M2M token
- AUTH0_CLIENT_ID: Auth0 client id, used to get TC M2M token
- AUTH0_CLIENT_SECRET: Auth0 client secret, used to get TC M2M token
- AUTH0_PROXY_SERVER_URL: Proxy Auth0 URL, used to get TC M2M token
- REVIEW_TYPES: The review types mapping from legacy system

Also note that there is a `/health` endpoint that checks for the health of the app. This sets up an expressjs server and listens on the environment variable `PORT`. It's not part of the configuration file and needs to be passed as an environment variable

Configuration for the tests is at `config/test.js`, only add such new configurations different from `config/default.js`
- WAIT_TIME: wait time used in test, default is 2000 or 2 seconds
- SCORECARD_API_URL: the scorecard api url used in testing

## Local Kafka setup

- `http://kafka.apache.org/quickstart` contains details to setup and manage Kafka server,
  below provides details to setup Kafka server in Linux/Mac, Windows will use bat commands in bin/windows instead
- download kafka at `https://www.apache.org/dyn/closer.cgi?path=/kafka/1.1.0/kafka_2.11-1.1.0.tgz`
- extract out the downloaded tgz file
- go to extracted directory kafka_2.11-0.11.0.1
- start ZooKeeper server:
  `bin/zookeeper-server-start.sh config/zookeeper.properties`
- use another terminal, go to same directory, start the Kafka server:
  `bin/kafka-server-start.sh config/server.properties`
- note that the zookeeper server is at localhost:2181, and Kafka server is at localhost:9092
- use another terminal, go to same directory, create the needed topics:
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.score`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.create`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.update`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic avscan.action.scan`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic or.action.review`
- verify that the topics are created:
  `bin/kafka-topics.sh --list --zookeeper localhost:2181`,
  it should list out the created topics
- run the producer and then write some message into the console to send to the `submission.notification.score` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.score`
  in the console, write message, one message per line:
  `{ "topic": "submission.notification.score", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "score": 85, "submissionId": 206744, "reviewId": 390088, "scorecardId": 300001610, "reviewerId": 151743, "reviewTypeId": 2, "eventType": "CREATE" } }`
- optionally, use another terminal, go to same directory, start a consumer to view the messages:
  `bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic submission.notification.score --from-beginning`
- writing/reading messages to/from other topics are similar

## Local deployment
1. Make sure that Kafka is running as per instructions above.
2. From the project root directory, run the following command to install the dependencies
```
npm install
```
3. To run linters if required
```
npm run lint

npm run lint:fix # To fix possible lint errors
```
4. Start the processor and health check dropin
```
npm start
```

## Testing
- Run `npm run test` to execute unit tests.
- RUN `npm run e2e` to execute e2e tests.

## Verification
Refer to the verification document `Verification.md`

## Notes
- the retrieved M2M token has no permission to delete review summation,
  but clearing review summation is not necessary, so we may ignore such forbidden error
- usually, we should use TC bus API (POST /v5/bus/events) to send new messages for SubmissionProcessorService.processSubmission,
  but recently some TC dev API is not available, and the bus API fails with `504 temporarily unavailable error` when
  posting to topic `or.action.review`, so instead, this processor uses a Kafka producer to send new messages
