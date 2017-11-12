(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').service('LiveSessionDataGetterSrv',
        function (InfraConfigSrv, $q, ENV, UserProfileService) {
            'ngInject';

            let _this = this;

            function _getStorage() {
                return InfraConfigSrv.getGlobalStorage();
            }

            this.getLiveSessionDataPath = function (guid) {
                let LIVE_SESSION_ROOT_PATH = '/liveSession/';
                return LIVE_SESSION_ROOT_PATH + guid;
            };

            this.getLiveSessionDurationPath = function () {
                return '/settings/liveSessionDuration/';
            };

            this.getUserLiveSessionRequestsPath  = function (userData) {
                let appName = userData.isTeacher ? ENV.dashboardAppName : ENV.studentAppName;
                let USER_DATA_PATH = appName  + '/users/' + userData.uid;
                return USER_DATA_PATH + '/liveSession';
            };

            this.getLiveSessionData = function (liveSessionGuid) {
                let liveSessionDataPath = _this.getLiveSessionDataPath(liveSessionGuid);
                return _getStorage().then(function (storage) {
                    return storage.getAndBindToServer(liveSessionDataPath);
                });
            };

            this.getLiveSessionDuration = function () {
                let liveSessionDurationPath = _this.getLiveSessionDurationPath();
                return _getStorage().then(function (storage) {
                    return storage.get(liveSessionDurationPath);
                });
            };

            this.getCurrUserLiveSessionRequests = function(){
                return UserProfileService.getCurrUserId().then(function(currUid){
                    return _getStorage().then(function(storage){
                        let currUserLiveSessionDataPath = ENV.firebaseAppScopeName + '/users/' + currUid + '/liveSession/active';
                        return storage.getAndBindToServer(currUserLiveSessionDataPath);
                    });
                });
            };

            this.getCurrUserLiveSessionData = function () {
                return _this.getCurrUserLiveSessionRequests().then(function(currUserLiveSessionRequests){
                    let liveSessionDataPromMap = {};
                    angular.forEach(currUserLiveSessionRequests, function(isActive, guid){
                        if(isActive){
                            liveSessionDataPromMap[guid] = _this.getLiveSessionData(guid);
                        }
                    });

                    return $q.all(liveSessionDataPromMap);
                });
            };
        }
    );
})(angular);
