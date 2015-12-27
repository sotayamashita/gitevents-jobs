'use strict';

module.exports = {
  debug: false,
  plugins: {
    stripe: {
      secretKey: 'sk_test_HELLO',
      publishableKey: 'pk_test_HELLO'
    },
    auth: {
      enabled: true,
      secret: new Buffer('gitevents-jobs', 'base64'),
      audience: 'gitevents'
    }
  },
  github: {
    user: 'PatrickHeneise',
    org: 'gitevents',
    repos: {
      planning: 'playground',
      speakers: 'playground',
      gitevent: 'playground',
      jobs: 'playground'
    },
    token: '123abc'
  },
  paths: {
    talks: 'src/talks/',
    events: 'src/events/',
    jobs: 'jobs/'
  },
  labels: {
    job: 'job',
    talk: 'talk',
    proposal: 'proposal',
    event: 'event',
    hot: 'hot'
  }
};
