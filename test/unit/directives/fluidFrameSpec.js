/**
 * Created by Jerico on 5/1/2015.
 */

describe("fluidFrame test", function () {
    var Frame;
    beforeEach(module("fluidFrame"));

    beforeEach(inject(function (_Frame_) {
        Frame = _Frame_;
    }));


    it("creates new instance of frame", function () {
        var frame = new Frame("frame1");
        expect(frame).toBeDefined();
    });

    it("gets the cached instance of frame and adds task instance", function () {
        var frame = new Frame("frame1");
        expect(frame.name).toBe("frame1");
        frame.tasks.push({id: "task1", name: "task1", title: "Sample Task"});
        console.log(frame);
        expect(frame.tasks.length).toBe(1);
    })



})





