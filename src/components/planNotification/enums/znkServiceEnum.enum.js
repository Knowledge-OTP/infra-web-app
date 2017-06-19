(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.planNotification').factory('ZnkServiceEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['ACT', 1, 'act'],
                ['SAT', 2, 'sat'],
                ['SATSM', 3, 'satsm'],
                ['TOEFL', 4, 'toefl'],
                ['ZNK', 5, 'znk']
            ]);
        }
    );
})(angular);

