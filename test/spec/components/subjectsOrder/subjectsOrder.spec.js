describe('testing service "SubjectsSrv"', function(){
    'use strict';

    var SubjectsSrv, TestUtilitySrv, actions;
    
    //Modules
    beforeEach(module('znk.infra-web-app.subjectsOrder', 'testUtility'));

    //Providers
    beforeEach(module(function (SubjectsSrvProvider) {

        var arrFunc = function(){
            return [3,4,5];
        };
 
        SubjectsSrvProvider.setSubjectOrder(arrFunc);

    }));

    //Injections
    beforeEach(inject(
        function ($injector) {
            SubjectsSrv = $injector.get('SubjectsSrv');
            TestUtilitySrv = $injector.get('TestUtilitySrv');

            actions = TestUtilitySrv.general.convertAllAsyncToSync(SubjectsSrv);
        }
    ));

    it('test getSubjectOrder returns the required array', function () {
        var result = actions.getSubjectOrder();
        expect(result.length).toBe(3);
        expect(result[0]).toBe(3);
    });
})