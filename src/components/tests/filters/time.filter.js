(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').filter('timeFilter',
        function ($filter) {
            'ngInject';
            return function (input, timeFormat) {
                timeFormat = timeFormat || 'mm';
                var newInput;
                if (timeFormat === 'customMin') {
                    /*jshint ignore:start*/
                    newInput = (input / 1000 / 60) << 0;
                    /*jshint ignore:end*/
                } else {
                    newInput = $filter('date')(input, timeFormat);
                }
                return newInput;
            };
        }
    );
})(angular);
