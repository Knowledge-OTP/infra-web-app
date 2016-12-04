(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast').controller('ToastController',
        function ($mdToast, type, msg) {
            'ngInject';

            var vm = this;
            vm.type = type;
            vm.msg = msg;

            vm.closeToast = function () {
                $mdToast.hide();
            };

        }
        );
})(angular);
