var debug = require('debug')('gitevents-jobs:job');
var moment = require('moment');
var stripe = require('stripe');
var toMarkdown = require('to-markdown');
var S = require('string');

var createInternalIssue = function createInternalIssue(newJob, config, github) {
  debug('createInternalIssue()');
  return new Promise(function(resolve, reject) {
    var file = new Buffer(JSON.stringify(newJob, null, 2)).toString('base64');

    github.repos.createFile({
      user: config.github.org,
      repo: config.github.repos.planning,
      path: config.paths.jobs + newJob.id,
      content: file,
      message: 'Created ' + newJob.id + ' by ' + newJob.company.name
    }, function(error, commit) {
      debug('GitHub:createFile()');

      if (error) {
        debug(error);
        return reject(error);
      }

      if (!commit) {
        debug('error creating file');
        return reject(new Error('create file failed'));
      }

      var list = [
        'Checked',
        'Buffered (2x Twitter)',
        'Invited to pitch'
      ];

      if (newJob.tier === 'premium') {
        list = list.concat([
          'Buffered (4x Twitter)',
          'Added to Newsletter',
          'Invited to pitch',
          'Sent invoice'
        ]);
      }

      if (newJob.tier === 'platinum') {
        list = list.concat([
          'buffered (8x Twitter)',
          'Added to Newsletter',
          'Invited to pitch',
          'Sent invoice'
        ]);
      }

      var body = 'New job from ' + newJob.company.name + '\n\n';
      list.forEach(function(item) {
        body += '- [ ] ' + item + '\n';
      });
      body += '\n\nFile: ' + commit.content.html_url;

      github.issues.create({
        user: config.github.org,
        repo: config.github.repos.planning,
        title: newJob.title,
        labels: [config.labels.job, 'todo'],
        body: body
      }, function(error, issue) {
        debug('GitHub:createIssue()');

        if (error) {
          debug(error);
          return reject(error);
        }
        return resolve(issue);
      });
    });
  });
};

var createIssue = function createIssue(newJob, config, github) {
  debug('createIssue()');
  return new Promise(function(resolve, reject) {

    var labels = [
      config.labels.job
    ];

    if (newJob.tier !== 'free') {
      labels.push(config.labels.hot);
    }

    github.issues.create({
      user: config.github.org,
      repo: config.github.repos.jobs,
      title: newJob.title + ' @ ' + newJob.company.name,
      labels: labels,
      assignee: newJob.user.login,
      body: newJob.markdown
    }, function(error, issue) {
      debug('GitHub:createIssue()');

      if (error) {
        debug(error);
        return reject(error);
      }

      return resolve(issue);
    });
  });
};

var prepareJob = function prepareJob(requestBody, requestHeaders, config, github) {
  debug('prepareJob');
  return new Promise(function(resolve, reject) {
    github.user.get({}, function(error, user) {
      debug('GitHub:getUser()');
      var newJob = {};

      if (error) {
        debug(error);
        return reject(error);
      } else {
        newJob = {
          title: requestBody.title,
          description: requestBody.description,
          email: requestBody.email,
          company: {
            url: requestBody.url,
            name: requestBody.companyName
          },
          user: {
            login: user.login,
            avatar_url: user.avatar_url
          },
          tier: requestBody.tier.split('-')[2]
        };

        if (requestHeaders['x-stripe-token']) {
          newJob.billing = JSON.parse(requestHeaders['x-stripe-token']);
          if (requestBody.billingVat) {
            newJob.billing.vatId = requestBody.billingVat;
          }
        }

        newJob.id = moment().format('YYYYMMDD') + '-' + S(newJob.company.name).slugify().s + '-' + S(newJob.title).slugify().s;

        var body = '<h3>Job Description</h3>';
        body += newJob.description;

        if (requestBody.skillsAndRequirements) {
          newJob.skillsAndRequirements = requestBody.skillsAndRequirements;
          body += '<br /><br /><h3>Skills & Requirements</h3>';
          body += newJob.skillsAndRequirements;
        }

        if (requestBody.about) {
          newJob.company.about = requestBody.about;
          body += '<br /><br /><h3>About ' + newJob.company.name;
          body += newJob.company.about;
        }

        if (requestBody.companyTwitter) {
          newJob.company.twitter = requestBody.companyTwitter;
        }

        if (requestBody.allowsRemote) {
          newJob.allowsRemote = requestBody.allowsRemote;
        }

        if (requestBody.offersRelocation) {
          newJob.offersRelocation = requestBody.offersRelocation;
        }

        if (requestBody.JoelTests) {
          newJob.joelTests = requestBody.JoelTests;
        }

        newJob.markdown += '\n\nPosted by @' + newJob.user.login;

        if (!newJob.email || !newJob.title || !newJob.description || !newJob.company || !newJob.company.name) {
          debug('missing information');
          return reject(new Error('missing_information'));
        } else {
          newJob.markdown = toMarkdown(body, {
            gfm: true
          });

          return resolve(newJob);
        }
      }
    });
  });
};

module.exports = {
  prepareJob: prepareJob,
  createInternalIssue: createInternalIssue,
  createIssue: createIssue
};
