[![npm](https://img.shields.io/npm/v/gitevents-jobs.svg)](https://www.npmjs.com/package/gitevents-jobs)[![build status](https://travis-ci.org/gitevents/gitevents-jobs.svg)](https://travis-ci.org/gitevents/gitevents-jobs)[![code climate](https://codeclimate.com/github/gitevents/gitevents-jobs/badges/gpa.svg)](https://codeclimate.com/github/gitevents/gitevents-jobs)[![issue count](https://codeclimate.com/github/gitevents/gitevents-jobs/badges/issue_count.svg)](https://codeclimate.com/github/gitevents/gitevents-jobs)

# Jobs on gitevents

[Post A Job]-Button on event website

    [Basic HTML for a job form](https://github.com/gitevents/gitevents-jobs/blob/master/html/jobs.html)

## Job Form
- Title
- Description
- Salary
- Link to job offer (no email)
- Twitter handle
- Remote or in Barcelona (yes/no) (no => no job offer)


Post the job for 49€
- Starred (top)
- (1 minute showcase at the event)
- 2 Tweets - 1 day after the event


Post the job for 99€
- Starred (top)
- (2 minute showcase at the event)
- 4 Tweets - 1+2 days after the event
- Job Listing in Newsletter


Submit

    -> Open Stripe Form

      -> Stripe Callback to gitevents server
      -> Email invoices

    -> POST to gitevents server


## gitevents

    -> POST on /jobs

      -> Create GitHub issue in /Jobs
      -> Label GitHub issue as 'Job'

    -> POST on /jobs/callback

      -> Verify Stripe callback
      -> Modify GitHub issue and label 'starred'
      -> Send tweet with new job with link to issue

## cleanup

    run cleanup script in gitevents core and check for expired job offers
    -> close expired job offers
