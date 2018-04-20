'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {

// script-level variables
var View = Piv.view
var Edititems = Piv.html(View.workspace, "ol", "", {"id": "edititems", "class": "itemlist incrementsCounter"});

// actions (do stuff)
View.setHeader("Results", ElectionId)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

Piv.http.get(["/api/elections/" + ElectionId + "/result"], showElectionResults)

// function definitions
function displayCandidate(parent, description, cost, tie) {
  var candidateLiAtts = {"class": "row1"}
  var box = Piv.html(parent, "li", "", candidateLiAtts);
  Piv.div(box, "", "text1", "#");
  Piv.div(box, "", "text1 w75", description);
}
function showElectionResults(results) {
  var candidateOrder = results.order
  for (var key in candidateOrder) {
    displayCandidate(Edititems, candidateOrder[key].name, "cost")
  }
}

// close the self-executing function and feed the piv library to it
})(piv, election)
