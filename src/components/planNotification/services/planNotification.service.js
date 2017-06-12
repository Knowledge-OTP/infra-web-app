(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.planNotification').service('PlanNotificationService',
        function ($translate, PopUpSrv, $q, $window, $log, ENV, $http, AuthService, $location) {
            'ngInject';

            function _checkPlanNotification(){
                var search = $location.search();
                if (angular.isDefined(search.planId)) {
                    var uid = AuthService.getAuth().uid;
                    var connectStudentToPlanUrl = ENV.myZinkerz + '/plan/connectStudentToPlan';
                    $http({
                        method: 'POST',
                        url: connectStudentToPlanUrl,
                        data: { planId: search.planId, uid: uid }
                    }).then(function successCallback() {
                        _newPlanNotification({ refObjId: search.planId });
                        $log.debug('checkPlanNotification: connectStudentToPlan successful');
                        delete search.planId;
                        $location.search(search);
                    }, function errorCallback(err) {
                        $log.error('checkPlanNotification: error in PlanService.connectStudentToPlan, err: ' + err);
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

            this.checkPlanNotification = _checkPlanNotification;
            this.showPlanNotificationPopUp = _showPlanNotificationPopUp;
            this.newPlanNotification = _newPlanNotification;
        });
})(angular);
