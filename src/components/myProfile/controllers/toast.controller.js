(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile').controller('ToastController',
        function ($translatePartialLoader, $mdToast) {
            'ngInject';

            var vm = this;
            vm.msg = 'Your profile has been successfully saved.';

            $translatePartialLoader.addPart('myProfile');

            vm.closeToast = function () {
                $mdToast.hide();
            };

        }
        );
})(angular);
