'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Results"

// anchorListDiv(workspace, "stepNavigator", {
//     "Rank Candidates": "ballot",
//     "Review ballot": "ballotReview",
//   }
// )

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var workspace = document.querySelector(".workspace")
var edititems = html(workspace, "ol", "", "id=edititems", "class=itemlist incrementsCounter");

// candidate(edititems, "", "description", "cost")
// candidate(edititems, "", "description", "cost")
// candidate(edititems, "", "description", "cost")
// candidate(edititems, "", "description", "cost")

loadResults(election, showElectionResults)


function candidate(parent, uniq, description, cost, tie) {
  if (uniq) { id = "data-id=" + uniq }
  var id = uniq ? "data-id=" + uniq : ""
  var box = html(parent, "li", "", "class=candidate", id);

  div(box, "", "rankdisplay");

  var details = div(box, "", "candidateDetails");
  var candidateDescription = div(details, "", "candidateDescription");
  div(candidateDescription, "", "", description);
  var candidateCost = div(details, "", "candidateCost");
  div(candidateCost, "", "", cost);
}


function loadResults(electionId, onSuccessFunction) {
  if (!electionId) {return}
  axios.get('/api/election/' + electionId + '/result')
    .then(response => {
      // console.log(response.data);
      onSuccessFunction(response.data)
    });
}
function showElectionResults(results) {
  // console.log(results.order)
  var candidateOrder = results.order
  for (var key in candidateOrder) {
    candidate(edititems, "", candidateOrder[key].name, "cost")
  }
}
