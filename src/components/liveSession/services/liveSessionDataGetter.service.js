(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').service('LiveSessionDataGetterSrv',
        function (InfraConfigSrv, $q, ENV, UserProfileService, ZnkLessonNotesSrv) {
            'ngInject';

            let _this = this;

            this._getStorage = () => {
                return InfraConfigSrv.getGlobalStorage();
            };

            this.getLiveSessionDataPath = (guid) => {
                let LIVE_SESSION_ROOT_PATH = '/liveSession/';
                return LIVE_SESSION_ROOT_PATH + guid;
            };

            this.getUserLiveSessionRequestsPath  = (userData) => {
                let appName = userData.isTeacher ? ENV.dashboardAppName : ENV.studentAppName;
                let USER_DATA_PATH = appName  + '/users/' + userData.uid;
                return USER_DATA_PATH + '/liveSession';
            };

            this.getLiveSessionData = (liveSessionGuid) => {
                let liveSessionDataPath = _this.getLiveSessionDataPath(liveSessionGuid);
                return this._getStorage().then((storage) => {
                    return storage.getAndBindToServer(liveSessionDataPath);
                });
            };

            this.getLiveSessionDuration = () => {
                return ZnkLessonNotesSrv.getGlobalVariables()
                    .then(globalVariables => globalVariables.liveSession);
            };

            this.getCurrUserLiveSessionRequests = () => {
                return UserProfileService.getCurrUserId().then(currUid => {
                    return this._getStorage().then(storage => {
                        let currUserLiveSessionDataPath = ENV.firebaseAppScopeName + '/users/' + currUid + '/liveSession/active';
                        return storage.getAndBindToServer(currUserLiveSessionDataPath);
                    });
                });
            };

            this.getCurrUserLiveSessionData = () => {
                return _this.getCurrUserLiveSessionRequests().then((currUserLiveSessionRequests) =>{
                    let liveSessionDataPromMap = {};
                    angular.forEach(currUserLiveSessionRequests, (isActive, guid) => {
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
