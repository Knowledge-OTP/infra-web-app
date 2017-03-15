xdescribe('testing service "TutorialsSrv"', function(){
    'use strict';

    var TutorialsSrv;
    
    beforeEach(module('znk.infra-web-app.tutorials',
 		'znk.infra.enum',
 		'znk.infra.storage',
        'znk.infra.config',
        'znk.infra.general',
        'znk.infra.svgIcon',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.completeExercise',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.loadingAnimation',
        'znk.infra.exerciseResult',
        'znk.infra.contentAvail',
        'znk.infra.contentGetters',
        'znk.infra.exerciseUtility',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.subjectsOrder',
        'env.mock',
        'storage.mock',
        'user.mock')
    );

    beforeEach(module(function (SubjectsSrvProvider, ContentAvailSrvProvider) {

        var arrFunc = function(){
            return [3,4,5];
        };
 
        SubjectsSrvProvider.setSubjectOrder(arrFunc);

        ContentAvailSrvProvider.setSpecials(null);

    }));

    beforeEach(inject(
        function ($injector) {
            TutorialsSrv = $injector.get('TutorialsSrv');
            TestUtilitySrv = $injector.get('TestUtilitySrv');

            actions = TestUtilitySrv.general.convertAllAsyncToSync(TutorialsSrv);
        }
    ));


    // 'znk.infra.storage', 'htmlTemplates', 'storage.mock', 'testUtility', 'user.mock', 'env.mock'));

    

    it('dummy', function () {
        expect(true).toBeTruthy();
    });
})