/**
 * Created by jerico on 4/30/2015.
 */
'use strict';


describe("Managing task state", function () {

    var fluidStateService;

    beforeEach(module("fluidTask"));


    beforeEach(inject(function (_fluidStateService_) {
        fluidStateService = _fluidStateService_;
    }));

    it("it should get the task and cache the base task", function () {

        var moduleBasic = fluidStateService.getTask("docs/module_basic/module_basic.json");

        expect(moduleBasic.name).toBe("module_basic");
    });


});