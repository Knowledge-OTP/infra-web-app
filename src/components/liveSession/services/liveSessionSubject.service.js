(function (angular) {
    'use strict';


    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionSubjectSrv', function (LiveSessionSubjectConst) {
        'ngInject';
        // default topics. every APP infra suppose to setLiveSessionTopics of there own
        let topics = [LiveSessionSubjectConst.MATH, LiveSessionSubjectConst.ENGLISH, LiveSessionSubjectConst.SCIENCE];

        this.setLiveSessionTopics = (_topics) => {
            if (angular.isArray(_topics) && _topics.length) {
                topics = _topics;
            }
        };

        this.$get = function (UtilitySrv, MyZinkerzTopicMapEnum) {

            let LiveSessionSubjectSrv = {};

            // return topic obj from LiveSessionSubjectConst (infra)
            LiveSessionSubjectSrv.getLiveSessionTopics = () => {
                return topics.map(function (topicId) {
                    let topicName = UtilitySrv.object.getKeyByValue(LiveSessionSubjectConst, topicId).toLowerCase();
                    return {
                        id: topicId,
                        name: topicName,
                        iconName: 'liveSession-' + topicName + '-icon'
                    };
                });
            };

            // handel the diff between the old subject enum and the new topic enum from my zinkerz app
            LiveSessionSubjectSrv.getSessionSubject = (lessonData) => {
                if (lessonData.sessionSubject) {
                    return lessonData.sessionSubject.id;
                } else {

                    let topicIdNum = MyZinkerzTopicMapEnum[lessonData.scheduledLesson.topicId.toUpperCase()].enum;
                    if (angular.isDefined(topicIdNum)) {
                        return topicIdNum;
                    } else {
                        throw new Error('Error: getSessionSubject: subjectId/topicId is undefined!');
                    }
                }
            };

            return LiveSessionSubjectSrv;
        };
    });
})(angular);
