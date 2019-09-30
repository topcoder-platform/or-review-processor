/*
 * Test data to be used in tests
 */

const avScanTopic = 'avscan.action.scan'

const reviewActionTopic = 'or.action.review'

const testTopics = {
  'create': {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.score', 'payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId', 'payload.eventType'],
    integerFields: ['payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId'],
    stringFields: ['payload.eventType'],
    testMessage: {
      topic: 'submission.notification.score',
      originator: 'or-app',
      timestamp: '2019-02-25T00:00:00',
      'mime-type': 'application/json',
      payload: {
        score: 90,
        submissionId: 206743,
        reviewId: 390087,
        scorecardId: 300001610,
        reviewerId: 151743,
        reviewTypeId: 2,
        eventType: 'CREATE'
      }
    }
  },
  'update': {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.score', 'payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId', 'payload.userId', 'payload.eventType'],
    integerFields: ['payload.submissionId', 'payload.reviewId', 'payload.scorecardId',
      'payload.reviewerId', 'payload.reviewTypeId'],
    stringFields: ['payload.userId', 'payload.eventType'],
    testMessage: {
      topic: 'submission.notification.score',
      originator: 'or-app',
      timestamp: '2019-02-25T00:00:00',
      'mime-type': 'application/json',
      payload: {
        score: 95,
        submissionId: 206743,
        reviewId: 390087,
        scorecardId: 300001610,
        reviewerId: 151743,
        reviewTypeId: 2,
        userId: '8547899',
        eventType: 'UPDATE'
      }
    }
  },
  'submission.notification.create': {
    operation: 'create',
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.resource', 'payload.id', 'payload.type', 'payload.url',
      'payload.memberId', 'payload.challengeId', 'payload.submissionPhaseId', 'payload.fileType',
      'payload.isFileSubmission'],
    integerFields: ['payload.memberId', 'payload.challengeId', 'payload.submissionPhaseId'],
    stringFields: ['originator', 'mime-type', 'payload.resource', 'payload.id', 'payload.type',
      'payload.url', 'payload.createdBy', 'payload.updatedBy', 'payload.fileType'],
    dateFields: ['timestamp', 'payload.created', 'payload.updated'],
    booleanFields: ['payload.isFileSubmission'],
    testMessage: {
      topic: 'submission.notification.create',
      originator: 'or-app',
      timestamp: '2019-02-25T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'submission',
        id: '104366f8-f46b-45db-a971-11bc69e6c8ff',
        type: 'Contest Submission',
        url: 'https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip?query=test',
        memberId: 12345,
        challengeId: 30049360,
        created: '2019-04-02T06:59:29.785Z',
        updated: '2019-04-03T06:59:29.785Z',
        createdBy: 'user1',
        updatedBy: 'user2',
        submissionPhaseId: 123123,
        fileType: 'zip',
        isFileSubmission: false
      }
    }
  },
  'submission.notification.update': {
    operation: 'update',
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type',
      'payload.resource', 'payload.id', 'payload.type', 'payload.url',
      'payload.memberId', 'payload.challengeId', 'payload.submissionPhaseId', 'payload.fileType',
      'payload.isFileSubmission'],
    integerFields: ['payload.memberId', 'payload.challengeId', 'payload.submissionPhaseId'],
    stringFields: ['originator', 'mime-type', 'payload.resource', 'payload.id', 'payload.type',
      'payload.url', 'payload.createdBy', 'payload.updatedBy', 'payload.fileType'],
    dateFields: ['timestamp', 'payload.created', 'payload.updated'],
    booleanFields: ['payload.isFileSubmission'],
    testMessage: {
      topic: 'submission.notification.update',
      originator: 'or-app',
      timestamp: '2019-02-25T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'submission',
        id: '104366f8-f46b-45db-a971-11bc69e6c8ff',
        type: 'Contest Submission',
        url: 'https://s3.amazonaws.com/topcoder-dev-submissions-dmz/30054740-8547899-SUBMISSION_ZIP-1554188341581.zip#testing',
        memberId: 121212,
        challengeId: 30049360,
        created: '2019-04-02T06:59:29.785Z',
        updated: '2019-04-03T06:59:29.785Z',
        createdBy: 'user3',
        updatedBy: 'user4',
        submissionPhaseId: 345345,
        fileType: 'zip',
        isFileSubmission: true
      }
    }
  }
}

const challenges = {
  30049360: {
    'id': '4da4e65e:16cb911536f:4771',
    'result': {
      'success': true,
      'status': 200,
      'metadata': null,
      'content': {
        'subTrack': 'CODE',
        'challengeTitle': 'Code Dev-Env Test',
        'challengeId': 30049360,
        'projectId': 7572,
        'forumId': 28457,
        'detailedRequirements': '<p>testing</p>\n',
        'reviewScorecardId': 30001610,
        'numberOfCheckpointsPrizes': 0,
        'postingDate': '2015-07-27T13:00:00.000Z',
        'registrationEndDate': '2019-12-02T14:00:00.000Z',
        'submissionEndDate': '2019-12-02T14:00:00.000Z',
        'reviewType': 'COMMUNITY',
        'forumLink': 'https://apps.topcoder.com/forums/?module=Category&categoryID=28457',
        'appealsEndDate': '2019-12-06T02:00:00.000Z',
        'currentStatus': 'Active',
        'challengeCommunity': 'develop',
        'directUrl': 'https://www.topcoder.com/direct/contest/detail.action?projectId=30049360',
        'prizes': [
          350.0,
          150.0
        ],
        'terms': [
          {
            'termsOfUseId': 20704,
            'role': 'Primary Screener',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 20704,
            'role': 'Reviewer',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 21193,
            'role': 'Submitter',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Terms for TopCoder Competitions v2.1',
            'url': ''
          },
          {
            'termsOfUseId': 20704,
            'role': 'Aggregator',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 20704,
            'role': 'Specification Reviewer',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 20704,
            'role': 'Final Reviewer',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 20794,
            'role': 'Manager',
            'agreeabilityType': 'Non-electronically-agreeable',
            'title': 'Approved OR Managers - TopCoder Technical Team',
            'url': 'http://www.topcoder.com'
          },
          {
            'termsOfUseId': 20893,
            'role': 'Copilot',
            'agreeabilityType': 'Non-electronically-agreeable',
            'title': 'TopCoder Master Services Agreement',
            'url': 'http://www.topcoder.com/wiki/download/attachments/35129137/Member+Master+Agreement+v0020409.pdf'
          }
        ],
        'finalSubmissionGuidelines': '<p>testing</p>\n',
        'technologies': [
          '.NET'
        ],
        'platforms': [
          'Android'
        ],
        'currentPhaseName': 'Registration',
        'currentPhaseRemainingTime': 5962969,
        'currentPhaseEndDate': '2019-12-02T14:00:00.000Z',
        'registrants': [
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2015-10-27T17:20:32.000Z',
            'submissionDate': '2018-08-24T19:51:34.000Z',
            'handle': 'TonyJ'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2015-10-29T00:38:21.000Z',
            'handle': 'Ghostar'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2015-10-29T00:42:04.000Z',
            'submissionDate': '2015-10-29T04:21:18.000Z',
            'handle': 'hohosky'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2015-10-29T01:46:16.000Z',
            'handle': 'DhananjayKumar1'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2015-10-29T04:55:29.000Z',
            'submissionDate': '2015-10-29T05:06:51.000Z',
            'handle': 'dplass'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2015-10-29T05:09:02.000Z',
            'submissionDate': '2015-10-29T06:20:36.000Z',
            'handle': 'dmwright'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2015-07-30T23:37:34.000Z',
            'submissionDate': '2015-10-29T00:01:36.000Z',
            'handle': 'albertwang'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2017-10-07T14:03:34.000Z',
            'submissionDate': '2017-11-28T20:28:56.000Z',
            'handle': 'dan_developer'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2017-10-13T17:57:34.000Z',
            'handle': 'tjefts_block15'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2017-10-13T17:58:56.000Z',
            'handle': 'tjefts_block20'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2017-11-11T20:53:27.000Z',
            'submissionDate': '2018-03-15T06:39:40.033Z',
            'handle': 'amy_admin'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2018-03-11T09:02:55.000Z',
            'handle': 'kevinkid'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2018-03-23T08:17:30.000Z',
            'handle': 'sushil1000'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2018-05-24T21:19:45.000Z',
            'handle': 'bop_t26'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2018-08-20T23:39:04.000Z',
            'handle': 'hoho123456'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2018-10-22T14:48:10.000Z',
            'handle': 'TestAccount1'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-04-08T15:14:39.000Z',
            'handle': 'huanner'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-05-13T19:02:21.238Z',
            'handle': 'lazybaer'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-08-01T17:29:50.000Z',
            'handle': 'callmekatootie'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #555555',
            'rating': 1,
            'registrationDate': '2019-08-03T06:36:25.000Z',
            'handle': 'easteregg'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-08-03T09:31:02.000Z',
            'handle': 'FireIce'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-08-26T12:22:53.000Z',
            'handle': 'jcori'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-09-20T10:41:52.000Z',
            'handle': 'mess'
          }
        ],
        'phases': [
          {
            'duration': 137293200000,
            'actualStartTime': '2015-07-27T13:00:00.000Z',
            'scheduledStartTime': '2015-07-27T13:00:00.000Z',
            'phaseId': 733195,
            'scheduledEndTime': '2019-12-02T14:00:00.000Z',
            'fixedStartTime': '2015-07-27T13:00:00.000Z',
            'type': 'Registration',
            'status': 'Open'
          },
          {
            'duration': 137292900000,
            'scheduledStartTime': '2015-07-27T13:05:00.000Z',
            'phaseId': 733196,
            'scheduledEndTime': '2019-12-02T14:00:00.000Z',
            'type': 'Submission',
            'status': 'Closed'
          },
          {
            'duration': 172800000,
            'scheduledStartTime': '2019-12-02T14:00:00.000Z',
            'phaseId': 733197,
            'scheduledEndTime': '2019-12-04T14:00:00.000Z',
            'type': 'Review',
            'status': 'Scheduled'
          },
          {
            'duration': 86400000,
            'scheduledStartTime': '2019-12-04T14:00:00.000Z',
            'phaseId': 733198,
            'scheduledEndTime': '2019-12-05T14:00:00.000Z',
            'type': 'Appeals',
            'status': 'Scheduled'
          },
          {
            'duration': 43200000,
            'scheduledStartTime': '2019-12-05T14:00:00.000Z',
            'phaseId': 733199,
            'scheduledEndTime': '2019-12-06T02:00:00.000Z',
            'type': 'Appeals Response',
            'status': 'Scheduled'
          }
        ],
        'submissions': [
          {
            'submitter': 'albertwang',
            'submitterId': 10336829,
            'submissions': [
              {
                'submissionId': 509262,
                'submissionStatus': 'Active',
                'submissionTime': '2015-10-29T00:01:36.000Z'
              }
            ]
          },
          {
            'submitter': 'hohosky',
            'submitterId': 16096823,
            'submissions': [
              {
                'submissionId': 509263,
                'submissionStatus': 'Active',
                'submissionTime': '2015-10-29T04:21:18.000Z'
              }
            ]
          },
          {
            'submitter': 'dplass',
            'submitterId': 251184,
            'submissions': [
              {
                'submissionId': 509265,
                'submissionStatus': 'Active',
                'submissionTime': '2015-10-29T05:06:51.000Z'
              }
            ]
          },
          {
            'submitter': 'dmwright',
            'submitterId': 114853,
            'submissions': [
              {
                'submissionId': 509267,
                'submissionStatus': 'Active',
                'submissionTime': '2015-10-29T06:20:36.000Z'
              }
            ]
          },
          {
            'submitter': 'TonyJ',
            'submitterId': 8547899,
            'submissions': [
              {
                'submissionId': 205459,
                'submissionStatus': 'Active',
                'submissionTime': '2018-08-24T19:51:34.000Z'
              }
            ]
          },
          {
            'submitter': 'amy_admin',
            'submitterId': 40153455,
            'submissions': [
              {
                'submissionId': 204922,
                'submissionStatus': 'Active',
                'submissionTime': '2018-03-15T06:39:40.033Z'
              }
            ]
          },
          {
            'submitter': 'dan_developer',
            'submitterId': 40152905,
            'submissions': [
              {
                'submissionId': 509401,
                'submissionStatus': 'Active',
                'submissionTime': '2017-11-28T20:28:56.000Z'
              }
            ]
          }
        ],
        'checkpoints': [],
        'numberOfRegistrants': 23,
        'numberOfSubmissions': 7,
        'numberOfSubmitters': 7
      }
    },
    'version': 'v3'
  },
  30054674: {
    'id': '4da4e65e:16cb911536f:4774',
    'result': {
      'success': true,
      'status': 200,
      'metadata': null,
      'content': {
        'subTrack': 'CODE',
        'challengeTitle': 'Test for  submission review app api 12345',
        'challengeId': 30054674,
        'projectId': 7817,
        'forumId': 32818,
        'detailedRequirements': '<p><em>[This contest specification will be made available to all competitors for an Assembly competition. It is intended to give the competitors (and reviewers) all the necessary information and detailed instructions to understand what is expected for the Assembly competition.</em></p>\n\n<p><span style="color:rgb(0, 112, 192)"><strong><em>This specification should not include any company specific information or proprietary information because it will be available to users who have not signed confidentiality assignments.</em></strong></span></p>\n\n<p><span style="color:rgb(0, 112, 192)"><em>This specification will be reviewed internally by TopCoder to verify the following points:</em></span></p>\n\n<ul>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Is the spec clear? Is it attractive to competitors? Is there anything that could be done to clarify or improve the specification? &nbsp;&nbsp;</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Are the requirements for the competition clear in detail and scope?</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Are the deliverables for the competition clear in detail and scope? &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Is the design clear - are there any details that are missing that competitors will need to complete in this project?</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Is the timeline appropriate?</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Is the prize structure appropriate?</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Overall the specification is appropriate for production?</em></span></li>\n</ul>\n\n<p><span style="color:rgb(0, 112, 192)"><em>The Architect will be responsible for this specification. However, there are numerous sections that will be completed by the Copilot or the Project Manager.]</em></span></p>\n\n<h2><span style="color:rgb(255, 0, 0)">Project Overview</span></h2>\n\n<p><strong><span style="color:rgb(164, 31, 172)">[Provide an overview of the overall application the Assembly competition is implementing.]</span></strong></p>\n\n<p><span style="font-size:12px">EXAMPLE:</span></p>\n\n<p><span style="font-size:12px">The Sales IM tool is an application that will create a web based instant messaging system. &nbsp;The system &nbsp; &nbsp;will be used installed and run on a company&#39;s web site. The tool will allow potential clients of the company to ask questions and chat with the company.</span></p>\n\n<h2><span style="color:rgb(255, 0, 0)">Competition Task Overview</span></h2>\n\n<p><strong>[Provide an overview of the pieces of the application that the Assembly competition is implementing.]</strong></p>\n\n<p><span style="font-size:12px">EXAMPLE:<br />\nHTML prototype has been converted to JSP pages with the correct flows. The majority of the application logic has been developed inside the components. The main tasks will involve:</span></p>\n\n<ul>\n\t<li><span style="font-size:12px">Configuration of components</span></li>\n\t<li><span style="font-size:12px">Writing any necessary AJAX and JSP code</span></li>\n\t<li><span style="font-size:12px">Writing servlet and action classes and hooking in the necessary components</span></li>\n\t<li><span style="font-size:12px">Writing unit tests</span></li>\n\t<li><span style="font-size:12px">Providing directions for configuration and deployment</span></li>\n</ul>\n\n<p><span style="font-size:12px"><strong><span style="color:rgb(164, 31, 172)">[You should break out 2.X points if there are any complicated instructions to the members.]</span></strong></span></p>\n\n<h3><span style="color:rgb(255, 0, 0)">Testing</span></h3>\n\n<p><strong><span style="color:rgb(164, 31, 172)">[Provide Testing Requirements. This section should include any testing requirements (unit tests) that will help review the application.]</span></strong></p>\n\n<p><span style="font-size:12px">EXAMPLE:<br />\nUnit test are only needed for NASWorker.cs class.</span></p>\n\n<p><span style="font-size:12px">You need to provide manual demos to verify your implementation.</span></p>\n\n<h2><span style="color:rgb(255, 0, 0)">Technology Overview</span></h2>\n\n<p><strong><span style="color:rgb(164, 31, 172)">[List the relevant technologies for the project. This is intended to help the interested competitor determine if they are able to compete on the project. Include any details on VM/etc. in this section.]</span></strong></p>\n\n<p><span style="font-size:12px">EXAMPLE:<br />\nThe working environment requirement details for this application are outlined in the Application Requirements Specification. An overview of the environment requirements are listed below:</span></p>\n\n<ul>\n\t<li><span style="font-size:12px">Java 1.5</span></li>\n\t<li><span style="font-size:12px">Red Hat Linux</span></li>\n\t<li><span style="font-size:12px">JBoss 4.0.2</span></li>\n\t<li><span style="font-size:12px">Tomcat 5.5</span></li>\n\t<li><span style="font-size:12px">Struts 1.3.5</span></li>\n\t<li><span style="font-size:12px">Informix 10.0</span></li>\n\t<li><span style="font-size:12px">AJAX</span></li>\n</ul>\n\n<h2><span style="color:rgb(255, 0, 0)">Documentation Provided</span></h2>\n\n<p><strong><span style="color:rgb(164, 31, 172)">[The majority of the documentation deliverables should be consistent across all applications. However, document any additional information that will be provided for this project and remove any documents in this list that are not applicable.]</span></strong></p>\n\n<p>Documentation and Applications that will be provided to registered members:</p>\n<strong>Document Name</strong><strong>Document Description &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</strong><br />\n<span style="color:rgb(164, 31, 145)">[Deliverable Information]</span><span style="color:rgb(164, 31, 145)">[Deliverable Information]?</span><br />\nRequirements Documentation<br />\n<br />\nDatabase Schema<br />\n<br />\nHTML Prototype<br />\n<br />\nJSP Converted Prototype<br />\n<br />\nSample Data\n<h2><strong><span style="color:rgb(255, 0, 0)">Project Dependencies</span></strong></h2>\n\n<p><span style="font-size:12px">Custom / New Generic Components</span></p>\n\n<p><span style="font-size:12px"><strong><span style="color:rgb(164, 31, 172)">[List all custom and new generic components that are required for this application. &nbsp;This is useful for competitors to know where to look for component information if the component is not in the catalog yet. This is also useful for managers and architects to easily check which new components are dependent on this Assembly.</span></strong></span></p>\n\n<p><span style="font-size:12px"><strong><span style="color:rgb(164, 31, 172)">** Note that all new and custom components will need to be posted to the forums for this competition unless they are made available in the catalog prior to the start of the competition.]</span></strong></span></p>\n\n<div>&nbsp;</div>\n\n<div><strong>Component Name</strong><strong>Version</strong><strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Generic / Custom</strong><strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Component URL</strong><br />\n<br />\n<br />\n<br />\n<br />\n<br />\n<br />\n<br />\n<br />\n&nbsp;</div>\n',
        'reviewScorecardId': 30001610,
        'numberOfCheckpointsPrizes': 0,
        'postingDate': '2019-02-05T14:15:18.544Z',
        'registrationEndDate': '2019-02-06T14:16:59.418Z',
        'submissionEndDate': '2019-02-06T14:17:07.247Z',
        'reviewType': 'COMMUNITY',
        'forumLink': 'https://apps.topcoder.com/forums/?module=Category&categoryID=32818',
        'appealsEndDate': '2019-02-06T15:09:43.244Z',
        'currentStatus': 'Completed',
        'challengeCommunity': 'develop',
        'directUrl': 'https://www.topcoder.com/direct/contest/detail.action?projectId=30054674',
        'prizes': [
          1000.0,
          500.0
        ],
        'terms': [
          {
            'termsOfUseId': 20704,
            'role': 'Primary Screener',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 20704,
            'role': 'Reviewer',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 21303,
            'role': 'Submitter',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Terms for TopCoder Competitions v2.2',
            'url': ''
          },
          {
            'termsOfUseId': 20704,
            'role': 'Aggregator',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 20704,
            'role': 'Specification Reviewer',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 20704,
            'role': 'Final Reviewer',
            'agreeabilityType': 'Electronically-agreeable',
            'title': 'Standard Reviewer Terms v1.0',
            'url': ''
          },
          {
            'termsOfUseId': 20794,
            'role': 'Manager',
            'agreeabilityType': 'Non-electronically-agreeable',
            'title': 'Approved OR Managers - TopCoder Technical Team',
            'url': 'http://www.topcoder.com'
          },
          {
            'termsOfUseId': 20893,
            'role': 'Copilot',
            'agreeabilityType': 'Non-electronically-agreeable',
            'title': 'TopCoder Master Services Agreement',
            'url': 'http://www.topcoder.com/wiki/download/attachments/35129137/Member+Master+Agreement+v0020409.pdf'
          }
        ],
        'winners': [
          {
            'submitter': 'denis',
            'submissionId': 206743,
            'rank': 1,
            'submissionTime': '2019-02-05T15:58:32.000Z',
            'points': 96.25
          },
          {
            'submitter': 'lars2520',
            'submissionId': 206744,
            'rank': 2,
            'submissionTime': '2019-02-05T16:00:20.000Z',
            'points': 92.5
          }
        ],
        'finalSubmissionGuidelines': '<p><em>[This contest specification will be made available to all competitors for an Assembly competition. It is intended to give the competitors (and reviewers) all the necessary information and detailed instructions to understand what is expected for the Assembly competition.</em></p>\n\n<p><span style="color:rgb(0, 112, 192)"><strong><em>This specification should not include any company specific information or proprietary information because it will be available to users who have not signed confidentiality assignments.</em></strong></span></p>\n\n<p><span style="color:rgb(0, 112, 192)"><em>This specification will be reviewed internally by TopCoder to verify the following points:</em></span></p>\n\n<ul>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Is the spec clear? Is it attractive to competitors? Is there anything that could be done to clarify or improve the specification? &nbsp;&nbsp;</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Are the requirements for the competition clear in detail and scope?</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Are the deliverables for the competition clear in detail and scope? &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Is the design clear - are there any details that are missing that competitors will need to complete in this project?</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Is the timeline appropriate?</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Is the prize structure appropriate?</em></span></li>\n\t<li><span style="color:rgb(0, 112, 192)"><em>Overall the specification is appropriate for production?</em></span></li>\n</ul>\n\n<p><span style="color:rgb(0, 112, 192)"><em>The Architect will be responsible for this specification. However, there are numerous sections that will be completed by the Copilot or the Project Manager.]</em></span></p>\n\n<h2><strong><span style="color:#FF0000">Submission Deliverables</span></strong></h2>\n\n<p><span style="font-size:12px">A complete list of deliverables can be viewed in the TopCoder Assembly competition Tutorial at: <a href="http://apps.topcoder.com/wiki/display/tc/Assembly+Competition+Tutorials">http://apps.topcoder.com/wiki/display/tc/Assembly+Competition+Tutorials&nbsp;</a></span></p>\n\n<p><span style="font-size:12px"><span style="color:#a41f91"><strong>[Document any specific deliverables associated with this competition]</strong></span></span></p>\n\n<p><span style="font-size:12px">EXAMPLE:<br />\nBelow is an overview of the deliverables:</span></p>\n\n<ul>\n\t<li><span style="font-size:12px">Fully Implemented IM Tool functionality defined by the requirements documentation for the sections defined in the milestone sections.</span></li>\n\t<li><span style="font-size:12px">A complete and detailed deployment documented explaining how to deploy the application including configuration information.</span></li>\n\t<li><span style="font-size:12px">JUNIT Tests to verify your application successfully meets the requirements of the application.</span></li>\n\t<li><span style="font-size:12px">The Ant build script to create the war files. This can be highly variable per competition so be sure to specify necessary deliverables clearly.</span></li>\n</ul>\n\n<h2><span style="color:#FF0000"><strong>Final Submission</strong></span></h2>\n\n<p><span style="font-size:12px">For each member, the final submission should be uploaded via the challenge detail page on <a href="http://www.topcoder.com">topcoder.com</a>.</span></p>\n\n<p><span style="font-size:12px"><span style="color:#a41f91"><strong>[Add any special instructions or restrictions on submission here.]</strong></span></span></p>\n\n<h2><span style="color:#FF0000"><strong>Environment Setup</strong></span></h2>\n\n<p><span style="font-size:12px"><strong><span style="color:#a41f91">[By preparing a ready-to-use development environment, you can greatly increase the chances for a high quality submission. Try to give competitors an environment that needs minimal configuration and setup so members can focus on coding a solution rather than preparing to code one. Absolutely critical to this setup is providing valid test data. Relying on competitors to make their test data is error prone and will lead to other issues in downstream development efforts.]</span></strong></span></p>\n\n<p><strong><span style="color:#0000FF">Source code setup</span></strong></p>\n\n<p><span style="font-size:12px"><span style="color:#a41f91"><strong>[The architect should document how the source code should be set up and packaged if different from the standard used in Assemblies.]</strong></span></span></p>\n\n<p><span style="color:#0000FF"><strong>Build Setup</strong></span></p>\n\n<p><span style="font-size:12px"><strong><span style="color:#a41f91">[Document all the ant tasks that are required.]</span></strong></span></p>\n\n<p><span style="font-size:12px">The ant &#39;compile&#39; and ant &#39;build&#39; commands should be implemented to compile the source code and create the war file.</span></p>\n\n<p><span style="font-size:12px"><span style="color:#a41f91"><strong>[Add something about how you can run an ant task to clear test data]</strong></span></span></p>\n\n<p><span style="font-size:12px"><span style="color:#a41f91"><strong>[Add something about how you can run an ant task to load the lookup / sample data]</strong></span></span></p>\n\n<p><strong><span style="color:#0000FF">SVN Access</span></strong></p>\n\n<p><span style="font-size:12px"><span style="color:#a41f91"><strong>[Each member might need to be assigned SVN access. Please list all SVN branches which members need to request access to.]</strong></span></span></p>\n\n<div><strong>Repository Name</strong><strong>URL</strong><br />\nOnline Review<a href="https://coder.topcoder.com/tcs/clients/name/branches">https://coder.topcoder.com/tcs/clients/name/branches</a><br />\nStudio<a href="https://coder.topcoder.com/client/branches/name">https://coder.topcoder.com/client/branches/name</a><br />\nDatabases<a href="https://coder.topcoder.com/client/trunk">https://coder.topcoder.com/client/trunk</a></div>\n\n<h2><span style="color:#FF0000"><strong>Development Environment</strong></span></h2>\n\n<p><span style="font-size:12px"><strong><span style="color:#a41f91">[This section should document what environment software will be available to each member.</span></strong></span></p>\n\n<p><span style="font-size:12px"><strong><span style="color:#a41f91">For example:</span></strong></span></p>\n\n<ul>\n\t<li><span style="font-size:12px"><strong><span style="color:#a41f91">SVN access</span></strong></span></li>\n\t<li><span style="font-size:12px"><strong><span style="color:#a41f91">Amazon VM(s)</span></strong></span></li>\n\t<li><span style="font-size:12px"><strong><span style="color:#a41f91">VPN access</span></strong></span></li>\n</ul>\n\n<p><span style="font-size:12px"><strong><span style="color:#a41f91">Document how members will be given access / permissions]</span></strong></span></p>\n',
        'technologies': [
          'Android'
        ],
        'platforms': [
          'Android'
        ],
        'currentPhaseName': 'Stalled',
        'registrants': [
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-02-05T15:47:19.080Z',
            'submissionDate': '2019-02-05T15:58:32.000Z',
            'handle': 'denis'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-02-05T15:53:34.534Z',
            'submissionDate': '2019-02-05T16:00:20.000Z',
            'handle': 'lars2520'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-03-19T08:38:04.399Z',
            'handle': 'easteregg'
          },
          {
            'reliability': null,
            'colorStyle': 'color: #151516',
            'registrationDate': '2019-09-13T14:39:24.097Z',
            'handle': 'sachin-kumar'
          }
        ],
        'phases': [
          {
            'duration': 86400000,
            'actualStartTime': '2019-02-05T14:15:18.544Z',
            'scheduledStartTime': '2019-02-05T14:15:18.544Z',
            'phaseId': 764423,
            'scheduledEndTime': '2019-02-06T14:16:59.418Z',
            'fixedStartTime': '2019-02-05T14:00:00.000Z',
            'actualEndTime': '2019-02-06T14:16:59.418Z',
            'type': 'Registration',
            'status': 'Closed'
          },
          {
            'duration': 86100000,
            'actualStartTime': '2019-02-05T14:20:39.454Z',
            'scheduledStartTime': '2019-02-05T14:20:39.454Z',
            'phaseId': 764424,
            'scheduledEndTime': '2019-02-06T14:17:07.247Z',
            'actualEndTime': '2019-02-06T14:17:07.247Z',
            'type': 'Submission',
            'status': 'Closed'
          },
          {
            'duration': 172800000,
            'actualStartTime': '2019-02-06T14:17:14.057Z',
            'scheduledStartTime': '2019-02-06T14:17:14.057Z',
            'phaseId': 764425,
            'scheduledEndTime': '2019-02-06T14:42:50.396Z',
            'actualEndTime': '2019-02-06T14:42:50.396Z',
            'type': 'Review',
            'status': 'Closed'
          },
          {
            'duration': 86400000,
            'actualStartTime': '2019-02-06T14:42:53.338Z',
            'scheduledStartTime': '2019-02-06T14:42:53.338Z',
            'phaseId': 764426,
            'scheduledEndTime': '2019-02-06T14:48:45.275Z',
            'actualEndTime': '2019-02-06T14:48:45.275Z',
            'type': 'Appeals',
            'status': 'Closed'
          },
          {
            'duration': 43200000,
            'actualStartTime': '2019-02-06T14:48:48.059Z',
            'scheduledStartTime': '2019-02-06T14:48:48.059Z',
            'phaseId': 764427,
            'scheduledEndTime': '2019-02-06T15:09:43.244Z',
            'actualEndTime': '2019-02-06T15:09:43.244Z',
            'type': 'Appeals Response',
            'status': 'Closed'
          }
        ],
        'submissions': [
          {
            'submitter': 'denis',
            'submitterId': 251280,
            'submissions': [
              {
                'finalScore': 96.25,
                'submissionId': 206743,
                'submissionStatus': 'Active',
                'initialScore': 95,
                'placement': 1,
                'submissionTime': '2019-02-05T15:58:32.000Z'
              }
            ]
          },
          {
            'submitter': 'lars2520',
            'submitterId': 287131,
            'submissions': [
              {
                'finalScore': 92.5,
                'submissionId': 206744,
                'submissionStatus': 'Completed Without Win',
                'initialScore': 90,
                'placement': 2,
                'submissionTime': '2019-02-05T16:00:20.000Z'
              }
            ]
          }
        ],
        'checkpoints': [],
        'numberOfRegistrants': 4,
        'numberOfSubmissions': 2,
        'numberOfSubmitters': 2
      }
    },
    'version': 'v3'
  },
  89898989: {
    'id': '4da4e65e:16cb911536f:4772',
    'result': {
      'success': true,
      'status': 404,
      'metadata': null,
      'content': 'The challenge does not exists with the id:89898989'
    },
    'version': 'v3'
  }
}

const reviewTypes = [
  {
    name: 'Review',
    id: 'ff5742d6-22bf-4734-b632-add6641078be',
    isActive: true
  },
  {
    name: 'test-for-review',
    id: 'af5742d6-22bf-4734-b632-add6641078be',
    isActive: true
  }
]

const reviews = [
  {
    'legacyReviewId': 123456788,
    'score': 92.5,
    'updatedBy': 'callmekatootie',
    'reviewerId': 'c56a4180-65aa-42ec-a945-5fd21d3d26f8',
    'submissionId': 'a12a4180-65aa-42ec-a945-5fd21dec0505',
    'createdBy': 'callmekatootie',
    'created': '2019-09-24T00:37:38.537Z',
    'scoreCardId': 123456789,
    'typeId': 'c56a4180-65aa-42ec-a945-5fd21dec0503',
    'id': '9c1c080a-b54f-46c4-b87b-6218038be765',
    'updated': '2019-09-24T00:37:38.537Z',
    'status': 'queued'
  },
  {
    'score': 100,
    'updatedBy': 'maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients',
    'reviewerId': '7b3e99d2-cc1f-43d8-811d-350b48267589',
    'submissionId': 'b91a0ca3-3988-4899-bab4-c789f22def39',
    'createdBy': 'maE2maBSv9fRVHjSlC31LFZSq6VhhZqC@clients',
    'created': '2019-09-23T17:25:04.255Z',
    'scoreCardId': 30001850,
    'typeId': '68c5a381-c8ab-48af-92a7-7a869a4ee6c3',
    'id': '41f30ab2-726f-4f4c-a922-c46eff0d7256',
    'updated': '2019-09-23T17:25:04.255Z',
    'status': 'completed'
  }
]

module.exports = {
  avScanTopic,
  reviewActionTopic,
  testTopics,
  challenges,
  reviewTypes,
  reviews
}
