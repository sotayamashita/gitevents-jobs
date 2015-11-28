# Jobs on gitevents

[Post A Job]-Button on event website

    [todo] provide html code for copy&paste

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
