/**
*	Defines dependencies
*/
var myApp = angular.module('Awearness', ['routeAppControllers', 'ngRoute', 'ngRadialGauge', 'myModule', 'angularFileUpload']);


/**
*	Defines constant
*/
myApp.constant("myConfig", {
	// URL base for REST request
    "url": "http://localhost:8084/awearness-server/rest/json",
});

/**
*	Defines route and controller
*/
myApp.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

	$httpProvider.defaults.withCredentials = true;
	$httpProvider.defaults.useXDomain = true;

	$routeProvider
	.when('/attackGraph', {
		'controller': 'attackGraphController',
		'templateUrl': 'view/attackGraph.html'
	})
	.when('/attackPath', {
		'controller': 'attackPathController',
		'templateUrl': 'view/attackPath.html'
	})
	.when('/topology', {
		'controller': 'topologyController',
		'templateUrl': 'view/topology.html'
	})	
	.otherwise({
		redirectTo: '/topology'
	});
}]);

var routeAppControllers = angular.module('routeAppControllers', []);
