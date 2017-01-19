(function (angular) {
    'use strict';


    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionSubjectSrv', function (LiveSessionSubjectConst) {
        var topics = [LiveSessionSubjectConst.MATH, LiveSessionSubjectConst.ENGLISH];

        this.setLiveSessionTopics = function(_topics) {
            if (angular.isArray(_topics) && _topics.length) {
                topics = _topics;
            }
        };

        this.$get = function (UtilitySrv, SessionSubjectEnum) {
            'ngInject';

            var LiveSessionSubjectSrv = {};

            function _getLiveSessionTopics() {
                return topics.map(function (topicId) {
                    var topicName = SessionSubjectEnum.getValByEnum(topicId);
                    return {
                        id: topicId,
                        name: topicName,
                        iconName: 'liveSession-' + topicName + '-icon'
                    };
                });
            }

            LiveSessionSubjectSrv.getLiveSessionTopics = _getLiveSessionTopics;

            return LiveSessionSubjectSrv;
        };
    });
})(angular);
