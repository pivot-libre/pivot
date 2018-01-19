'use strict';

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Results"

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var workspace = document.querySelector(".workspace")
var edititems = html(workspace, "ol", "", {"id": "edititems", "class": "itemlist incrementsCounter"});

getResource('/api/election/' + election + '/result', showElectionResults)

function displayCandidate(parent, description, cost, tie) {
  var candidateLiAtts = {"class": "row1"}
  var box = html(parent, "li", "", candidateLiAtts);
  div(box, "", "text1", "#");
  div(box, "", "text1 w75", description);
}
function showElectionResults(results) {
  var candidateOrder = results.order
  for (var key in candidateOrder) {
    displayCandidate(edititems, candidateOrder[key].name, "cost")
  }
}
