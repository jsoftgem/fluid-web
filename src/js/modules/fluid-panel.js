/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPanel", ["oc.lazyLoad", "fluidHttp", "fluidFrame", "fluidMessage", "fluidOption", "fluidSession", "fluidTool", "fluidPage", "fluidTask", "fluidTaskcontrols", "fluidBreadcrumb", "fluidProgress"])
    .directive("fluidTaskIcon", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: false,
            link: function (scope, element, attr) {

                if (attr.height) {
                    scope.height = attr.height;
                }

                if (attr.width) {
                    scope.width = attr.width;
                }
            },
            template: tc.get("templates/fluid/fluidTaskIcon.html"),
            replace: true
        }
    }])
    .directive("fluidLoader", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: false,
            template: tc.get("templates/fluid/fluidLoader.html"),
            replace: true
        }
    }])
    .directive("fluidPanel", ["$templateCache", "FluidPanel", "fluidToolbarService", "$ocLazyLoad", "$compile", "fluidPanelService", "fluidFrameService", "$viewport", "$window",
        "$anchorScroll", "$location", "FluidProgress",
        function (tc, FluidPanel, ftb, oc, c, fluidPanelService, FluidFrame, v, window, a, l, FluidProgress) {
            return {
                scope: {task: "=", frame: "@"},
                restrict: "E",
                replace: true,
                template: tc.get("templates/fluid/fluidPanel.html"),
                link: {
                    pre: function (scope) {
                        scope.getTaskClass = function () {
                            if (scope.task) {
                                var match = scope.task.name.match(/[A-Z]/g);
                                if (match) {
                                    var classedTaskName = scope.task.name.replace(match, "-" + match[0].toLowerCase());
                                    return classedTaskName;
                                } else {
                                    return scope.task.name;
                                }
                            }
                        };
                        scope.$on("$destroy", function () {
                            console.debug("fluidPanel.$destroy", scope.fluidPanel);
                            if (scope.fluidPanel) {
                                scope.fluidPanel.clear();
                                scope.fluidPanel.frame.fluidPanel[scope.fluidPanel.id] = undefined;
                            }
                        });
                        scope.fluidFrame = new FluidFrame(scope.frame);
                        scope.fluidTask = {};
                        scope.viewport = v.view;
                        $(window).on("resize", function () {
                            console.debug("fluid-panel.viewport", v);
                            scope.setViewport();
                        });

                        scope.setViewport = function () {
                            if (!v.is(scope.viewport)) {
                                if (scope.fluidPanel) {
                                    scope.fluidPanel.onViewportChange(v.view);
                                }
                                scope.viewport = v.view;
                            }
                        };
                        scope.loaded = function (fluidPanel) {
                            console.debug("fluidPanel-loaded.fluidPanel", fluidPanel);
                            if (fluidPanel.loaders) {
                                console.debug("fluidPanel-fluidPanel2.fluidPanel.loaders", scope.fluidPanel.loaders);
                                angular.forEach(fluidPanel.loaders, function (load, $index) {
                                    load(this);
                                    this.loaders.splice($index, 1);
                                    if (this.loaders.length === 0) {
                                        fluidPanel.loaded = true;
                                    }
                                }, fluidPanel);
                            }
                        };
                        scope.load = function (ok, cancel, notify) {
                            console.debug("fluidPanel.load");
                            notify("Creating panel...", "info", 1);
                            scope.fluidPanel = undefined;
                            if (scope.task.lazyLoad) {
                                var pathArr = undefined;
                                if (scope.task.moduleFiles.indexOf(",") > 0) {
                                    pathArr = scope.task.moduleFiles.split(",");
                                }

                                var files = [];
                                if (pathArr) {
                                    for (var i = 0; i < pathArr.length; i++) {
                                        files.push(pathArr[i]);
                                    }
                                } else {
                                    files.push(scope.task.moduleFiles);
                                }

                                oc.load({
                                    name: scope.task.moduleJS,
                                    files: files,
                                    cache: true
                                }).then(function () {
                                    scope.fluidPanel = new FluidPanel(scope.task);
                                    scope.fluidPanel.frame = new FluidFrame(scope.frame);
                                    ok(scope.task);
                                    console.debug("fluidPanel.load-1");
                                    console.debug("fluidPanel.load-1.frame", scope.fluidPanel.frame);
                                });
                            } else {
                                scope.fluidPanel = new FluidPanel(scope.task);
                                ok(scope.task);
                                console.debug("fluidPanel.load-2");
                            }
                        };
                        scope.setSize = function (size) {
                            console.debug("fluidPanel2-setSize.size", size);
                            switch (size) {
                                case 25:
                                    scope.size = "col-lg-3";
                                    break;
                                case 50:
                                    scope.size = "col-lg-6";
                                    break;
                                case 75:
                                    scope.size = "col-lg-9";
                                    break;
                                case 100:
                                    scope.size = "col-lg-12";
                                    break;
                                default:
                                    scope.size = "col-lg-12";
                            }
                        }
                        scope.$watch(function (scope) {
                            if (scope.task) {
                                return scope.task.size;
                            }
                        }, function (newSize, oldSize) {
                            if (scope.fluidPanel) {
                                scope.fluidPanel.onSizeChange(newSize);
                            }
                            scope.setSize(newSize);
                        });
                    },
                    post: function (scope) {

                        scope.getElementFlowId = function (id) {
                            if (scope.fluidPanel) {
                                return id + "_" + scope.fluidPanel.id;
                            } else {
                                return id + "_" + scope.task.fluidId;
                            }
                        }
                        var frame = new FluidFrame(scope.frame);
                        scope.progress = new FluidProgress({id: "_id_fp_mp_" + scope.task.fluidId});
                        scope.progress.run("fluidPanelLoader", scope.load, {
                            max: 1,
                            min: 0,
                            sleep: 1000
                        });
                        if (frame) {
                            frame.progress.onComplete("switchTask", function (task) {
                                var panel = task.panel();
                                var fluidPanel = new FluidPanel(task);
                                if (panel) {
                                    var panelScope = angular.element(panel).scope();
                                    if (panelScope) {
                                        fluidPanel.progress.run("fluidPanelLoader", panelScope.load, {
                                            max: 1,
                                            min: 0,
                                            sleep: 1000
                                        });
                                    }
                                }
                            });
                        }
                        scope.progress.onComplete("fluidPanelLoader", function (task) {
                            console.debug("progress.onComplete-fluidPanelLoader.task", task);
                            var fluidPanel = new FluidPanel(task);
                            scope.loaded(fluidPanel);
                            task.load(task.ok, task.cancel);
                        });
                        scope.collapsePanel = function () {
                            scope.task.collapsed = !scope.task.collapsed;
                            $("#_id_fp_mp_" + scope.task.fluidId + "_progress").collapse("toggle");
                        }

                    }
                }
            }

        }])
    .directive("id", [function () {
        return {
            restrict: "A",
            scope: false,
            link: function (scope, element, attr) {

                var id = element.attr("id");

                if (scope.task) {
                    if (id && id.indexOf(scope.task.fluidId) > -1) {

                    } else {
                        element.attr("id", attr.id + "_" + scope.task.fluidId)
                    }

                }
                else if (scope.fluidPanel) {
                    if (id && id.indexOf(scope.fluidPanel.id) > -1) {

                    } else {
                        element.attr("id", attr.id + "_" + scope.fluidPanel.id)
                    }

                }
            }
        }
    }])
    .factory("FluidPanel", ["TaskControl", "ToolBarItem", "fluidTaskService", "FluidBreadcrumb", "FluidPage", "$q", "fluidFrameService", "FluidProgress", "FluidMessage", "$timeout", "fluidPageService",
        function (TaskControl, ToolBarItem, TaskService, FluidBreadcrumb, FluidPage, q, FluidFrame, FluidProgress, FluidMessage, t, fps) {
            var fluidPanel = function (task) {
                console.debug("fluidPanel-FluidPanelModel.task", task);
                if (!task.frame) {
                    throw "Task must have frame property value.";
                }

                var frame = new FluidFrame(task.frame);
                if (!frame.fluidPanel) {
                    frame.fluidPanel = [];
                }
                if (frame.fluidPanel[task.fluidId] != null) {
                    return frame.fluidPanel[task.fluidId];
                }
                else {
                    console.debug("fluidPanel-FluidPanelModel.new", task);

                    var panel = this;
                    this.breadcrumbs = [];
                    this.frame = frame;
                    this.task = task;
                    this.pages = [];
                    this.id = task.fluidId;
                    this.getElementFlowId = function (id) {
                        return id + "_" + this.id;
                    };
                    this.$ = function () {
                        return $("#_id_fp_" + this.id);
                    };
                    this.$scope = function () {
                        return angular.element(this.$()).scope();
                    };
                    this.progress = new FluidProgress({id: this.getElementFlowId("_id_fp_mp")});
                    this.goTo = function (name, $event, option) {
                        var pg = this.pages[name];
                        if (pg != null) {
                            initOption(option, pg);
                            var fluidBreadcrumb = new FluidBreadcrumb(this);
                            var currentPage = this.pages[fluidBreadcrumb.currentPage()];
                            if (currentPage != null) {
                                currentPage.change(function () {
                                    fluidBreadcrumb.addPage(pg)
                                    loadPage(panel);
                                }, function () {
                                    //TODO: parent cancellation handling
                                }, $event);
                            } else {
                                fluidBreadcrumb.addPage(pg);
                                loadPage(panel);
                            }
                        } else {
                            angular.forEach(task.pages, function (page) {
                                if (page.name === name) {
                                    page.fluidId = panel.id;
                                    page.host = task.host;
                                    var fluidPage = new FluidPage(page);
                                    fluidPage.isNew = true;
                                    initOption(option, fluidPage);
                                    var fluidBreadcrumb = new FluidBreadcrumb(this);
                                    var currentPage = this.pages[fluidBreadcrumb.currentPage()];
                                    this.pages[name] = fluidPage;
                                    if (currentPage != null) {
                                        currentPage.change(function () {
                                            fluidBreadcrumb.addPage(page);
                                            loadPage(panel);
                                        }, function () {
                                            //TODO: parent cancellation handling
                                        }, $event);
                                    } else {
                                        fluidBreadcrumb.addPage(page);
                                        loadPage(panel);
                                    }


                                }
                            }, this);
                        }
                    };
                    this.getPage = function (name) {
                        return this.pages[name];
                    };
                    this.prevPage = function ($event) {
                        var fluidBreadcrumb = new FluidBreadcrumb(this);
                        var page = this.pages[fluidBreadcrumb.currentPage()];
                        page.change(function () {
                            fluidBreadcrumb.previous();
                            loadPage(panel);
                        }, function () {
                            //TODO: parent cancellation handling
                        }, $event);
                    };
                    this.nextPage = function ($event) {
                        var fluidBreadcrumb = new FluidBreadcrumb(this);
                        var page = this.pages[fluidBreadcrumb.currentPage()];
                        page.change(function () {
                            fluidBreadcrumb.next();
                            loadPage(panel);
                        }, function () {
                            //TODO: parent cancellation handling
                        }, $event);
                    };
                    this.addControl = function (control) {
                        if (!this.controls) {
                            this.controls = [];
                        }
                        control.fluidPanel = this;
                        addItem(control, this.controls);
                    };
                    this.addToolbarItem = function (toolbarItem) {
                        if (!this.toolbarItems) {
                            this.toolbarItems = [];
                        }
                        toolbarItem.fluidPanel = this;
                        addItem(toolbarItem, this.toolbarItems);
                    };

                    if (!task.page) {
                        if (task.pages) {
                            angular.forEach(task.pages, function (page) {
                                if (page.isHome) {
                                    this.goTo(page.name);
                                }
                            }, this);
                        }
                    } else {
                        if (task.pages) {
                            angular.forEach(task.pages, function (page) {
                                if (task.page === page.name) {
                                    this.goTo(page.name);
                                }
                            }, this);
                        }
                    }

                    var closeControl = new TaskControl(this);
                    closeControl.setId("closeControl");
                    closeControl.glyph = "fa fa-close";
                    closeControl.uiClass = "btn btn-danger";
                    closeControl.label = "Close";
                    closeControl.action = function (task, $event) {
                        console.debug("fluidPanel-fluidPanelModel-close.fluidPanel", this.fluidPanel);
                        this.fluidPanel.close(task, $event);
                    };
                    closeControl.visible = function () {
                        return task.closeable === undefined || task.closeable === true;
                    };
                    this.addControl(closeControl);

                    var expandControl = new TaskControl();
                    expandControl.setId("expandControl");
                    expandControl.glyph = "fa fa-expand";
                    expandControl.uiClass = "btn btn-info";
                    expandControl.label = "Fullscreen";
                    expandControl.action = function (task, $event) {
                        panel.onFullscreen(function () {
                            panel.destroy = true;
                            panel.frame.toggleFullscreen(task);
                        }, function () {

                        })

                    };
                    expandControl.visible = function () {
                        return !this.fluidPanel.frame.fullScreen;
                    };
                    this.addControl(expandControl);

                    var fluidScreenControl = new TaskControl();
                    fluidScreenControl.setId("fluidControl");
                    fluidScreenControl.glyph = "fa fa-compress";
                    fluidScreenControl.uiClass = "btn btn-info";
                    fluidScreenControl.label = "Fluid";
                    fluidScreenControl.action = function (task, $event) {
                        panel.onFluidscreen(function () {
                            panel.destroy = true;
                            panel.frame.toggleFullscreen(task);
                        }, function () {

                        });
                    };
                    fluidScreenControl.visible = function () {
                        return this.fluidPanel.frame.fullScreen;
                    };
                    this.addControl(fluidScreenControl);

                    var minimizeControl = new TaskControl()
                    minimizeControl.setId("minimizePanel");
                    minimizeControl.glyph = "fa fa-caret-down";
                    minimizeControl.uiClass = "btn btn-info";
                    minimizeControl.label = "Minimize";
                    minimizeControl.action = function (task, $event) {
                        task.active = false;
                    };
                    minimizeControl.visible = function () {
                        return !this.fluidPanel.frame.fullScreen;
                    };
                    this.addControl(minimizeControl);


                    if (task.controls) {
                        angular.forEach(task.controls, function (control) {
                            var id = control.id;
                            var newControl = new TaskControl();
                            newControl.action = control.action;
                            newControl.uiClass = control.uiClass;
                            newControl.glyph = control.glyph;
                            newControl.class = control.class;
                            newControl.disabled = control.disabled;
                            newControl.visible = control.visible;
                            newControl.label = control.label;
                            newControl.setId(id);
                            this.addControl(newControl);
                        }, this);
                    }

                    var homeToolBarItem = new ToolBarItem();
                    homeToolBarItem.setId("homeToolbarItem");
                    homeToolBarItem.glyph = "fa fa-home";
                    homeToolBarItem.uiClass = "btn btn-info";
                    homeToolBarItem.label = "Home";
                    homeToolBarItem.action = function (task, $event) {
                        if (task.pages) {
                            angular.forEach(task.pages, function (page) {
                                if (page.isHome) {
                                    this.goTo(page.name, $event);
                                }
                            }, this.fluidPanel);
                        }
                    };

                    homeToolBarItem.setId("home_pnl_tool");
                    homeToolBarItem.visible = function () {
                        var breadcrumb = this.fluidPanel.fluidBreadcrumb;
                        var current = this.fluidPanel.pages[breadcrumb.currentPage()];
                        var firstPage = this.fluidPanel.pages[breadcrumb.pages[0]];
                        return (firstPage && firstPage.isHome) && (current && !current.isHome);
                    };
                    this.addToolbarItem(homeToolBarItem);

                    var backToolBarItem = new ToolBarItem();
                    backToolBarItem.setId("backToolBarItem");
                    backToolBarItem.glyph = "fa fa-arrow-left";
                    backToolBarItem.uiClass = "btn btn-info";
                    backToolBarItem.label = "Back";
                    backToolBarItem.action = function (task, $event) {
                        this.fluidPanel.prevPage($event);
                    };
                    backToolBarItem.visible = function () {
                        var fluidBreadcrumb = new FluidBreadcrumb(this.fluidPanel);
                        return !fluidBreadcrumb.hasPrevious();
                    };
                    backToolBarItem.disabled = function () {
                        var fluidBreadcrumb = new FluidBreadcrumb(this.fluidPanel);
                        return !fluidBreadcrumb.hasPrevious();
                    };
                    backToolBarItem.setId("back_pnl_tool");
                    this.addToolbarItem(backToolBarItem);

                    var nextToolBarItem = new ToolBarItem();
                    nextToolBarItem.setId("nextToolBarItem");
                    nextToolBarItem.glyph = "fa fa-arrow-right";
                    nextToolBarItem.uiClass = "btn btn-info";
                    nextToolBarItem.label = "Next";
                    nextToolBarItem.action = function (task, $event) {
                        this.fluidPanel.nextPage($event);
                    };
                    nextToolBarItem.visible = function () {
                        var fluidBreadcrumb = new FluidBreadcrumb(this.fluidPanel);
                        return !fluidBreadcrumb.hasNext();
                    };
                    nextToolBarItem.disabled = function () {
                        var fluidBreadcrumb = new FluidBreadcrumb(this.fluidPanel);
                        return !fluidBreadcrumb.hasNext();
                    };
                    nextToolBarItem.setId("next_pnl_tool");
                    this.addToolbarItem(nextToolBarItem);


                    /*var undoToolBarItem = new ToolBarItem();
                     undoToolBarItem.glyph = "fa fa-undo";
                     undoToolBarItem.uiClass = "btn btn-warning";
                     undoToolBarItem.label = "Unso";
                     undoToolBarItem.action = function (task, $event) {
                     this.fluidPanel.nextPage($event);
                     };
                     undoToolBarItem.disabled = function () {
                     var currentPage = this.fluidPanel.currentPage();
                     var fluidState = fps.fluidPageState(currentPage.name, this.fluidPanel.id);
                     return fluidState.$currentState === 0;
                     };
                     undoToolBarItem.visible = function () {
                     var currentPage = this.fluidPanel.currentPage();
                     var fluidState = fps.fluidPageState(currentPage.name, this.fluidPanel.id);
                     return fluidState.$currentState > 0;
                     };
                     undoToolBarItem.setId("undo_pnl_tool");
                     this.addToolbarItem(undoToolBarItem);*/


                    var refreshToolBarItem = new ToolBarItem();
                    refreshToolBarItem.setId("refreshToolBarItem");
                    refreshToolBarItem.glyph = "fa fa-refresh";
                    refreshToolBarItem.uiClass = "btn btn-success";
                    refreshToolBarItem.label = "Refresh";
                    refreshToolBarItem.action = function (task, $event) {
                        var page = this.fluidPanel.getPage(this.fluidPanel.fluidBreadcrumb.currentPage());
                        page.refresh(page.$scope().loadPage,
                            function () {
                            }, $event);
                    };
                    refreshToolBarItem.setId("refresh_pnl_tool");
                    this.addToolbarItem(refreshToolBarItem);

                    if (task.toolbarItems) {
                        angular.forEach(task.toolbarItems, function (toolbarItem) {
                            var newToolbarItem = new ToolBarItem();
                            newToolbarItem.setId(toolbarItem.id);
                            newToolbarItem.type = toolbarItem.type;
                            newToolbarItem.glyph = toolbarItem.glyph;
                            newToolbarItem.class = toolbarItem.class;
                            newToolbarItem.uiClass = toolbarItem.uiClass;
                            newToolbarItem.label = toolbarItem.label;
                            newToolbarItem.action = toolbarItem.action;
                            newToolbarItem.showText = toolbarItem.showText;
                            newToolbarItem.disabled = toolbarItem.disabled;
                            newToolbarItem.visible = toolbarItem.visible;
                            this.addToolbarItem(newToolbarItem);
                        }, this);
                    }

                    if (task.resource) {
                        task.resource.$get({fluidId: task.fluidId}, function (taskResource) {
                            panel.resource = taskResource;
                        });
                    }
                    this.fluidBreadcrumb = new FluidBreadcrumb(this);
                    this.fluidBreadcrumb.close = function (page, $index, $event) {
                        var previous = this.current;
                        this.current = $index;
                        var breadcrumb = this;
                        var pages = this.pages;
                        var fluidPage = panel.getPage(page);
                        fluidPage.option.returnToPrevious = function () {
                            breadcrumb.current = previous;
                        };
                        fluidPage.close(function (data) {
                            pages.splice($index, 1);
                            if (breadcrumb.current > $index) {
                                breadcrumb.current -= 1;
                            } else if (breadcrumb.current === $index) {
                                breadcrumb.current -= 1;
                            }
                            loadPage(panel);
                        }, function () {
                            breadcrumb.current = previous;
                        }, $event);
                    };
                    this.fluidBreadcrumb.open = function (page, $index, $event) {
                        panel.goTo(page, $event);
                    };

                    this.close = function (task, $event, item) {
                        function closePage($index, fluidPanel) {
                            var breadcrumb = fluidPanel.fluidBreadcrumb;
                            var bPages = fluidPanel.fluidBreadcrumb.pages;
                            var pages = fluidPanel.pages;
                            var reversedPages = [];
                            angular.copy(bPages, reversedPages);
                            reversedPages.reverse();
                            var $length = reversedPages.length;
                            var pageName = reversedPages[$index];
                            var $bIndex = bPages.indexOf(pageName);
                            var previous = breadcrumb.current;
                            breadcrumb.current = $bIndex;

                            console.debug("fluidPanel-FluidPanelModel-closePage.$index", $index);
                            console.debug("fluidPanel-FluidPanelModel-closePage.$bIndex", $bIndex);
                            console.debug("fluidPanel-FluidPanelModel-closePage.$bIndex", previous);

                            var fluidPage = fluidPanel.getPage(pageName);

                            console.debug("fluidPanel-FluidPanelModel-closePage.fluidPage", fluidPage);

                            if ($index < $length) {
                                fluidPage.close(function (data) {
                                    if ($bIndex === 0) {
                                        task.close(function () {
                                            panel.frame.closeTask(task);
                                            panel.destroy = true;
                                            panel.clear();
                                            if (item) {
                                                item.count--;
                                            }
                                        }, function () {

                                        });

                                    } else {
                                        bPages.splice($bIndex, 1);
                                        if (breadcrumb.current > $bIndex) {
                                            breadcrumb.current -= 1;
                                        } else if (breadcrumb.current === $bIndex) {
                                            breadcrumb.current -= 1;
                                        }
                                        closePage($index, fluidPanel);
                                    }
                                }, function () {
                                    breadcrumb.current = previous;
                                }, $event);

                            } else {
                                task.active = false;
                            }
                        }

                        closePage(0, this);
                    };
                    this.clear = function () {
                        this.pages = [];
                        this.fluidBreadcrumb.pages = [];
                        this.progress.clear();
                        this.breadcrumbs = [];
                    };
                    this.onLoad = function (loadedAction) {
                        if (!this.loaders) {
                            this.loaders = [];
                        }
                        if (this.loaded) {
                            loadedAction(this);
                        }

                        this.loaders.push(loadedAction);
                    };
                    this.onViewportChange = function (port) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        console.debug("fluidPanel-fluidPanelModel-onViewportChange.fluidBreadcrumb.currentPage", this.fluidBreadcrumb.currentPage());
                        console.debug("fluidPanel-fluidPanelModel-onViewportChange.page", page);
                        if (page) {
                            page.onViewportChange(port);
                        }
                    };
                    this.onSizeChange = function (size) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        if (page) {
                            page.onSizeChange(size);
                        }
                    };
                    this.onFullscreen = function (ok, cancel) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        if (page) {
                            page.fullscreen(
                                function () {
                                    ok();
                                },
                                function () {
                                    cancel();
                                }
                            );
                        }
                    };
                    this.onFluidscreen = function (ok, cancel) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        if (page) {
                            page.fluidscreen(
                                function () {
                                    ok();
                                },
                                function () {
                                    cancel();
                                }
                            );
                        }
                    };
                    this.message = function (duration) {
                        if (!duration) {
                            duration = 3000;
                        }

                        var fluidMessage = new FluidMessage(this, {
                                template: "_id_fp_msg",
                                duration: duration
                            }
                        );
                        this.$scope().fluidMessage = fluidMessage;

                        return {
                            info: function (message, $event) {
                                fluidMessage.info(message).open($event);
                            },
                            warning: function (message, $event) {
                                fluidMessage.warning(message).open($event);
                            },
                            danger: function (message, $event) {
                                fluidMessage.danger(message).open($event);
                            },
                            success: function (message, $event) {
                                fluidMessage.success(message).open($event);
                            }

                        }
                    };
                    this.currentPage = function () {
                        return this.pages[this.fluidBreadcrumb.currentPage()];
                    };
                    this.$destroy = function () {
                        if (this.destroy) {
                            this.clear();
                            this.frame.fluidPanel[this.id] = undefined;
                        }
                    };
                    frame.fluidPanel[this.id] = this;
                    return this;
                }
            };
            return fluidPanel;
        }])
    .service("fluidPanelService", ["$timeout", function (t) {
        this.fluidPanels = [];
        this.clear = function (id) {
            var fluidPanel = this.fluidPanels[id];
            if (fluidPanel) {
                fluidPanel.clear();
            }
            this.fluidPanels[id] = null;

        };
        var fluidPanel = this.fluidPanels;

        function check() {
            console.debug("fluidPanel-fluidPanelService.fluidPanel", fluidPanel);
            t(check, 1000);
        }

        return this;
    }]);

