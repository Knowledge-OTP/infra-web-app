(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.stripe').service('CurrencyEnum',['EnumSrv',
        function(EnumSrv) {

            return new EnumSrv.BaseEnum([
                ['USD', 'usd', 'USD']
            ]);

        }]);
})(angular);
