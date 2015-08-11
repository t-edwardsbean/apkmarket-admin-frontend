'use strict';

/* Directives */

var directives = angular.module("apkmarket.directives", []);

directives.directive('confirmationNeeded', function () {
    return {
        terminal: true,
        link: function (scope, element, attr) {
            var msg = attr.confirmationNeeded || "Are you sure?";
            var clickAction = attr.ngClick;
            element.bind('click', function () {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction)
                }
            });
        }
    };
});

directives.directive('menu', function () {
    return {
        restrict: 'A',
        transclude: true,
        templateUrl: './templates/menu.html'
    };
});

//游戏顺序拖拽编辑
directives.directive('draggable', function () {
    return {
        link: function (scope, element, attr) {
            element.nestable();
        }
    };
});

//防止拖拽时间覆盖按钮事件
directives.directive('dragStopPropagation', function () {
    return {
        link: function (scope, element, attr) {
            element.on('mousedown', function (e) {
                e.stopPropagation();
            });
        }
    };
});

//专题游戏编辑中的搜索框
directives.directive('searchable', function (host) {
    return {
        link: function (scope, element, attr) {
            element.typeahead({
                source: function (query, process) {
                    $('#game_detail').hide();
                    var parameter = {name: query};
                    jQuery.ajax({
                        url: host + 'admin/get_games_by_name',
                        data: parameter,
                        type: "post",
                        dataType: "jsonp",
                        contentType: "application/x-www-form-urlencoded; charset=utf-8",
                        success: function (data) {
                            scope.games = data;
                        }
                    });
                    var results = _.map(scope.games, function (game) {
                        return game.id + "";
                    });
                    process(results);
                },
                items: 500,
                matcher: function (item) {
                    return true;
                },

                highlighter: function (id) {
                    var game = _.find(scope.games, function (p) {
                        return p.id == id;
                    });
                    return game.name + " (" + game.packageName + ")";
                },

                updater: function (id) {
                    var game = _.find(scope.games, function (p) {
                        return p.id == id;
                    });
                    scope.game.selectGame = game;
                    $('#game_detail').html('游戏详情: <strong>' + game.name + ' (' + game.packageName + ')</strong>').show();
                    $("#package_Name").attr("value", game.packageName);
                    return game.name;
                }

            });
        }
    };
});
