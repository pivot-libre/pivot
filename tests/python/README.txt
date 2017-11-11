API test:

These are some hacky, hardcoded end-to-end tests.  You need to do
oauth2 manually (perhaps via Postman), and then copy-paste the
access_token into users.json.

This just creates a new election, adds the user as an elector, adds
three candidates, causes user to vote, then requests results.
