(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').component('liveSessionFrame', {
            templateUrl: 'components/liveSession/components/liveSessionFrame/liveSessionFrame.template.html',
            bindings: {
                userLiveSessionState: '<',
                onClose: '&'
            },
            controllerAs: 'vm',
            controller: function (UserLiveSessionStateEnum, $log) {
                'ngInject';

                // adding the classes that display the orange square
                this.$onInit = () => {
                    if (this.userLiveSessionState) {
                        this.liveSessionCls = 'active-state';
                    } else {
                        $log.error('liveSessionComponent: invalid state was provided');
                    }
                };
            }
        }
    );
})(angular);

