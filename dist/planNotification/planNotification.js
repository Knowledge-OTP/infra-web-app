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


(function(){
    'use strict';

    angular.module('znk.infra-web-app.planNotification').run(
        ["NotificationService", "NotificationTypeEnum", "ZnkServiceEnum", "$http", "PlanNotificationService", "$log", "AuthService", "$location", "ENV", function checkPlanNotification(NotificationService, NotificationTypeEnum, ZnkServiceEnum, $http,
                                       PlanNotificationService, $log, AuthService, $location, ENV){
            'ngInject';
            NotificationService.clean(NotificationTypeEnum.planCreated);
            NotificationService.on(NotificationTypeEnum.planCreated, PlanNotificationService.newPlanNotification);

            var search = $location.search();
            if (angular.isDefined(search.planId)) {
                var uid = AuthService.getAuth().uid;
                var connectStudentToPlanUrl = ENV.myZinkerz + '/plan/connectStudentToPlan';
                $http({
                    method: 'POST',
                    url: connectStudentToPlanUrl,
                    data: { planId: search.planId, uid: uid }
                }).then(function successCallback() {
                    PlanNotificationService.newPlanNotification({ refObjId: search.planId });
                    $log.debug('checkPlanNotification: connectStudentToPlan successful');
                    delete search.planId;
                    $location.search(search);
                }, function errorCallback(err) {
                    $log.error('checkPlanNotification: error in PlanService.connectStudentToPlan, err: ' + err);
                });
            }
        }]
    );
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.planNotification').service('PlanNotificationService',
        ["$translate", "PopUpSrv", "$q", "$window", "$log", "ENV", function ($translate, PopUpSrv, $q, $window, $log, ENV) {
            'ngInject';

            function newPlanNotification(notification) {
                showPlanNotificationPopUp().then(function () {
                    $window.open(ENV.myZinkerz + '?planId=' + notification.refObjId);
                }).catch(function () {
                    $log.debug('newPlanNotification: user closed the popup');
                });
            }

            function showPlanNotificationPopUp(){
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

            this.showPlanNotificationPopUp = showPlanNotificationPopUp;
            this.newPlanNotification = newPlanNotification;
        }]);
})(angular);

angular.module('znk.infra-web-app.planNotification').run(['$templateCache', function($templateCache) {

}]);
