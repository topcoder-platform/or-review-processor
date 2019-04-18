# Topcoder - Scorecard Processor

## Review Processing Verification

- start kafka server, start processor app
- load Postman collection and environment in `docs` folder into Postman
- run follow command to get a M2M token, configure it to Postman environment `TOKEN` variable:
```
curl --request POST --url https://topcoder-dev.auth0.com/oauth/token --header 'content-type: application/json' --data '{"client_id":"8QovDh27SrDu1XSs68m21A1NBP8isvOt","client_secret":"3QVxxu20QnagdH-McWhVz0WfsQzA1F8taDdGDI4XphgpEYZPcMTF4lX3aeOIeCzh","audience":"https://m2m.topcoder-dev.com/","grant_type":"client_credentials"}'
```

- start kafka-console-producer to write messages to `submission.notification.score` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.score`
- write message:
  `{ "topic": "submission.notification.score", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "score": 85, "submissionId": 206744, "reviewId": 390088, "scorecardId": 300001610, "reviewerId": 151743, "reviewTypeId": 2, "eventType": "CREATE" } }`
- watch the app console, it should show info of processing the message
- Use Postman to verify the data has been updated in remote server
  (get submission by legacy id) GET https://api.topcoder-dev.com/v5/submissions?legacySubmissionId=206744
  You will find a new review entity with score 85 in response body, you can also try the following endpoint using the review id you got from above response body
  (get review by id) GET https://api.topcoder-dev.com/v5/reviews/{reviewsId}
  Note that there may be multiple reviews for a submission, you need to find the one matching above reviewerId and scorecardId,
  if there are still multiple reviews, then find the latest created one.
- write message:
  `{ "topic": "submission.notification.score", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "score": 90, "submissionId": 206744, "reviewId": 390088, "scorecardId": 300001610, "reviewerId": 151743, "userId": "8547899", "reviewTypeId": 2, "eventType": "UPDATE" } }`
- watch the app console, it should show info of processing the message
- repeat above step to get review, now the score of same review entity is 90
- Use Postman to clear the testing resource in remote server
   From step 5, you can get the reviewsId and reviewSummationId of entities that added into server just now.
   (delete review) DELETE https://api.topcoder-dev.com/v5/reviews/{reviewsId}
   (delete review summation) DELETE https://api.topcoder-dev.com/v5/reviewSummations/{reviewSummationId}


## Submission Processing Verification

- start kafka server, start mock-scorecard-api, start processor app
- start kafka-console-consumer to listen to topic `avscan.action.scan`:
  `bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic avscan.action.scan --from-beginning`
- start kafka-console-consumer to listen to topic `or.action.review`:
  `bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic or.action.review --from-beginning`
- start kafka-console-producer to write messages to `submission.notification.create` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.create`
- write message:
  `{ "topic": "submission.notification.create", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "resource": "submission", "id": "104366f8-f46b-45db-a971-11bc69e6c8ff", "type": "Contest Submission", "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip", "memberId": 8547899, "challengeId": 30049360, "created": "2019-04-02T06:59:29.785Z", "updated": "2019-04-02T06:59:29.785Z", "createdBy": "TonyJ", "updatedBy": "TonyJ", "submissionPhaseId": 764644, "fileType": "zip", "isFileSubmission": false } }`
- watch the app console, it should show logging of processing the message:
```
debug: Get M2M token
debug: Get challenge details
debug: Scorecard id: 30001610
debug: Current phase: Registration
debug: Get scorecard details
debug: Post Kafka message for score system AV Scan: {
    "topic": "avscan.action.scan",
    "originator": "tc-scorecard-processor",
    "timestamp": "2019-04-07T21:36:04.181Z",
    "mime-type": "application/json",
    "payload": {
        "status": "unscanned",
        "submissionId": "104366f8-f46b-45db-a971-11bc69e6c8ff",
        "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip",
        "fileName": "30054740-8547899-SUBMISSION_ZIP-1554188341581.zip"
    }
}
debug: Post Kafka message for score system OR: {
    "topic": "or.action.review",
    "originator": "tc-scorecard-processor",
    "timestamp": "2019-04-07T21:36:04.215Z",
    "mime-type": "application/json",
    "payload": {
        "resource": "submission",
        "id": "104366f8-f46b-45db-a971-11bc69e6c8ff",
        "type": "Contest Submission",
        "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip",
        "memberId": 8547899,
        "challengeId": 30049360,
        "created": "2019-04-02T06:59:29.785Z",
        "updated": "2019-04-02T06:59:29.785Z",
        "createdBy": "TonyJ",
        "updatedBy": "TonyJ",
        "submissionPhaseId": 764644,
        "fileType": "zip",
        "isFileSubmission": false,
        "eventType": "CREATE"
    }
}
debug: EXIT processSubmission
debug: output arguments
debug: Successfully processed message
```

- the kafka-console-consumer listening to topic `avscan.action.scan` should show:
```
{"topic":"avscan.action.scan","originator":"tc-scorecard-processor","timestamp":"2019-04-07T21:36:04.181Z","mime-type":"application/json","payload":{"status":"unscanned","submissionId":"104366f8-f46b-45db-a971-11bc69e6c8ff","url":"https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip","fileName":"30054740-8547899-SUBMISSION_ZIP-1554188341581.zip"}}
```

- the kafka-console-consumer listening to topic `or.action.review` should show:
```
{"topic":"or.action.review","originator":"tc-scorecard-processor","timestamp":"2019-04-07T21:36:04.215Z","mime-type":"application/json","payload":{"resource":"submission","id":"104366f8-f46b-45db-a971-11bc69e6c8ff","type":"Contest Submission","url":"https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip","memberId":8547899,"challengeId":30049360,"created":"2019-04-02T06:59:29.785Z","updated":"2019-04-02T06:59:29.785Z","createdBy":"TonyJ","updatedBy":"TonyJ","submissionPhaseId":764644,"fileType":"zip","isFileSubmission":false,"eventType":"CREATE"}}
```

- start kafka-console-producer to write messages to `submission.notification.update` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.update`
- write message:
  `{ "topic": "submission.notification.update", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "resource": "submission", "id": "104366f8-f46b-45db-a971-11bc69e6c8ff", "type": "Contest Submission", "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip", "memberId": 8547899, "challengeId": 30049360, "created": "2019-04-02T06:59:29.785Z", "updated": "2019-04-02T06:59:29.785Z", "createdBy": "TonyJ", "updatedBy": "TonyJ", "submissionPhaseId": 764644, "fileType": "zip", "isFileSubmission": false } }`
- watch the app console, it should show logging of processing the message:
```
debug: Get M2M token
debug: Get challenge details
debug: Scorecard id: 30001610
debug: Current phase: Registration
debug: Get scorecard details
debug: Post Kafka message for score system AV Scan: {
    "topic": "avscan.action.scan",
    "originator": "tc-scorecard-processor",
    "timestamp": "2019-04-07T21:41:52.713Z",
    "mime-type": "application/json",
    "payload": {
        "status": "unscanned",
        "submissionId": "104366f8-f46b-45db-a971-11bc69e6c8ff",
        "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip",
        "fileName": "30054740-8547899-SUBMISSION_ZIP-1554188341581.zip"
    }
}
debug: Post Kafka message for score system OR: {
    "topic": "or.action.review",
    "originator": "tc-scorecard-processor",
    "timestamp": "2019-04-07T21:41:52.729Z",
    "mime-type": "application/json",
    "payload": {
        "resource": "submission",
        "id": "104366f8-f46b-45db-a971-11bc69e6c8ff",
        "type": "Contest Submission",
        "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip",
        "memberId": 8547899,
        "challengeId": 30049360,
        "created": "2019-04-02T06:59:29.785Z",
        "updated": "2019-04-02T06:59:29.785Z",
        "createdBy": "TonyJ",
        "updatedBy": "TonyJ",
        "submissionPhaseId": 764644,
        "fileType": "zip",
        "isFileSubmission": false,
        "eventType": "UPDATE"
    }
}
debug: EXIT processSubmission
debug: output arguments
debug: Successfully processed message
```

- the kafka-console-consumer listening to topic `avscan.action.scan` should show:
```
{"topic":"avscan.action.scan","originator":"tc-scorecard-processor","timestamp":"2019-04-07T21:41:52.713Z","mime-type":"application/json","payload":{"status":"unscanned","submissionId":"104366f8-f46b-45db-a971-11bc69e6c8ff","url":"https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip","fileName":"30054740-8547899-SUBMISSION_ZIP-1554188341581.zip"}}
```

- the kafka-console-consumer listening to topic `or.action.review` should show:
```
{"topic":"or.action.review","originator":"tc-scorecard-processor","timestamp":"2019-04-07T21:41:52.729Z","mime-type":"application/json","payload":{"resource":"submission","id":"104366f8-f46b-45db-a971-11bc69e6c8ff","type":"Contest Submission","url":"https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip","memberId":8547899,"challengeId":30049360,"created":"2019-04-02T06:59:29.785Z","updated":"2019-04-02T06:59:29.785Z","createdBy":"TonyJ","updatedBy":"TonyJ","submissionPhaseId":764644,"fileType":"zip","isFileSubmission":false,"eventType":"UPDATE"}}
```

- you may write invalid messages like below:
  `{ "topic": "submission.notification.update", "originator": "or-app", "timestamp": "invalid", "mime-type": "application/json", "payload": { "resource": "submission", "id": "104366f8-f46b-45db-a971-11bc69e6c8ff", "type": "Contest Submission", "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip", "memberId": 8547899, "challengeId": 30049360, "created": "2019-04-02T06:59:29.785Z", "updated": "2019-04-02T06:59:29.785Z", "createdBy": "TonyJ", "updatedBy": "TonyJ", "submissionPhaseId": 764644, "fileType": "zip", "isFileSubmission": false } }`

  `{ "topic": "submission.notification.update", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "resource": "other", "id": "104366f8-f46b-45db-a971-11bc69e6c8ff", "type": "Contest Submission", "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip", "memberId": 8547899, "challengeId": 30049360, "created": "2019-04-02T06:59:29.785Z", "updated": "2019-04-02T06:59:29.785Z", "createdBy": "TonyJ", "updatedBy": "TonyJ", "submissionPhaseId": 764644, "fileType": "zip", "isFileSubmission": false } }`

  `{ "topic": "submission.notification.update", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "resource": "submission", "memberId": 8547899, "challengeId": 30049360, "created": "2019-04-02T06:59:29.785Z", "updated": "2019-04-02T06:59:29.785Z", "createdBy": "TonyJ", "updatedBy": "TonyJ", "submissionPhaseId": 764644, "fileType": "zip", "isFileSubmission": false } }`

  `[ { , abc`

- the app console will show proper error messages



## Unit test Coverage

  129 passing (51s)

--------------------------------|----------|----------|----------|----------|-------------------|
File                            |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
--------------------------------|----------|----------|----------|----------|-------------------|
All files                       |    89.89 |    78.46 |    98.31 |    90.22 |                   |
 config                         |      100 |    97.22 |      100 |      100 |                   |
  default.js                    |      100 |      100 |      100 |      100 |                   |
  test.js                       |      100 |       75 |      100 |      100 |                 6 |
 src/common                     |    84.62 |    53.85 |       95 |    86.52 |                   |
  helper.js                     |    69.23 |       50 |    85.71 |       75 | 18,91,92,93,95,96 |
  logger.js                     |    90.77 |       55 |      100 |    90.77 |31,55,60,84,98,118 |
 src/services                   |    89.32 |    78.85 |      100 |    89.11 |                   |
  ReviewProcessorService.js     |    94.74 |       85 |      100 |    94.59 |             66,67 |
  SubmissionProcessorService.js |    86.15 |       75 |      100 |    85.94 |... 20,126,130,140 |
 test/unit                      |    91.89 |       75 |      100 |    91.86 |                   |
  review.processor.test.js      |    91.87 |       70 |      100 |     91.8 |... 54,169,183,194 |
  submission.processor.test.js  |    91.91 |    83.33 |      100 |    91.91 |... 64,178,191,202 |
--------------------------------|----------|----------|----------|----------|-------------------|



## E2E test Coverage

  136 passing (6m)

--------------------------------|----------|----------|----------|----------|-------------------|
File                            |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
--------------------------------|----------|----------|----------|----------|-------------------|
All files                       |    94.82 |    79.33 |     96.2 |    95.11 |                   |
 config                         |      100 |    97.22 |      100 |      100 |                   |
  default.js                    |      100 |      100 |      100 |      100 |                   |
  test.js                       |      100 |       75 |      100 |      100 |                 6 |
 src                            |    93.88 |    71.43 |       90 |    93.75 |                   |
  app.js                        |    93.75 |    71.43 |       90 |    93.62 |          49,61,86 |
  bootstrap.js                  |      100 |      100 |      100 |      100 |                   |
 src/common                     |    84.62 |    61.54 |       95 |    86.52 |                   |
  helper.js                     |    69.23 |       50 |    85.71 |       75 | 18,91,92,93,95,96 |
  logger.js                     |    90.77 |       65 |      100 |    90.77 |31,55,60,84,98,118 |
 src/services                   |    89.32 |    78.85 |      100 |    89.11 |                   |
  ReviewProcessorService.js     |    94.74 |       85 |      100 |    94.59 |             66,67 |
  SubmissionProcessorService.js |    86.15 |       75 |      100 |    85.94 |... 20,126,130,140 |
 test/e2e                       |     99.4 |    77.27 |    97.62 |     99.4 |                   |
  review.processor.test.js      |    99.27 |       75 |      100 |    99.26 |                32 |
  submission.processor.test.js  |    99.49 |       80 |    95.83 |    99.49 |                49 |
--------------------------------|----------|----------|----------|----------|-------------------|


