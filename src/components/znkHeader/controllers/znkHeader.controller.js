(function (angular) {
    'use strict';

    //angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
    //    ['$scope', 'purchaseService', 'AuthService', '$window', '$mdDialog', 'UserProfileService', 'PurchaseStateEnum', 'ENV', 'OnBoardingService',
    //    function() {


    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',['$scope', '$translatePartialLoader',
        function($scope,$translatePartialLoader) {
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

