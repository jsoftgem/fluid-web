angular.module("module1", ["fluid"])
    .controller("module1Ctrl", ["$scope", function (s) {

        s.fluid.controls = [{
            "id": 'new',
            "glyph": "fa fa-plus",
            "label": "New Person",
            "disabled": false,
            "uiType": "info",
            "action": function (event) {
                console.info("control-new", event);
            },
            "pages": "page1"
        }
        ];
        s.task.page.load = function (data) {
            s.data = data;
        }

        s.selectPerson = function (person) {
            s.task.selectedPerson = person;
            s.fluid.goTo("page2");
        }

        s.sample = "hello";


    }]);