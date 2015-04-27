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
|   |    |___ fluid-option.css
|   |__ js/
|   |    |___ fluid.js
|   |__ templates/
|        |___ fluid/
|             |─── fluidFrame.html
|             |─── fluidLoader.html
|             |─── fluidOption.html
|             |─── fluidPanel.html
|             |─── fluidTaskIcon.html
|             |___ fluidToolbar.html
|_ bower.json
|_ gruntfile.js
|_ index.html
|_ LICENSE.md
|_ package.json
|_ README.md

```
### Getting Started
- Add the following libraries to header:
```
<link href="bower_components/dist/css/fluid.min.css" rel="stylesheet">
<link href="bower_components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="docs/themes/yeti/bootstrap.min.css" rel="stylesheet">
<link href="bower_components/font-awesome/css/font-awesome.min.css" rel="stylesheet">
<link href="bower_components/animate.css/animate.min.css" rel="stylesheet">
<script src="bower_components/jquery/dist/jquery.min.js" type="text/javascript"></script>
<script src="bower_components/angular/angular.min.js" type="text/javascript"></script>
<script src="bower_components/angular-local-storage/dist/angular-local-storage.min.js"
            type="text/javascript"></script>
<script src="bower_components/oclazyload/dist/ocLazyLoad.min.js" type="text/javascript"></script>
<script src="bower_components/bootstrap/dist/js/bootstrap.js" type="text/javascript"></script>
<script src="bower_components/jquery.scrollTo/jquery.scrollTo.min.js" type="text/javascript"></script>
<script src="bower_components/angular-sanitize/angular-sanitize.min.js" type="text/javascript"></script>
<script src="bower_components/dist/js/fluid.js" type="text/javascript"></script>

```

- Import ```fluid``` module to your app:
```
  anuglar.module("mainApp",["fluid"])
```

- Add ```<fluid-frame></fluid-frame>``` to the body:
```
  <body>
    <fluid-frame></fluid-frame>
  </body>
  
```
Note: fluid-frame tag must be added only once to the body, fluid-web does not support multiple frame instances yet.

- Create a Task JSON file or a Javascript object:
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
-  Inject the ```fluidFrameService```:
```
   anuglar.module("mainApp",["fluid"])
            .run(["fluidFrameService",function(ffs){
               /*adds module json config here using url*/
              ffs.addTask("docs/module_basic/module_basic.json");
  }]);

```

### Demo
Coming very soon.
### Documentation
Coming very soon.

### Authors and Contributors
[Jerico de Guzman](@jsoftgem) - Senior Software Engineer.

### Support or Contact
[jerico@jsofttechnologies.com](@jsoftgem)
