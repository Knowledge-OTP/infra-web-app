(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').run(function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('znkHeader');
    });
})(angular);

