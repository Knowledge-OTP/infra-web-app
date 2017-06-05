(function(){
    'use strict';

    angular.module('znk.infra-web-app.planNotification').run(
        function checkPlanNotification(NotificationService, NotificationTypeEnum, ENV, ZnkServiceEnum,
                                       PlanNotificationService, PlanService, $log, AuthService, $location){
            'ngInject';
            NotificationService.clean(NotificationTypeEnum.planCreated);
            NotificationService.on(NotificationTypeEnum.planCreated, PlanNotificationService.newPlanNotification());

            var search = $location.search();
            if (angular.isDefined(search.planId)) {
                var uid = AuthService.getAuth().uid;
                PlanService.connectStudentToPlan(search.planId, uid).then(function () {
                    $log.debug('checkPlanNotification: connectStudentToPlan successful');
                }).catch(function (err) {
                    $log.error('checkPlanNotification: error in PlanService.connectStudentToPlan, err: ' + err);
                });
                PlanNotificationService.newPlanNotification();
                delete search.planId;
                $location.search(search);
            }
        }
    );
})();
