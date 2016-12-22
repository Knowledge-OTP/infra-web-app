(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast')
        .service('ZnkToastSrv',
            function ($mdToast) {
                'ngInject';

                var self = this;

                self.showToast = function (type, msg, options) {
                    options = options || {};

                    $mdToast.show({
                        locals:{ type: type,  msg: msg },
                        templateUrl: 'components/znkToast/templates/znkToast.template.html',
                        position: options.position || 'top right',
                        hideDelay: angular.isDefined(options.hideDelay) ?  options.hideDelay : 3000,
                        controllerAs: 'vm',
                        controller: 'ToastController'
                    });
                };

                self.hideToast = function() {
                    $mdToast.hide();
                };
            }
        );
})(angular);
