# Pivot: Preferential Voting Tool

[![PDD status](http://www.0pdd.com/svg?name=pivot-libre/pivot)](http://www.0pdd.com/p?name=pivot-libre/pivot)


## License

Everything is licensed under the Apache 2.0 License with the exception of black-threads-light.png which is licensed from [Toptal](https://www.toptal.com/designers/subtlepatterns/black-thread/) under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/us/legalcode).

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

### PHP

PHPUnit tests can be executed simply by running `phpunit` on the command line at the root of the repository.

### Python
Some integration tests are written in Python. The python test script accepts some parameters. The most important one is `--url` - a url pointing to the root of a running Pivot app. If no value is specified, a default local homestead url is assumed.

The python test script reads from `tests/python/users.json`. `users.json` is not present by default. The following code example generates a `users.json` for you. Later optional instructions will tell you how to create one from scratch.

Example:

```shell
#Seed database with test data, create example users.json
php artisan db:seed --class=TravisSeeder
#Install Python dependencies
pip install -r requirements.txt
#Run the Python integration tests
cd tests/python
python tests.py --url http://pivot.test
```

#### Customizing users.json
You can optionally customize `tests/python/users.json` if you want the python tests to use something other than the automatically-generated accounts. `users.json` needs two users. You can register custom users in the Pivot web UI, log in to their `/profile` pages, (Ex: `http://pivot.test/profile`, create personal access tokens for them, and then copy the tokens and emails into the json file.

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
