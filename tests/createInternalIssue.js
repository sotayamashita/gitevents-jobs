var config = require('../common/config');
var job = require('../lib/job');
var test = require('tape');
var GitHubApi = require('github');
var nock = require('nock');

// nock.recorder.rec();

var user = require('./github/user');
var github = new GitHubApi({
  version: '3.0.0',
  debug: false,
  protocol: 'https',
  timeout: 5000,
  headers: {
    'user-agent': 'gitevents-test'
  }
});

github.authenticate({
  type: 'oauth',
  token: config.github.token
});

test('createInternalIssue() function output type', assert => {
  const actual = job.createInternalIssue() instanceof Promise;
  const expected = true;

  assert.equal(actual, expected, 'job.createInternalIssue() should return a Promise.');

  assert.end();
});

test('createInternalIssue() should create a new GitHub issue', assert => {
  var validJob = require('./data/valid_job_response');
  const expected = require('./github/createInternalIssueResponse');

  nock('https://api.github.com:443', {
      'encodedQueryParams': true
    })
    .filteringRequestBody(function(body) {
      return '*';
    })
    .get('/user')
    .query({
      'access_token': '123abc'
    })
    .reply(200, user)
    .put('/repos/gitevents/playground/contents/jobs%2F20151227-teenage-mutant-ninja-turtles-javascript-ninja', '*')
    .query({
      'access_token': '123abc'
    })
    .reply(201, require('./github/createFileResponse'))
    .post('/repos/gitevents/playground/issues')
    .query({
      'access_token': '123abc'
    })
    .reply(201, require('./github/createInternalIssueResponse'));

  job.createInternalIssue(validJob, config, github)
    .then((actual) => {
      assert.equal(actual.state, expected.state, 'issue state should be open');
      assert.equal(actual.title, expected.title, 'title should match');
      assert.equal(actual.id, expected.id, 'id should match');
      assert.end();
    })
    .catch((error) => {
      console.log(error);
      assert.equal(error, null, 'no error should be caught.');
      assert.end();
    });
});
