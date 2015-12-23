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
var toMarkdown = require('to-markdown');
var router = express.Router();
var config;
var enabled = false;
var jwtCheck;

var github = new GitHubApi({
  version: '3.0.0',
  debug: false,
  protocol: 'https',
  timeout: 5000,
  headers: {
    'user-agent': 'GitEvents-Jobs'
  }
});

var githubInternal = new GitHubApi({
  version: '3.0.0',
  debug: false,
  protocol: 'https',
  timeout: 5000,
  headers: {
    'user-agent': 'GitEvents-Jobs'
  }
});

router.init = function(cfg) {
  debug('jobs');

  config = cfg;

  if (config.plugins.auth && config.plugins.auth.enabled) {
    jwtCheck = jwt({
      secret: config.plugins.auth.secret,
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
        github.user.get({}, function(error, user) {
          console.log(error);
          console.log(user);
        });
      }
    });

    //
    // githubInternal.authenticate({
    //   type: 'oauth',
    //   token: config.github.token
    // });
    //

    // var newJob = {
    //   title: req.body.title,
    //   description: req.body.description,
    //   email: req.body.email,
    //   company: {
    //     url: req.body.url,
    //     name: req.body.companyName
    //   },
    //   tier: req.body.tier.split('-')[2]
    // };
    //
    // if (req.headers['x-stripe-token']) {
    //   newJob.billing = JSON.parse(req.headers['x-stripe-token']);
    //   if (req.body.billingVat) {
    //     newJob.billing.vatId = req.body.billingVat;
    //   }
    // }
    //
    // var body = '<h3>Job Description</h3>';
    // body += newJob.description;
    //
    // if (req.body.skillsAndRequirements) {
    //   newJob.skillsAndRequirements = req.body.skillsAndRequirements;
    //   body += '<br /><br /><h3>Skills & Requirements</h3>';
    //   body += newJob.skillsAndRequirements;
    // }
    //
    // if (req.body.about) {
    //   newJob.company.about = req.body.about;
    //   body += '<br /><br /><h3>About ' + newJob.company.name;
    //   body += newJob.company.about;
    // }
    //
    // if (req.body.companyTwitter) {
    //   newJob.company.companyTwitter = req.body.companyTwitter;
    // }
    //
    // if (req.body.allowsRemote) {
    //   newJob.allowsRemote = req.body.allowsRemote;
    // }
    //
    // if (req.body.offersRelocation) {
    //   newJob.offersRelocation = req.body.offersRelocation;
    // }
    //
    // if (req.body.JoelTests) {
    //   newJob.joelTests = req.body.JoelTests;
    // }
    //
    // if (!newJob.email || !newJob.title || !newJob.description || !newJob.company || !newJob.company.name) {
    //   res.status(400).send();
    // } else {
    //   newJob.markdown = toMarkdown(body, {
    //     gfm: true
    //   });

    // job(newJob, config, github, githubInternal)
    //   .then(function() {
    //     res.status(200).send();
    //   })
    //   .catch(function(error) {
    //     console.log(error);
    //     res.status(500).send();
    //   });
    // }
  });
};

module.exports = router;
