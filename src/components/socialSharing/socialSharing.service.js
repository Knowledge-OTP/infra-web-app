(function (angular) {
    'use strict';
    
    angular.module('znk.infra-web-app.socialSharing')
        .service('SocialSharingSrv',
            function (StorageSrv, InfraConfigSrv, $q) {
                'ngInject';

                var SOCIAL_SHARING_PATH = StorageSrv.variables.appUserSpacePath + '/socialSharing';

                function _getSocialSharing() {
                    return InfraConfigSrv.getStudentStorage().then(function(StudentStorageSrv){
                        return StudentStorageSrv.get(SOCIAL_SHARING_PATH);
                    });
                }

                this.getSocialSharingData = _getSocialSharing;

                this.setSocialSharingNetwork = function (key, value) {
                    return $q.all([
                        _getSocialSharing(),
                        InfraConfigSrv.getStudentStorage()
                    ]).then(function (res) {
                        var socialSharing = res[0];
                        var studentStorage= res[1];

                        socialSharing[key] = value;
                        return studentStorage.set(SOCIAL_SHARING_PATH, socialSharing);
                    });
                };
            }
        );
})(angular);
