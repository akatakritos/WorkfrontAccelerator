'use strict';

(function(){
    var $ = jQuery;

    var debugging = false;

    var debug = {
        log: function(s) {
            if (debugging) {
                console.log(s);
            }
        },

        warn: function(s) {
            console.warn("WorkfrontAccelerator: " + s);
        }

    };

    function loadSubtasks(iterationId, teamId) {

        debug.log("teamid: " + teamId);

        if (!teamId) {
            debug.warn("Could not find a team id. No subtasks can be shown.");
            return;
        }

        if (!iterationId) {
            debug.warn("Could not find an iteration id. No subtasks can be shown.");
            return;
        }

        var url = "/attask/api-internal/TASK/search";

       var data = {
           iterationID: iterationId,
           personal_Mod:"notnull",
           teamID: teamId,
           isAgile:true,
           fields:"backlogOrder,estimate,color,status,statusEquatesWith,assignments:assignedTo:name,children:statusEquatesWith,children:assignedTo,children:assignments:assignedTo",
           backlogOrder_Sort:"asc",
           "$$LIMIT":300
       }

       //var listTemplate = "<li class='sub-task'> <input type='checkbox' autocomplete='off' value='sub-task' name='check-sub-task' class='check-sub-task' id='check_@ID'>  <label class='name' title='@NAME' for='check_@ID'>  <span></span>   <a href='/task/view?ID=@ID&activeTab=tabs-task-updates'>@NAME</a>   </label>    <a href='#'></a></li> ";
       var listTemplate = "<li class='sub-task'>    <input type='checkbox' autocomplete='off' value='sub-task' name='check-sub-task' class='check-sub-task' id='check_@ID'>     <label class='name' title='@NAME' for='check_@ID'>      <span></span>       <a href='/task/view?ID=@ID&amp;activeTab=tabs-task-updates'>@NAME</a>   </label> </li>";

       $.get(url, data).success(function(result) {
           console.log("WorkfrontAccelerator StoryList", result);

           result.data.forEach(function(story) {

               var $card = $("div.story[data-objid='" + story.ID + "']");

               var $space = $("<div class='story-breakdown-list' style='padding:25px 8px; max-width: 150px'></div>");
               $space.appendTo($card);

               var $ul = $("<ul class='sub-task'></ul>");

               story.children.forEach(function(subtask) {
                   var li = listTemplate.replace(/@ID/g, subtask.ID)
                                        .replace(/@NAME/g, subtask.name);
                   var $li = $(li);

                   var $input = $li.find("input");

                   $input.prop("disabled", true);
                   if (subtask.statusEquatesWith == "CPL") {
                       $input.prop("checked", true);
                       $li.find("a").css("color", "gray");
                   }



                   $li.appendTo($ul);
               });

               $ul.appendTo($space);
           });
       });
    }

    function parseIdFromUrl(url) {
        return url.match(/[a-f0-9]+$/)[0];
    }

    function waitForIterationId() {

        var $h3 = $("h3.position-tl a");
        if ($h3.length == 0) {
            setTimeout(waitForIterationId, 250);
            return;
        }

        var href = $h3.attr("href");
        var iterationId = parseIdFromUrl(href);

        var $hidden = $("input[name='teams']");
        var teamId = $hidden.val();

        loadSubtasks(iterationId, teamId);
    }

    function waitForStoryBoard() {

        if ($("div.story").length) {

            debug.log("found a .story, loading subtasks");

            var iterationId = parseIdFromUrl(window.location.search);
            var $teamlink = $("a[href*='/team/view?ID']")
            var teamId = parseIdFromUrl($teamlink.attr("href"));

            loadSubtasks(iterationId, teamId);
            return;
        }

        debug.log("didn't find a .story, try again in 250ms");
        setTimeout(waitForStoryBoard, 250);

    }

    if (window.location.pathname === "/iteration/view") {

        waitForStoryBoard();

    } else {

        waitForIterationId();

    }

})();