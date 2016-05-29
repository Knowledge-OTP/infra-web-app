(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').provider('EstimatedScoreWidgetSrv', [
        function () {
            var self = this;
            this.$get = function () {
                'ngInject';
                var appSubjects = {};
                var subject = self.subjects;

                return appSubjects;
            }
        }
    ]);
})(angular);
