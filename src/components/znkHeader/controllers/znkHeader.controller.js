(function (angular) {
    'use strict';

    //angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
    //    ['purchaseService', 'AuthService', 'UserProfileService', 'PurchaseStateEnum', 'ENV', 'OnBoardingService',


    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',['$scope', '$translatePartialLoader','$mdDialog', '$window',
        function($scope,$translatePartialLoader, $mdDialog, $window) {
            $translatePartialLoader.addPart('znkHeader');

            var self = this;
            self.expandIcon = 'expand_more';

            self.userProfile = {  // mock
                username: 'asdada',
                email:'asdasdasd@zasasdasd'
            };

            this.znkOpenModal = function() {
                this.expandIcon = 'expand_less';
                //OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                //    self.isOnBoardingCompleted = isCompleted;
                //});
            };

            this.subscriptionStatus = '.PROFILE_STATUS_BASIC';  // mock

            $scope.$on('$mdMenuClose', function(){
                self.expandIcon = 'expand_more';
            });

        }]);
})(angular);

