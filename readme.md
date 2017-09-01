# Pivot: Preferential Voting Tool

[![PDD status](http://www.0pdd.com/svg?name=pivot-libre/pivot)](http://www.0pdd.com/p?name=pivot-libre/pivot)

## Installation

Before you start make sure you're running PHP >= 5.6.4 and have
[Composer](https://getcomposer.org/download/) installed.

```shell
composer install                # Install PHP dependencies
cp .env.example .env            # Create .env config file
vim .env                        # Update database credentials
php artisan key:generate        # Create application key
php artisan migrate             # Run database migrations
php artisan passport:install    # Create Oauth2 Tokens
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

## API

### GET /election

Returns list of my elections.

Response Body:

```json
[
    {
        "id": 1,
        "creator_id": 1,
        "name": "First Election",
        "created_at": "2017-05-16 15:37:24",
        "updated_at": "2017-05-16 15:37:24",
        "deleted_at": null
    }
]
```

### POST /election

Creates a new election.

Request Body:

```json
{
    "name": "First Election"
}
```

Response: `302` redirect to `/election/{id}`

### GET /election/{id}

Returns single election.

Response Body:

```json
{
    "id": 1,
    "creator_id": 1,
    "name": "First Election",
    "created_at": "2017-05-16 15:37:24",
    "updated_at": "2017-05-16 15:37:24",
    "deleted_at": null
}
```

### DELETE /election/{id}

Deletes single election.

Response Body:

```json
{}
```

### GET /election/{id}/invite

All pending invites

### POST /election/{id}/invite

Send new invite.

Request Body:

```json
{
    "email": "elector@example.com"
}
```

Response: `302` redirect to `/election/{id}/invite/{code}`

### GET /election/{id}/invite/{code}

Returns single invite.

Response Body:

```json
{
    "id": 1,
    "code": "12345678",
    "email": "elector@example.com",
    "accepted_at": null,
    "created_at": "2017-05-16 15:37:24",
    "updated_at": "2017-05-16 15:37:24"
}
```

### POST /election/{id}/invite/accept

Accept invite.

Request Body:

```json
{
    "code": "12345678"
}
```

Response: `302` redirect to `/election/{id}/invite/{code}`

### DELETE /election/{id}/invite/{code}

Delete single invite.

Request Body:

```json
{}
```
