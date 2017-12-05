(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').service('EvaluatorStatesEnum',
        function(EnumSrv) {
            'ngInject';
            var EvaluatorStatesEnum = new EnumSrv.BaseEnum([
                ['NOT_PURCHASE', 1, 'not purchase'],
                ['PENDING', 2, 'pending'],
                ['EVALUATED', 3, 'evaluated']
            ]);

            return EvaluatorStatesEnum;
        });
})(angular);
