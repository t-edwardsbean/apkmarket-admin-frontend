'use strict';

/* App Module */

var apkmarket = angular.module('apkmarket', [
    'ngRoute',
    'ngResource',
    'apkmarket.controllers',
    'apkmarket.services',
    'apkmarket.directives'
]);

apkmarket.config(function ($routeProvider, $locationProvider, $httpProvider) {

    $httpProvider.interceptors.push(function ($q, $location,$window) {
        return {
            response: function (response) {
                //由于服务端使用的是spring security,未验证返回的是302,而302 angularjs是没办法捕获到的
                //所以这里直接拦截返回的内容是否需要登陆
                if (typeof response.data === 'string') {
                    if (response.data.indexOf('登录') != -1) {
                        //$location.path('login');
                        $window.location.href = 'login';

                    }
                }
                return response;
            }
            //实际上服务端应该返回的是401,这样angularjs就能捕获的到
            //对于纯JSON交互的方式,可以使用开源的:https://github.com/witoldsz/angular-http-auth
        };
    });

    $routeProvider.
        when('/', {
            templateUrl: './templates/console.html',
            controller: 'HomeController'
        }).when('/topic', {
            templateUrl: './templates/topic.html',
            controller: 'TopicController'
        }).when('/page', {
            templateUrl: './templates/page.html',
            controller: 'PageController'
        }).when('/h5', {
            templateUrl: './templates/h5.html',
            controller: 'H5Controller'
        }).when('/login', {
            templateUrl: './templates/login.html',
            controller: 'LoginController'
        }).when('/tag', {
            templateUrl: './templates/tag.html',
            controller: 'TagController'
        }).when('/category', {
            templateUrl: './templates/category.html',
            controller: 'CategoryController'
        }).when('/stat', {
            templateUrl: './templates/stat.html',
            controller: 'StatController'
        });

    $locationProvider.html5Mode(false).hashPrefix('!');
});



//apkmarket.constant('host', 'http://h13:9999/');
apkmarket.constant('host', 'http://192.168.10.172:9999/');
apkmarket.constant('apiHost', 'http://183.251.100.13:8099/');
