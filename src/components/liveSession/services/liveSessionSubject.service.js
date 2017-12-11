(function (angular) {
    'use strict';


    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionSubjectSrv', function (LiveSessionSubjectConst) {
        'ngInject';
        let topics = [LiveSessionSubjectConst.MATH, LiveSessionSubjectConst.ENGLISH];

        this.setLiveSessionTopics = (_topics) => {
            if (angular.isArray(_topics) && _topics.length) {
                topics = _topics;
            }
        };

        this.$get = function (UtilitySrv, MyZinkerzTopicMapEnum) {

            let LiveSessionSubjectSrv = {};

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

            LiveSessionSubjectSrv.getSessionSubject = (lessonData) => {
                console.log('_getSessionSubject lessonData : ', lessonData);
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
