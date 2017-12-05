(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').config(function (SvgIconSrvProvider) {
            'ngInject';
            var svgMap = {
                'evaluator-star': 'components/evaluator/svg/star.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        });

})(angular);
