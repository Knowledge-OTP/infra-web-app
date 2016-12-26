(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard').controller('AdminDashboardController',
        function ($state) {
            'ngInject';

            var EXPECTED_CURR_STATE = 'app.admin';
            if ($state.current.name === EXPECTED_CURR_STATE) {
                $state.go('app.admin.eslink');
            }
        }
    );
})(angular);

