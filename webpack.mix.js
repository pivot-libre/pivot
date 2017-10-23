const { mix } = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/assets/js/app.js', 'public/js')
   .sass('resources/assets/sass/app.scss', 'public/css');


mix.copy('vendor/swagger-api/swagger-ui/dist/swagger-ui.css', 'public/swagger/asset/swagger-ui.css');
mix.copy('vendor/swagger-api/swagger-ui/dist/swagger-ui-bundle.js', 'public/swagger/asset/swagger-ui-bundle.js');
mix.copy('vendor/swagger-api/swagger-ui/dist/swagger-ui-standalone-preset.js', 'public/swagger/asset/swagger-ui-standalone-preset.js');