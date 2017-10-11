'use strict';

function columnWithHeadAndWorkspace(body, username, election, mainheader, instructions, stepNav) {

  if (username) {
    var maincolumn = div(body, "maincolumn");

    var topNav = div(maincolumn, "topNav");
    var leftMenu = div(topNav, "", "leftMenu");
    html(leftMenu, "img", "", "src=style/images/parrot1.svg");
    html(leftMenu, "a", "My Elections", "href=myElections", "class=tealButton");
    html(leftMenu, "a", "Create Election", "href=create", "class=tealButton");
    var rightMenu = div(topNav, "", "rightMenu");
    div(rightMenu, "", "", "hi " + username + ", welcome to pivot!")
    html(rightMenu, "img", "", "src=style/images/profile.svg");
    html(rightMenu, "a", "Log Out", "href=myElections?logout=1", "class=tealButton");

    if (stepNav == "admin") {
      div(maincolumn, "", "mainheader", mainheader);

      var stepNavigator = div(maincolumn, "", "tealButton");
      html(stepNavigator, "a", "Election details", "href=details?election=" + election);
      html(stepNavigator, "a", "Add/Edit candidates", "href=candidates?election=" + election);
      html(stepNavigator, "a", "Manage electorate", "href=electorate?election=" + election);
    }
    else if (stepNav == "vote") {
      div(maincolumn, "", "mainheader", mainheader);

      var stepNavigator = div(maincolumn, "", "stepNavigator");
      html(stepNavigator, "a", "Rank Candidates", "href=ballot?election=" + election);
      html(stepNavigator, "a", "Review", "href=review?election=" + election);
    }
    else if (stepNav == "results") {
      div(maincolumn, "", "mainheader", mainheader);
    }
    else if (mainheader) {
      div(maincolumn, "", "mainheader", mainheader);
    }

    var workspace = div(maincolumn, "", "workspace");
    if (instructions) {
      div(workspace, "instructions", "", instructions);
    }

    return workspace;
  }
  else {
    var maincolumn = div(body, "maincolumn");
    var loginForm = html(maincolumn, "form", "", "action=myElections", "method=post", "class=createOrLogin");
    div(loginForm, "", "header1", "Welcome to Pivot-Libre!");
    div(loginForm, "", "header2", "Please enter your username");
    html(loginForm, "input", "", "type=text", "name=username");
    html(loginForm, "input", "", "type=submit", "value=Sign in");
  }
}
