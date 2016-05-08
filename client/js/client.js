var controllers = require( './controllers.js' );
var directives = require( './directives.js' );
var services = require( './services.js' );
var _ = require( 'underscore' );

var components = angular.module( 'personalFinance.components', ['ng']);

_.each( controllers, function( controller, name ) {
    components.controller( name, controller );
});

_.each( directives, function( directive, name ) {
    components.directive( name, directive );
});

_.each( services, function( factory, name ) {
    components.factory( name, factory );
});

var client = angular.module( 'personalFinance', [ 'personalFinance.components', 'ngRoute']);

client.config( function( $routeProvider ){

    $routeProvider.
        when ('/', {
        templateUrl: 'assets/templates/main.html'
    }).
        when ('/dashboard', {
        templateUrl: 'assets/templates/expensesApp.html'
    }).
    when ('/list', {
        templateUrl: 'assets/templates/expensesCalendarApp.html'
    });

});