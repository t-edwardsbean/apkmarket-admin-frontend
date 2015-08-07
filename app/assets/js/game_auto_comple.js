$(document).ready(function ($) {
    $.fn.typeahead.Constructor.prototype.blur = function () {
        var that = this;
        setTimeout(function () {
            that.hide()
        }, 250);
    };
    var games = null;

    var that = this;

    $('#gameId_block').typeahead({
        source: function (query, process) {
           // $('#gameDetail_block').hide();
            var parameter = {name: query};
            jQuery.ajax({
                url: 'get_games_by_name',
                data: parameter,
                type: "post",
                dataType: "json",
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (data) {
                    games = data;
                }
            });
            var results = _.map(games, function (game) {
                return game.id + "";
            });
            process(results);
        },
        items: 500,
        matcher: function (item) {
            return true;
        },

        highlighter: function (id) {
            var game = _.find(games, function (p) {
                return p.id == id;
            });
            return game.name + " (" + game.packageName + ")";
        },

        updater: function (id) {
            var game = _.find(games, function (p) {
                return p.id == id;
            });
            that.setSelectedGame(game);
            return game.name;
        }

    });
    $('#game_search').typeahead({
        source: function (query, process) {
            $('#game_detail').hide();
            var parameter = {name: query};
            jQuery.ajax({
                url: 'get_games_by_name',
                data: parameter,
                type: "post",
                dataType: "json",
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (data) {
                    games = data;
                }
            });
            var results = _.map(games, function (game) {
                return game.id + "";
            });
            process(results);
        },
        items: 500,
        matcher: function (item) {
            return true;
        },

        highlighter: function (id) {
            var game = _.find(games, function (p) {
                return p.id == id;
            });
            return game.name + " (" + game.packageName + ")";
        },

        updater: function (id) {
            var game = _.find(games, function (p) {
                return p.id == id;
            });
            that.setSelectedGameList(game);
            return game.name;
        }

    });
    //$('#gameDetail_block').hide();
    this.setSelectedGame = function (game) {
        $('#gameDetail_block').html('<strong>' + game.name + ' (' + game.packageName + ')</strong>').show();
        $("#edit_game_package").attr("value", game.packageName);
    };

   // $('#game_detail').hide();
    this.setSelectedGameList = function (game) {
        $('#game_detail').html('游戏详情: <strong>' + game.name + ' (' + game.packageName + ')</strong>').show();
        $("#package_Name").attr("value", game.packageName);
    }
});
