'use strict';

/* Controllers */

//将apkmarket.controllers注册到angular
var controllers = angular.module("apkmarket.controllers", ['ui.bootstrap']);

controllers.controller('HomeController', function HomeController($scope, $http, apiHost) {
    $scope.navigator = '控制台';

    $scope.ClearCache = function () {
        $http.get(apiHost + 'cache/clear').success(function (response) {
            if (response.returnData == "ok") {
                alert('清除缓存成功!');
            }
        });
    }
})

controllers.controller('TopicController',
    function TopicController($scope, $route, $modal, $http, host, Topic, TopicTypes) {

        $scope.navigator = '专题管理';

        Topic.query(function (response) {
            $scope.topics = response ? response : [];
            $scope.selectTopics = $scope.topics;
        });

        $scope.SelectTopics = function (position) {
            if (position === null) {
                $scope.selectTopics = $scope.topics;
            } else {
                $scope.selectTopics = $scope.topics.filter(function (topic) {
                    return topic.topicPosition.id === position.id;
                })
            }
        };

        $scope.editTopic = new Topic();

        //编辑专题类型,切换类型时
        $scope.SelectType = function (updateSelectedType) {
            $scope.updateSelectedType = updateSelectedType;
            $scope.editTopic.topicType = updateSelectedType;

        };

        $scope.NewTopic = function () {
            $scope.showTopics = false;
        }

        $scope.showTopics = true;

        $scope.DeleteTopic = function (topic) {
            topic.$delete(function (response) {
                if (response.message == "ok") {
                    var topicIndex = $scope.topics.indexOf(topic);
                    if (topicIndex > -1) {
                        $scope.topics.splice(topicIndex, 1);
                    }
                    console.log("删除数据:" + response.message);
                }
            });
        }

        $scope.deleteTopicGame = function (apk, index) {
            $http.delete(host + 'admin/topics/' + $scope.editTopic.id + '/games/?packageName=' + $scope.editTopic.apks[index].packageName).
                success(function (response) {
                    if (response.message == "ok") {
                        var topicIndex = $scope.editTopic.apks.indexOf(apk);
                        $scope.editTopic.apks.splice(topicIndex, 1);
                        console.log("删除游戏成功");
                    }
                });
        }

        $scope.RemoveAllGames = function () {
            $http.delete(host + 'admin/topics/' + $scope.editTopic.id + '/games/').
                success(function (response) {
                    if (response.message == "ok") {
                        $scope.editTopic.apks = [];
                        console.log("删除游戏成功");
                    }
                });
        }

        $scope.ReleaseGames = function () {
            var nestableId = "nestable";
            var packages = [];
            $("#" + nestableId + " ol li").each(function (i) {
                var packageName = $(this).attr("data-id");
                packages.push(packageName);
            });
            $http.post(host + 'admin/topics/' + $scope.editTopic.id, packages).success(function (response) {
                if (response.message == "ok") {
                    alert('发布成功');
                }
            });
        }

        $scope.Update = function (topic) {
            topic.$save({id: null}, function () {
                alert('保存专题成功');
            });
        };

        $scope.AddGame = function () {
            var isDump = false;
            for (var key in $scope.editTopic.apks) {
                if ($scope.editTopic.apks[key].packageName == $scope.selectGame.packageName) {
                    alert('列表中已经有该游戏');
                    isDump = true;
                }
            }
            if (isDump == false) {
                $scope.editTopic.apks.unshift($scope.selectGame);
            }
        }

        $scope.EditTopic = function (topic) {
            $scope.showTopics = false;
            $scope.editTopic = Topic.get({id: topic.id}, function () {
                var topicType = $scope.types.filter(function (type) {
                    return type.id == $scope.editTopic.topicType.id ? true : false;
                })[0];
                //初始化被选中的select option
                $scope.updateSelectedType = topicType;

            });


        }

        $scope.ShowStyle = function (item) {
            if ($scope.updateSelectedType != undefined) {
                return $scope.updateSelectedType.style.indexOf(item) >= 0 && item != 'url';
            }
        };

        $scope.EditTopicPosition = function (topic) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'editTopicPosition.html',
                controller: 'TopicPositionController',
                //将数据传递给modal的控制器
                resolve: {
                    topic: function () {
                        return topic;
                    }
                }
            });
        };

        TopicTypes.get(function (response) {
            $scope.types = response ? response : [];
        })

        $scope.ReloadRoute = function () {
            $route.reload();
        }

    });

//编辑关联专题位置
controllers.controller('TopicPositionController',
    function TopicPositionController($scope, $modalInstance, $log, $modal, Page, topic) {
        $scope.topic = topic;

        Page.query(function (response) {
            $scope.pages = response ? response : [];

            var pages = $scope.pages;

            for (var key in pages) {
                var positions = pages[key].positions;
                for (var positionKey in positions) {
                    var topics = positions[positionKey].topics;
                    for (var i = 0; i < topics.length; i++) {
                        if (topic.id == topics[i].id) {
                            positions[positionKey].select = true;
                        }
                    }
                }
            }
        });

        $scope.ok = function () {
            var pages = $scope.pages;

            for (var key = 0; key < pages.length; key++) {
                var positions = pages[key].positions;
                for (var positionKey in positions) {
                    var topics = positions[positionKey].topics;
                    var alreadyExist = false;
                    var removeTopicIndex;
                    for (var i = 0; i < topics.length; i++) {
                        if (topic.id == topics[i].id) {
                            //专题本来就已经是选中的
                            alreadyExist = true;
                            removeTopicIndex = i;
                        }
                    }
                    //本来未被选中,之后选中则保存专题
                    if (!alreadyExist && positions[positionKey].select == true) {
                        positions[positionKey].topics.push($scope.topic);
                    } else if (alreadyExist && positions[positionKey].select != true) {
                        //本来就已经选中,但是被去掉了
                        positions[positionKey].topics.splice(removeTopicIndex, 1);
                    }
                }

                pages[key].$save({id: null}, function (response) {
                    if (response.message == "ok") {
                        $log.info('修改关联成功');
                    }
                });
            }
            $modalInstance.close();
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    })

controllers.controller('PageController',
    function PageController($scope, $route, $resource, $modal, $log,$http, Page, Position, host) {

        $scope.navigator = '页面管理';

        var Topic = $resource(host + "admin/pages/:pageId/positions/:positionColumn/topics/:topicId");

        Page.query(function (response) {
            $scope.items = response ? response : [];
            $scope.items[0].isOpen = true;
            //初始化被选中的select option
            if($scope.items[0].positions != undefined) {
                $scope.selectedPosition = $scope.items[0].positions[0];
                $scope.selectTopics = $scope.selectedPosition.topics;
            }
            $scope.selectedPage = $scope.items[0];
        });

        //切换panel时,更改下拉菜单,以及内容显示
        $scope.ChangePanel = function (page) {
            $scope.selectedPosition = page.positions[0];
            $scope.selectTopics = $scope.selectedPosition.topics;
            $scope.selectedPage = page;
        };

        //下拉菜单选中时,更换显示内容
        $scope.SelectPosition = function (selectedPosition) {
            $scope.selectedPosition = selectedPosition;
            $scope.selectTopics = $scope.selectedPosition.topics;
        };

        $scope.oneAtATime = true;

        $scope.DeleteTopic = function (page, topic) {
            var positionColumn = page.positions.indexOf($scope.selectedPosition);
            Topic.delete({
                pageId: page.id,
                positionColumn: positionColumn,
                topicId: topic.id
            }, function (response) {
                if (response.message == "ok") {
                    var topicIndex = $scope.selectedPosition.topics.indexOf(topic);
                    $scope.selectedPosition.topics.splice(topicIndex, 1);
                    console.log("删除数据:" + response.message);
                }
            })
        }

        $scope.animationsEnabled = true;

        $scope.deletePosition = function (pageId) {
            Position.delete({pageId: pageId, id: $scope.selectedPosition.id}, function (response) {
                if (response.message == "ok") {
                    $scope.items.splice(index, 1);
                    console.log("删除数据:" + response.message);
                }
            });
        }

        $scope.ReleaseOrder = function (e) {
            var topicIds = [];
            $(e.target).parent().children('div').children('div').children('div').children('ol').children('li').each(function (i) {
                var topicId = $(this).attr("data-id");
                topicIds.push(topicId);
            });
            $http.post(host + 'admin/pages/' + $scope.selectedPage.id + '/positions/' + $scope.selectedPosition.id + '/changeOrder', topicIds).success(function (response) {
                if (response.message == "ok") {
                    alert('保存成功');
                }
            });
        }

        //TODO : 添加完位置,加到下拉框中
        $scope.addPosition = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'addPosition.html',
                controller: 'PositionController',
                //将数据传递给modal的控制器
                resolve: {
                    selectedPage: function () {
                        return $scope.selectedPage;
                    }
                }
            });

            ////将modal的结果传递出来
            //modalInstance.result.then(function (position) {
            //}, function () {
            //    $log.info('Modal dismissed at: ' + new Date());
            //});
        };
    })
;

controllers.controller('PositionController', function ($scope, $modalInstance, $resource, $log, $route, selectedPage, Position) {

    $scope.position = new Position();

    $scope.selectedPage = selectedPage;

    $scope.position.pageId = selectedPage.id;

    $scope.ok = function (position) {
        position.$save();
        $modalInstance.close(position);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

controllers.controller('LoginController', function ($scope, $http, $window, host) {
    $scope.message = '';
    //无法从302的header中获取cookie
    $scope.Submit = function () {
        jQuery.ajax({
            url: host + 'login',
            data: $scope.user,
            type: "post",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function (data, textStatus, request) {
                //$window.sessionStorage.token = data.token;
                var cookie = request.getResponseHeader();
                $scope.message = 'Welcome';
            }
        });
    };
});


controllers.controller('H5Controller', function ($scope, $resource, $log, $modal, $route, host) {

    $scope.navigator = "轻游管理"

    var H5 = $resource(host + "admin/h5/:id", {id: '@id'}, {
        update: {method: 'POST'}
    });

    $scope.showItem = true;

    H5.query(function (response) {
        $scope.items = response ? response : [];
    });

    $scope.editItem = new H5();

    //编辑
    $scope.EditItem = function (item) {
        $scope.showItem = false;
        $scope.editItem = item;
    }

    //新增
    $scope.NewItem = function () {
        $scope.showItem = false;
    }

    //保存或者更新
    $scope.SaveItem = function () {
        if ($scope.editItem.id != null) {
            $scope.editItem.$update({id: null}, function () {
                $route.reload();
                console.log("更新任务");
            });
        } else {

            $scope.editItem.$save(function () {
                $route.reload();
                console.log("保存任务");
            })
        }

    }

    $scope.DeleteItem = function (index) {
        $scope.items[index].$delete(function (response) {
            if (response.message == "ok") {
                $scope.items.splice(index, 1);
                console.log("删除数据:" + response.message);
            }
        });
    }

    //返回
    $scope.ReloadRoute = function () {
        $route.reload();
    }

});

controllers.controller('StatController',
    function ($scope, $route, $resource, hostStat) {

        $scope.navigator = '统计信息';

        var Stat = $resource(hostStat + "/admin/stats/:id", {id: '@id'});

        Stat.query(function (response) {
            $scope.items = response ? response : [];
        });

        $scope.DeleteItem = function (index) {
            $scope.items[index].$delete(function (response) {
                if (response.message == "ok") {
                    $scope.items.splice(index, 1);
                    console.log("删除数据:" + response.message);
                }
            });
        }
    });

controllers.controller('TagController',
    function ($scope, $route, $resource, host) {

        $scope.navigator = '标签管理';

        var Item = $resource(host + "/admin/tags/:id", {id: '@id'});

        Item.query(function (response) {
            $scope.items = response ? response : [];
        });

        $scope.DeleteItem = function (index) {
            $scope.items[index].$delete(function (response) {
                if (response.message == "ok") {
                    $scope.items.splice(index, 1);
                    console.log("删除数据:" + response.message);
                }
            });
        }
    });

controllers.controller('CategoryController',
    function ($scope, $route, $resource, host) {

        $scope.navigator = '分类管理';

        $scope.show = true;


        var Item = $resource(host + "/admin/categories/:id", {id: '@id'});

        Item.query(function (response) {
            $scope.items = response ? response : [];
        });

        $scope.DeleteItem = function (index) {
            $scope.items[index].$delete(function (response) {
                if (response.message == "ok") {
                    $scope.items.splice(index, 1);
                    console.log("删除数据:" + response.message);
                }
            });
        }

        $scope.EditItem = function (item) {
            $scope.show = false;
            $scope.editItem = item;
        };

        $scope.ReloadRoute = function () {
            $route.reload();
        }

        $scope.Update = function () {
            $scope.editItem.$save({id: null}, function () {
                alert('保存专题成功');
            });
        };

        $scope.navigator = '分类管理';

        $scope.show = true;


        var Item = $resource(host + "/admin/categories/:id", {id: '@id'});

        Item.query(function (response) {
            $scope.items = response ? response : [];
        });

        $scope.DeleteItem = function (index) {
            $scope.items[index].$delete(function (response) {
                if (response.message == "ok") {
                    $scope.items.splice(index, 1);
                    console.log("删除数据:" + response.message);
                }
            });
        }

        $scope.EditItem = function (item) {
            $scope.show = false;
            $scope.editItem = item;
        };

        $scope.ReloadRoute = function () {
            $route.reload();
        }

        $scope.Update = function () {
            $scope.editItem.$save({id: null}, function () {
                alert('保存专题成功');
            });
        };

        $scope.navigator = '分类管理';

        $scope.show = true;


        var Item = $resource(host + "/admin/categories/:id", {id: '@id'});

        Item.query(function (response) {
            $scope.items = response ? response : [];
        });

        $scope.DeleteItem = function (index) {
            $scope.items[index].$delete(function (response) {
                if (response.message == "ok") {
                    $scope.items.splice(index, 1);
                    console.log("删除数据:" + response.message);
                }
            });
        }

        $scope.EditItem = function (item) {
            $scope.show = false;
            $scope.editItem = item;
        };

        $scope.ReloadRoute = function () {
            $route.reload();
        }

        $scope.Update = function () {
            $scope.editItem.$save({id: null}, function () {
                alert('保存专题成功');
            });
        };

    });
