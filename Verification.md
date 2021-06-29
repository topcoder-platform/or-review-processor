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
- start kafka-console-producer to write messages to `submission.notification.aggregate` topic:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.aggregate`
- write message:
  `{ "topic": "submission.notification.aggregate", "originator": "or-app", "timestamp": "2019-02-25T00:00:00", "mime-type": "application/json", "payload": { "originalTopic": "submission.notification.create", "resource": "submission", "id": "104366f8-f46b-45db-a971-11bc69e6c8ff", "type": "Contest Submission", "url": "https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip", "memberId": 8547899, "challengeId": 30049360, "created": "2019-04-02T06:59:29.785Z", "updated": "2019-04-02T06:59:29.785Z", "createdBy": "TonyJ", "updatedBy": "TonyJ", "submissionPhaseId": 764644, "fileType": "zip", "isFileSubmission": false } }`
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

- the kafka-console-consumer listening to topic `avscan.action.scan` should show:
```
{"topic":"avscan.action.scan","originator":"tc-scorecard-processor","timestamp":"2019-04-07T21:41:52.713Z","mime-type":"application/json","payload":{"status":"unscanned","submissionId":"104366f8-f46b-45db-a971-11bc69e6c8ff","url":"https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip","fileName":"30054740-8547899-SUBMISSION_ZIP-1554188341581.zip"}}
```

- the kafka-console-consumer listening to topic `or.action.review` should show:
```
{"topic":"or.action.review","originator":"tc-scorecard-processor","timestamp":"2019-04-07T21:41:52.729Z","mime-type":"application/json","payload":{"resource":"submission","id":"104366f8-f46b-45db-a971-11bc69e6c8ff","type":"Contest Submission","url":"https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip","memberId":8547899,"challengeId":30049360,"created":"2019-04-02T06:59:29.785Z","updated":"2019-04-02T06:59:29.785Z","createdBy":"TonyJ","updatedBy":"TonyJ","submissionPhaseId":764644,"fileType":"zip","isFileSubmission":false,"eventType":"UPDATE"}}
```

## Unit test Coverage

  129 passing (1s)

File                            |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
--------------------------------|----------|----------|----------|----------|-------------------
All files                       |    91.63 |    79.63 |      100 |    91.46 |
 config                         |      100 |    96.67 |      100 |      100 |
  default.js                    |      100 |      100 |      100 |      100 |
  test.js                       |      100 |       50 |      100 |      100 |                 6
 src/common                     |    92.13 |    57.69 |      100 |    91.95 |
  helper.js                     |    95.83 |    66.67 |      100 |    95.45 |                18
  logger.js                     |    90.77 |       55 |      100 |    90.77 |31,55,60,84,98,118
 src/services                   |    91.07 |    80.77 |      100 |    90.91 |
  ReviewProcessorService.js     |    97.87 |       90 |      100 |    97.83 |                72
  SubmissionProcessorService.js |    86.15 |       75 |      100 |    85.94 |... 20,126,130,140


## E2E test Coverage

  136 passing (5m)

File                            |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
--------------------------------|----------|----------|----------|----------|-------------------
All files                       |    92.06 |    80.33 |    97.14 |     91.9 |
 config                         |      100 |    96.67 |      100 |      100 |
  default.js                    |      100 |      100 |      100 |      100 |
  test.js                       |      100 |       50 |      100 |      100 |                 6
 src                            |    93.88 |    71.43 |       90 |    93.75 |
  app.js                        |    93.75 |    71.43 |       90 |    93.62 |          49,61,86
  bootstrap.js                  |      100 |      100 |      100 |      100 |
 src/common                     |    92.13 |    65.38 |      100 |    91.95 |
  helper.js                     |    95.83 |    66.67 |      100 |    95.45 |                18
  logger.js                     |    90.77 |       65 |      100 |    90.77 |31,55,60,84,98,118
 src/services                   |    91.07 |    80.77 |      100 |    90.91 |
  ReviewProcessorService.js     |    97.87 |       90 |      100 |    97.83 |                72
  SubmissionProcessorService.js |    86.15 |       75 |      100 |    85.94 |... 20,126,130,140
