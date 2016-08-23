(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').provider('FaqSrv', function() {
        'ngInject';

        var lengthQuestion = 11;

        this.setLengthQuestion = function(_lengthQuestion) {
            lengthQuestion = _lengthQuestion;
        };

        this.$get = function() {
            var faqSrvApi = {};

            faqSrvApi.getLengthQuestion = function() {
                return lengthQuestion;
            };

            return faqSrvApi;
        };
    });
})(angular);
