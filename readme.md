# Pivot: Preferential Voting Tool

## Installation

Before you start make sure you're running PHP >= 5.6.4 and have
[Composer](https://getcomposer.org/download/) installed.

```
composer install                # Install PHP dependencies
cp .env.example .env            # Create .env config file
vim .env                        # Update database credentials
php artisan migrate             # Run database migrations
php artisan passport:install    # Create Oauth2 Tokens
```

## Compiling Assets

If you're going to be working in [Sass](http://sass-lang.com/) or
[Vue.js](https://vuejs.org/) you'll also need to have
[Node.js](https://nodejs.org/en/) installed to use
[Laravel Mix](https://laravel.com/docs/5.4/mix)

```
npm install                     # Install Node.js dependencies
npm run dev                     # Run all mix tasks
```
