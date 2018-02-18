'use strict';

//create a file-specific context via a function
(function(piv) {

var view = piv.view
view.setHeader("Results")

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var edititems = piv.html(view.workspace, "ol", "", {"id": "edititems", "class": "itemlist incrementsCounter"});

piv.getResource('/api/election/' + election + '/result', showElectionResults)

function displayCandidate(parent, description, cost, tie) {
  var candidateLiAtts = {"class": "row1"}
  var box = piv.html(parent, "li", "", candidateLiAtts);
  piv.div(box, "", "text1", "#");
  piv.div(box, "", "text1 w75", description);
}
function showElectionResults(results) {
  var candidateOrder = results.order
  for (var key in candidateOrder) {
    displayCandidate(edititems, candidateOrder[key].name, "cost")
  }
}

// close the self-executing function and feed the piv library to it
})(piv)
