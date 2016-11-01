(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast')
        .service('ZnkToastSrv',
            function ($mdToast) {
                'ngInject';

                var self = this;

                self.showToast = function (type, msg) {
                    $mdToast.show({
                        locals:{ type: type,  msg: msg },
                        templateUrl: 'components/znkToast/templates/znkToast.template.html',
                        position: 'top right',
                        hideDelay: 3000,
                        controllerAs: 'vm',
                        controller: 'ToastController'
                    });
                };
            }
        );
})(angular);
