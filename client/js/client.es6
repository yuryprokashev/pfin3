var controllers = require( './controllers.es6' );
var directives = require( './directives.es6' );
var services = require( './services.es6' );
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
    when ('/log-and-plan', {
        templateUrl: 'assets/templates/logAndPlanApp.html'
    });
});