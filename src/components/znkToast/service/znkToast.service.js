(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast')
        .service('ZnkToastSrv',
            function ($mdToast) {
                'ngInject';

                this.showToast = (type, msg, options) => {
                    options = options || {};

                    $mdToast.show({
                        locals:{ type: type,  msg: msg },
                        templateUrl: 'components/znkToast/templates/znkToast.template.html',
                        position: options.position || 'top right',
                        toastClass: (options.toastClass) ? options.toastClass + ' znk-toast-genreal' : 'znk-toast-genreal',
                        hideDelay: angular.isDefined(options.hideDelay) ?  options.hideDelay : 3000,
                        controllerAs: 'vm',
                        controller: 'ToastController'
                    });
                };

                this.hideToast = () => {
                    $mdToast.hide();
                };
            }
        );
})(angular);
