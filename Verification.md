# Topcoder - Scorecard Processor

## Verification

1. start kafka server, start processor app
2. start kafka-console-producer to write messages to `or.notification.create` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic or.notification.create`
3. write message:
  `{ "topic": "or.notification.create", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "score": 85, "submissionId": 206744, "reviewId": 390088, "scorecardId": 300001610, "reviewerId": 151743, "reviewTypeId": 2, "eventType": "CREATE" } }`
4. watch the app console, it should show info of processing the message
5. Use Postman to verify the data has been updated in remote server
  GET https://api.topcoder-dev.com/v5/submissions?legacySubmissionId=206744
  You will find a new review entity with score 85 in response body, you can also try the following endpoint using the review id you got from above response body
  GET https://api.topcoder-dev.com/v5/reviews/{reviewsId}
6. write message:
  `{ "topic": "or.notification.create", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "score": 90, "submissionId": 206744, "reviewId": 390088, "scorecardId": 300001610, "reviewerId": 151743, "userId": "8547899", "reviewTypeId": 2, "eventType": "UPDATE" } }`
7. watch the app console, it should show info of processing the message
8. repeat step 5, now the score of same review entity is 90
9. Use Postman to clear the testing resource in remote server
   From step 5, you can get the reviewsId and reviewSummationId of entities that added into server just now.
   DELETE https://api.topcoder-dev.com/v5/reviews/{reviewsId}
   DELETE https://api.topcoder-dev.com/v5/reviewSummations/{reviewSummationId}

## Unit test Coverage

  55 passing (2m)

File                  |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------------------|----------|----------|----------|----------|-------------------|
All files             |    90.53 |    79.17 |    92.86 |    91.02 |                   |
 config               |      100 |      100 |      100 |      100 |                   |
  default.js          |      100 |      100 |      100 |      100 |                   |
  test.js             |      100 |      100 |      100 |      100 |                   |
 src                  |    93.75 |       60 |    83.33 |    93.62 |                   |
  app.js              |    93.62 |       60 |    83.33 |    93.48 |          52,65,90 |
  bootstrap.js        |      100 |      100 |      100 |      100 |                   |
 src/common           |    85.56 |    61.54 |       95 |    86.52 |                   |
  helper.js           |       72 |       50 |    85.71 |       75 | 18,91,92,93,95,96 |
  logger.js           |    90.77 |       65 |      100 |    90.77 |31,55,60,84,98,118 |
 src/services         |      100 |    92.86 |      100 |      100 |                   |
  ProcessorService.js |      100 |    92.86 |      100 |      100 |                16 |

## E2E test Coverage

  66 passing (2m)

File                  |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------------------|----------|----------|----------|----------|-------------------|
All files             |    90.53 |    79.17 |    92.86 |    91.02 |                   |
 config               |      100 |      100 |      100 |      100 |                   |
  default.js          |      100 |      100 |      100 |      100 |                   |
  test.js             |      100 |      100 |      100 |      100 |                   |
 src                  |    93.75 |       60 |    83.33 |    93.62 |                   |
  app.js              |    93.62 |       60 |    83.33 |    93.48 |          52,65,90 |
  bootstrap.js        |      100 |      100 |      100 |      100 |                   |
 src/common           |    85.56 |    61.54 |       95 |    86.52 |                   |
  helper.js           |       72 |       50 |    85.71 |       75 | 18,91,92,93,95,96 |
  logger.js           |    90.77 |       65 |      100 |    90.77 |31,55,60,84,98,118 |
 src/services         |      100 |    92.86 |      100 |      100 |                   |
  ProcessorService.js |      100 |    92.86 |      100 |      100 |                16 |
