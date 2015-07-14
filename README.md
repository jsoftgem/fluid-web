# What is Fluid-web?
Fluid-web is an intuitive and powerful framework for developing portlet applications with AngularJs.

## Quick start
```
bower install -g fluid-web
```
## Building Fluid-web
- [Grunt:](http://gruntjs.com/) We use Grunt as our build system. 
- To install dependencies run ``` npm install -g ```
- To build the project run ``` npm package ```

### What's Included
Within the download you'll find the following directories and files, logically grouping common assets and providing both compiled and minified variations. You'll see something like this:
```
fluid-web/
|_ dist/
|   |__ css/
|   |    |─── fluid.css
|   |    |___ fluid.min.css    
|   |__ js/
|   |    |─── fluid.js
|   |    |___ fluid.min.js
|   |__ fluid-web-x.x.x.zip
|_ docs/
|_ src/
|   |__ css/
|   |    |─── fluid.css
|   |    |___ fluid-breadbrumb.css
|   |    |___ fluid-message.css
|   |    |___ fluid-option.css
|   |    |___ fluid-page.css
|   |    |___ fluid-panel.css
|   |    |___ fluid-progress.css
|   |    |___ fluid-task.css
|   |    |___ fluid-tascontrols.css
|   |    |___ fluid-toolbar.css
|   |   
|   |__ js/
|   |    |___ modules/
|   |    |    |─── fluid-breadcrumb.js
|   |    |    |─── fluid-factories.js
|   |    |    |─── fluid-frame.js
|   |    |    |─── fluid-http.js
|   |    |    |─── fluid-message.js
|   |    |    |─── fluid-option.js
|   |    |    |─── fluid-page.js
|   |    |    |___ fluid-panel.js
|   |    |    |___ fluid-session.js
|   |    |    |___ fluid-task.js
|   |    |    |___ fluid-taskcontrols.js
|   |    |    |___ fluid-tool.js
|   |    |___ fluid.js
|   |    |___ util.js
|   |__ templates/
|        |___ fluid/
|             |─── fluidBreadcrumb.html
|             |─── fluidFrame.html
|             |─── fluidFrameNF.html
|             |─── fluidLoader.html
|             |─── fluidOption.html
|             |___ fluidPage.html
|             |___ fluidPanel.html
|             |___ fluidProgress.html
|             |___ fluidTaskcontrols.html
|             |___ fluidTaskIcon.html
|             |___ fluidToolbar.html
|_ bower.json
|_ gruntfile.js
|_ index.html
|_ LICENSE.md
|_ package.json
|_ README.md

```
### Getting Started
-  Prerequisite libraries:
```
    <link href="bower_components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="bower_components/font-awesome/css/font-awesome.min.css" rel="stylesheet">
    <link href="bower_components/animate.css/animate.min.css" rel="stylesheet">
    <script src="bower_components/jquery/dist/jquery.js" type="text/javascript"></script>
    <script src="bower_components/angular/angular.js" type="text/javascript"></script>
    <script src="bower_components/angular-resource/angular-resource.js" type="text/javascript"></script>
    <script src="bower_components/angular-local-storage/dist/angular-local-storage.min.js"
            type="text/javascript"></script>
    <script src="bower_components/oclazyload/dist/ocLazyLoad.min.js" type="text/javascript"></script>
    <script src="bower_components/bootstrap/dist/js/bootstrap.js" type="text/javascript"></script>
    <script src="bower_components/jquery.scrollTo/jquery.scrollTo.js" type="text/javascript"></script>

```

- Import ```fluid``` module to your app:
```
  anuglar.module("mainApp",["fluid"])
```

- Add ```<fluid-frame name='mainFrame'></fluid-frame>``` to the body:
```
  <body>
    <fluid-frame name='mainFrame'></fluid-frame>
  </body>
  
```
Note: fluid-frame supports multiple instances so you need to specify a unique name each fluid-frame tag.

- Create task json file or javascript object:
```
  //docs/module_basic/module_basic.json
  {
  "id": "moduleBasic",
  "name": "module_basic",
  "title": "Basic - Locked",
  "size": 100,
  "glyph": "fa fa-gears",
  "useImg": true,
  "imgSrc": "docs/module_basic/icon.png",
  "active": true,
  "locked": false,
  "closeable": false,
  "showToolBar": false
  }
```

- Add a static page:
```
 {
  "id": "moduleBasic",
  "name": "module_basic",
  "title": "Basic - Locked",
  "size": 100,
  "glyph": "fa fa-gears",
  "useImg": true,
  "imgSrc": "docs/module_basic/icon.png",
  "active": true,
  "locked": false,
  "closeable": false,
  "showToolBar": false,
  "pages":[
     {
     "id": 1,
      "name": "page1",
      "title": "Home",
      "static": true,
      "html":"<div class='jumbotron'><h1>Welcome to fluid-web!</h1><p>This is a static page.</p><div>",
      "isHome":true
     }
   ]
  }
```
Note: One home page (isHome=true) only is required.


- Set the task in config using taskStateProvider:
```
angular.module("mainApp", ["fluid"])
    .config(["taskStateProvider", function (tsp) {

        tsp.setTasks([
            {
                name: "moduleBasic",
                url: "docs/module_basic/module_basic.json"
            },
            {
                name: "moduleTaskConfig",
                url: "docs/module_task_config/module_task_config.json"
            }
        ]);

    }]);
    
```

- Open a task using FluidFrameService:
```
   app.controller(["$scope","fluidFrameService"], function(scope, FluidFrameService){
       var fluidFrame = new FluidFrameService('mainFrame');
       fluidFrame.openTask("moduleTaskConfig");
   });
```

### Demo
Coming very soon.
### Documentation
Coming very soon.

### Authors and Contributors
[Jerico de Guzman](@jsoftgem) - Senior Software Engineer.

### Support or Contact
[jerico@jsofttechnologies.com](@jsoftgem)


