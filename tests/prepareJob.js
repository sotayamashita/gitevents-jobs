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

var requestHeader = {
  host: '127.0.0.1:5133',
  accept: '*/*',
  authorization: 'Bearer Oy3',
  'accept-language': 'en-us',
  'accept-encoding': 'gzip, deflate',
  'content-type': 'application/x-www-form-urlencoded',
  origin: 'http://localhost:3000',
  'content-length': '353',
  connection: 'keep-alive',
  'user-agent': 'Master Splinter',
  dnt: '1'
};

test('prepareJob function output type', assert => {
  nock('https://api.github.com:443', {
      'encodedQueryParams': true
    })
    .get('/user')
    .query({
      'access_token': '123abc'
    })
    .reply(200, user);

  const actual = job.prepareJob() instanceof Promise;
  const expected = true;

  assert.equal(actual, expected, 'job.prepareJob() should return a Promise.');

  assert.end();
});

test('Compose a job object from job form input', assert => {
  nock('https://api.github.com:443', {
      'encodedQueryParams': true
    })
    .get('/user')
    .query({
      'access_token': '123abc'
    })
    .reply(200, user);

  var validJob = require('./data/valid_job_request');

  const expected = {
    'title': 'JavaScript Ninja',
    'description': '<p>If you’re a smart, talented individual looking for a fun, fast-paced, and stimulating work environment, where your contributions can (and will) make a difference, then TMNT is the place for you.</p>',
    'email': 'ninja@tmnt.com',
    'company': {
      'url': 'teenagemutantninjaturtles.com',
      'name': 'Teenage Mutant Ninja Turtles',
      'about': '<p>The Teenage Mutant Ninja Turtles (often shortened to TMNT or Ninja Turtles) are four teenage anthropomorphic turtles, named after four Renaissance Italian artists, who were trained by their anthropomorphic rat sensei in the art of JavaScript-jutsu. From their home in sewers of New York City, they battle petty Java, Ruby and PHP developers while attempting to remain hidden from society.</p>',
      'twitter': 'TMNT'
    },
    'user': {
      'login': 'GiteventsTests',
      'avatar_url': 'https://avatars.githubusercontent.com/u/1?v=3'
    },
    'tier': 'free',
    'id': '20151227-teenage-mutant-ninja-turtles-javascript-ninja',
    'skillsAndRequirements': '<p><ul><li>You have a hacker\'s spirit and an engineer\'s discipline.</li><li>You\'re comfortable banging out code on the fly as you rapid-prototype that latest cool idea you have.</li><li>You treat JavaScript like a real language.</li><li>You know how to leverage most of what the browser offers, including the latest implementations of HTML5 and CSS 3, to create fast, scalable, complex web applications.</li></ul></p>',
    'allowsRemote': 'true',
    'offersRelocation': 'true',
    'markdown': '### Job Description\n\nIf you’re a smart, talented individual looking for a fun, fast-paced, and stimulating work environment, where your contributions can (and will) make a difference, then TMNT is the place for you.\n\n### Skills & Requirements\n\n*   You have a hacker\'s spirit and an engineer\'s discipline.\n*   You\'re comfortable banging out code on the fly as you rapid-prototype that latest cool idea you have.\n*   You treat JavaScript like a real language.\n*   You know how to leverage most of what the browser offers, including the latest implementations of HTML5 and CSS 3, to create fast, scalable, complex web applications.\n\n### About Teenage Mutant Ninja Turtles\n\nThe Teenage Mutant Ninja Turtles (often shortened to TMNT or Ninja Turtles) are four teenage anthropomorphic turtles, named after four Renaissance Italian artists, who were trained by their anthropomorphic rat sensei in the art of JavaScript-jutsu. From their home in sewers of New York City, they battle petty Java, Ruby and PHP developers while attempting to remain hidden from society.'
  };

  job.prepareJob(validJob, requestHeader, config, github)
    .then((actual) => {

      assert.equal(actual.title, expected.title, 'title should match');
      assert.equal(actual.email, expected.email, 'email should match');
      assert.equal(actual.tier, expected.tier, 'tier should match');
      assert.equal(actual.description, expected.description, 'description should match');
      assert.equal(actual.markdown, expected.markdown, 'markdown should match');

      assert.end();
    });
});

test('Fail if the job title is missing', assert => {
  nock('https://api.github.com:443', {
      'encodedQueryParams': true
    })
    .get('/user')
    .query({
      'access_token': '123abc'
    })
    .reply(200, user);

  var validJob = require('./data/valid_job_request');
  validJob.title = '';
  const expected = new Error('missing_information');

  job.prepareJob(validJob, requestHeader, config, github)
    .catch((error) => {
      assert.equal(error.name, expected.name, 'should fail with Error');
      assert.equal(error.message, expected.message, 'should fail with missing information');
      assert.end();
    });
});
