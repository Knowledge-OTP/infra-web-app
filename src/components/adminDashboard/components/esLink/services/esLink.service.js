(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('ESLinkService',
            function ($q, $log, $http, ENV) {
                'ngInject';

                var apiPath = ENV.backendEndpoint + "/invitation/assosciate_student";


                this.createInvitationFactory = function (senderUid, senderName, receiverEmail, receiverName, senderAppName, receiverAppName, senderEmail, receiverParentEmail, receiverParentName) {
                    return new Invitation(senderUid, senderName, receiverEmail, receiverName, senderAppName, receiverAppName, senderEmail, receiverParentEmail, receiverParentName);
                };
                this.link = function (data) {
                    var deferred = $q.defer();
                    if (!(data && angular.isObject(data))) {
                        $log.error('Invitation object is not defined');
                        return;
                    }
                    if (!(data instanceof Invitation)) {
                        $log.error('Invitation object must be an instance of class Invitation');
                    }
                    $http.post(apiPath, data).then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        $log.error(err.data.error);
                        deferred.reject(err.data.error);
                    });
                    return deferred.promise;
                };

                function Invitation(senderUid, receiverUid, senderName, receiverEmail, senderEmail, receiverName, senderAppName, receiverAppName) {
                    this.senderUid = senderUid;
                    this.receiverUid = receiverUid;
                    this.senderName = _getName(senderName, senderEmail);
                    this.receiverEmail = receiverEmail;
                    this.receiverName = _getName(receiverName, receiverEmail);
                    this.senderAppName = senderAppName;
                    this.receiverAppName = receiverAppName;
                    this.senderEmail = senderEmail;
                }

                function _getName(name, email) {
                    return name || email.split("@")[0];
                }
            }
        );
})(angular);
