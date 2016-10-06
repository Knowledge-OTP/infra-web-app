(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .service('MyProfileSrv',
            function ($mdDialog) {
                'ngInject';

                this.showMyProfile = function () {
                    $mdDialog.show({
                        controller: 'MyProfileController',
                        controllerAs: 'vm',
                        templateUrl: 'components/myProfile/templates/myProfile.template.html',
                        clickOutsideToClose: true,
                        escapeToClose: true
                    });
                };
            }
        );
})(angular);
