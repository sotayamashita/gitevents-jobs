var debug = require('debug')('gitevents-newJobs');
var yamlFront = require('yaml-front-matter');
var moment = require('moment');
var parser = require('markdown-parse');
var S = require('string');
var GitHubApi = require('github');
var express = require('express');
var job = require('./lib/job');
var jwt = require('express-jwt');
var request = require('request');
var rollbar = require('rollbar');
var router = express.Router();
var config;
var enabled = false;
var jwtCheck;

var github = new GitHubApi({
  version: '3.0.0',
  debug: true,
  protocol: 'https',
  timeout: 5000,
  headers: {
    'user-agent': 'gitevents-jobs'
  }
});

var githubInternal = new GitHubApi({
  version: '3.0.0',
  debug: true,
  protocol: 'https',
  timeout: 5000,
  headers: {
    'user-agent': 'gitevents-jobs'
  }
});

router.init = function(cfg) {
  debug('jobs');

  config = cfg;

  if (config.rollbar) {
    rollbar.init(config.rollbar);
  }

  if (config.plugins.auth && config.plugins.auth.enabled) {
    jwtCheck = jwt({
      secret: new Buffer(config.plugins.auth.secret, 'base64'),
      audience: config.plugins.auth.audience
    });

    enabled = config.plugins.auth.enabled;
    router.use('/jobs', jwtCheck);
  }

  router.post('/jobs', function(req, res) {
    debug('/post');

    request({
      'method': 'POST',
      'url': req.user.iss + 'tokeninfo',
      'headers': {
        'Content-Type': 'application/json'
      },
      'body': {
        id_token: req.headers.authorization.split(' ')[1]
      },
      'json': true
    }, function(error, response, user) {
      if (!error && response.statusCode == 200) {
        github.authenticate({
          type: 'oauth',
          token: user.identities[0].access_token
        });

        githubInternal.authenticate({
          type: 'oauth',
          token: config.github.token
        });

        job.prepareJob(req.body, req.headers, config, githubInternal)
          .then(function(newJob) {
            return job.createInternalIssue(newJob, config, githubInternal);
          }).then(function(newJob) {
            return job.createIssue(newJob, config, githubInternal);
          }).then(function() {
            res.status(200).send();
          }).catch(function(error) {
            console.log(error);
            if (config.rollbar) {
              rollbar.handleError(error);
            }
            res.status(500).send();
          });
      }
    });
  });
};

module.exports = router;
