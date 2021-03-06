(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.planNotification', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.popUp'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.planNotification').factory('ZnkServiceEnum',
        ["EnumSrv", function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['ACT', 1, 'act'],
                ['SAT', 2, 'sat'],
                ['SATSM', 3, 'satsm'],
                ['TOEFL', 4, 'toefl'],
                ['ZNK', 5, 'znk']
            ]);
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.planNotification').service('PlanNotificationService',
        ["$translate", "PopUpSrv", "$q", "$window", "$log", "ENV", "$http", "AuthService", "$location", function ($translate, PopUpSrv, $q, $window, $log, ENV, $http, AuthService, $location) {
            'ngInject';

            function _getPlanIdFromUrl() {
                var search = $location.search();
                return angular.isDefined(search.planId) ? search.planId : null;
            }

            function _checkPlanNotification(){
                var planId = _getPlanIdFromUrl();
                if (planId) {
                    AuthService.getAuth().then(authData => {
                        if (authData && authData.uid) {
                            var uid = authData.uid;
                            var connectStudentToPlanUrl = ENV.zinkerzBE + '/plan/connectStudentToPlan';
                            $http({
                                method: 'POST',
                                url: connectStudentToPlanUrl,
                                data: { planId: planId, uid: uid }
                            }).then(function successCallback() {
                                _newPlanNotification({ refObjId: planId });
                                $log.debug('checkPlanNotification: connectStudentToPlan successful');
                            }, function errorCallback(err) {
                                $log.error('checkPlanNotification: error in PlanService.connectStudentToPlan, err: ' + err);
                            });
                        }
                    });
                }
            }

            function _newPlanNotification(notification) {
                _showPlanNotificationPopUp().then(function () {
                    $window.open(ENV.myZinkerz + '?planId=' + notification.refObjId);
                }).catch(function () {
                    $log.debug('newPlanNotification: user closed the popup');
                });
            }

            function _showPlanNotificationPopUp(){
                if (!_isPopupSeen()) {
                    var translationsPromMap = {};
                    translationsPromMap.title = $translate('PLAN_NOTIFICATION.NEW_PLAN');
                    translationsPromMap.content= $translate('PLAN_NOTIFICATION.CONTINUE_TO_PLAN');
                    translationsPromMap.acceptBtnTitle = $translate('PLAN_NOTIFICATION.REJECT');
                    translationsPromMap.cancelBtnTitle = $translate('PLAN_NOTIFICATION.ACCEPT');
                    return $q.all(translationsPromMap).then(function(translations){
                        var popUpInstance = PopUpSrv.warning(
                            translations.title,
                            translations.content,
                            translations.acceptBtnTitle,
                            translations.cancelBtnTitle
                        );
                        $window.localStorage.setItem('lastSeenPlanNotificationPopUp', Date.now());
                        return popUpInstance.promise.then(function(res){
                            return $q.reject(res);
                        },function(res){
                            return $q.resolve(res);
                        });
                    },function(err){
                        $log.error('planNotificationService: showPlanNotificationPopUp translate failure' + err);
                        return $q.reject(err);
                    });
                } else {
                    $log.debug('showPlanNotificationPopUp: The popup have been already seen in the last two hours');
                }
            }

            function _isPopupSeen() {
                var isPopupSeen = false;
                var TWO_HOURS = 7200000;
                var lastSeenPlanNotificationPopUp = $window.localStorage.getItem('lastSeenPlanNotificationPopUp');
                if (lastSeenPlanNotificationPopUp){
                    isPopupSeen = (lastSeenPlanNotificationPopUp + TWO_HOURS) < Date.now();
                }
                return isPopupSeen;
            }

            this.getPlanIdFromUrl = _getPlanIdFromUrl;
            this.checkPlanNotification = _checkPlanNotification;
            this.showPlanNotificationPopUp = _showPlanNotificationPopUp;
            this.newPlanNotification = _newPlanNotification;
        }]);
})(angular);

angular.module('znk.infra-web-app.planNotification').run(['$templateCache', function ($templateCache) {

}]);
