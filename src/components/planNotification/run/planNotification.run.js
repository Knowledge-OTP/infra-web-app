(function(){
    'use strict';

    angular.module('znk.infra-web-app.planNotification').run(
        function checkPlanNotification(NotificationService, NotificationTypeEnum, ZnkServiceEnum, $http,
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
        }
    );
})();
