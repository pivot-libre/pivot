# Pivot: Preferential Voting Tool

[![PDD status](http://www.0pdd.com/svg?name=pivot-libre/pivot)](http://www.0pdd.com/p?name=pivot-libre/pivot)

## Installation

Before you start make sure you're running PHP >= 7.1 and have
[Composer](https://getcomposer.org/download/) installed.

```shell
composer install                # Install PHP dependencies
cp .env.example .env            # Create .env config file
vim .env                        # Update database credentials, add email service info
php artisan key:generate        # Create application key
php artisan migrate             # Run database migrations
php artisan passport:install    # Create Oauth2 Tokens
```

## Tests

The project has two ways of executing tests.

PHPUnit tests can be executed simply by running `phpunit` on the command line at the root of the repository.

Some integration tests are written in Python. The python script reads from tests/python/users.json. Create two users in the Pivot web UI, create personal access tokens, and then copy both users emails and tokens into the json file.

At this point you are ready to run the script. The script accepts a single optional param - a url pointing to the root of a running Pivot app. If no value is specified, a default local homestead url is assumed.

Example:

```shell
pip install -r requirements.txt
cd tests/python
python tests.py --url http://pivot.test
```

## Compiling Assets

If you're going to be working in [Sass](http://sass-lang.com/) or
[Vue.js](https://vuejs.org/) you'll also need to have
[Node.js](https://nodejs.org/en/) installed to use
[Laravel Mix](https://laravel.com/docs/5.4/mix)

```shell
npm install                     # Install Node.js dependencies
npm run dev                     # Run all mix tasks
```

## Working With Database Migrations

```shell
# Run the database migrations
php artisan migrate

# Rollback all database migrations
php artisan migrate:reset

# Reset and re-run all migrations
php artisan migrate:refresh

# Recreate Oauth2 Tokens if you've wiped out the tables
php artisan passport:install
```

## REST API
Once you have pivot up and running, visit http://yourhostname.here/docs in a web browser to view dynamic Swagger REST API documentation.
