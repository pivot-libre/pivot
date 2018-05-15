'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {

// script-level variables
var View = Piv.view
var ResultsList = Piv.html(View.workspace, "ol", "", {"class": "itemlist incrementsCounter"});

// actions (do stuff)
View.setHeader("Results", ElectionId)
View.statusbar.innerHTML = ""
Piv.electionsMenu(View.sidenav, ElectionId)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

Piv.http.get(["/api/elections/" + ElectionId + "/result"], showElectionResults, showErrorMessage)

// function definitions
function displayCandidate(parent, description, cost, tie) {
  // var candidateLiAtts = {"class": "w100 border-bottom-2 overflow-visible hover-1 drag-drop-1", "data-id": id}
  var candidateLiAtts = {"class": "w100 border-bottom-1 overflow-visible"}
  var box = Piv.html(parent, "li", "", candidateLiAtts);
  Piv.div(box, "", "text1square orderdisplay");
  Piv.div(box, "", "text3 w75", description)
  // Piv.div(box, "", "text1 w75", description);
}
function showElectionResults(results) {
  var candidateOrder = results.order
  for (var key in candidateOrder) {
    displayCandidate(ResultsList, candidateOrder[key].name, "cost")
  }
}
function showErrorMessage(error) {
  Piv.div(View.workspace, "", "w100 text3", "Results for this election are not currently available.")
  Piv.div(View.workspace, "", "100 text3", error.response.data.message)
}

// close the self-executing function and feed the piv library to it
})(piv, election)
