API test:

These are some hacky, hardcoded end-to-end tests.  You need to edit
user.json to include some email addresses and access tokens of real
users that you manually created for your deployment.

Getting the access token is easy, navigate to
http://homestead.app/profile (or similar), click "Create New Token",
and paste it in users.json.

This test just creates a new election, adds the user as an elector,
adds three candidates, causes user to vote, then requests results.
