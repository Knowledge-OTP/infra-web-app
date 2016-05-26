(function (angular) {
    'use strict';

    angular.module('demo').config(function($translateProvider){
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        }).preferredLanguage('en');
    });
})(angular);
