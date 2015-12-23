var debug = require('debug')('gitevents-jobs:job');
var moment = require('moment');
var stripe = require('stripe');
var S = require('string');

var createInternalIssue = function createInternalIssue(newJob, config, github) {
  debug('createInternalIssue()');
  return new Promise(function(resolve, reject) {
    var file = new Buffer(JSON.stringify(newJob, null, 2)).toString('base64');
    var jobId = moment().format('YYYYMMDD') + '-' + S(newJob.company.name).slugify().s + '-' + S(newJob.title).slugify().s

    github.repos.createFile({
      user: config.github.org,
      repo: config.github.repos.planning,
      path: paths.jobs + jobId,
      content: file,
      message: 'Created ' + commit.name + ' by @' + commit.user
    }, function(error) {
      if (error) {
        reject(new Error(error));
      }
      resolve();
    });

    var list = [
      'invoiced', 'promoted', 'mailing'
    ];

    var body = 'New job from ' + newJob.company.name;
    // body += '\n\nFile: ' +

    github.issues.create({
      user: config.github.org,
      repo: config.github.repos.planning,
      title: newJob.title,
      labels: ['job'],
      body: JSON.stringify(newJob, null, 2)
    }, function(error) {
      if (error) {
        console.log(error);
        return reject(new Error(error));
      }
      return resolve();
    });
  });
};

var createIssue = function createIssue(newJob, config, github) {
  debug('createIssue()');
  return new Promise(function(resolve, reject) {
    github.issues.create({
      user: config.github.org,
      repo: config.github.repos.jobs,
      title: newJob.title,
      labels: ['job'],
      body: newJob.markdown
    }, function(error) {
      if (error) {
        return reject(new Error(error));
      }
      return resolve();
    });
  });
};

module.exports = function job(newJob, config, github, githubInternal) {
  return new Promise(function(resolve, reject) {
    createInternalIssue(newJob, config, githubInternal)
      .then(function(issue) {
        if (newJob.tier === 'free') {

        } else if (newJob.tier === 'premium') {

        } else if (newJob.tier === 'platinum') {

        }
      });
  });
};
