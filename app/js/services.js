'use strict';

/* Services */

var services = angular.module('apkmarket.services', ['ngResource']);


services.factory('Topic',
    function ($resource,host) {
        return $resource(host + "admin/topics/:id", {id: '@id'});
    })

services.factory('Position',
    function ($resource,host) {
        return $resource(host + "admin/pages/:pageId/positions/:id", {id: '@id', pageId: '@pageId'});
    })

services.factory('Page',
    function ($resource,host) {
        return $resource(host + "admin/pages/:id", {id: '@id'})
    })

services.factory('TopicTypes',
    function ($resource,host) {
        return $resource(host + "admin/types", {callback: 'JSON_CALLBACK'}, {
            get: {method: 'JSONP', isArray: true}
            //delete: {method: 'JSONP',}
        });
    })


services.factory('Apks',
    function ($resource,host) {
        return $resource(host + "admin/apks", {callback: 'JSON_CALLBACK'}, {
            get: {method: 'JSONP', isArray: true}
            //delete: {method: 'JSONP'}
        });
    })

services.factory('Apk',
    function ($resource,host) {
        return $resource(host + "admin/apk/:packageName", {
            packageName: '@packageName',
            callback: 'JSON_CALLBACK'
        }, {
            get: {method: 'JSONP', isArray: true}
        });
    })

services.factory('TopicApks',
    function ($resource,host) {
        return $resource(host + "admin/apk/:packageName", {
            packageName: '@packageName',
            callback: 'JSON_CALLBACK'
        }, {
            get: {method: 'JSONP', isArray: true}
        });
    })

