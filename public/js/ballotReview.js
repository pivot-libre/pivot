'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Review Ballot"

anchorListDiv(workspace, "stepNavigator", {
    "Rank Candidates": "ballot",
    "Review ballot": "ballotReview",
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var rankeditems = html(workspace, "ol", "", "id=rankeditems", "class=itemlist incrementsCounter");
var unrankeditems = html(workspace, "ol", "", "id=unrankeditems", "class=itemlist");

candidate(rankeditems, "", "description", "cost", "", "")
candidate(rankeditems, "", "description", "cost", "", "")
candidate(unrankeditems, "", "description", "cost", "", "yes")
candidate(unrankeditems, "", "description", "cost", "", "yes")

function candidate(parent, uniq, description, cost, tie, isNew) {
  var tie = tie ? "data-tie=" + tie : ""
  var box = html(parent, "li", "", "class=candidate", "onclick=candidateClick(this)", "data-id=" + uniq, tie);

  var rankingTools = div(box, "", "rankingTools");
  div(rankingTools, "", "rankdisplay");

  var details = div(box, "", "candidateDetails");
  div(details, "", "candidateDescription", description);
  div(details, "", "candidateCost", cost);
}

// loadElection(1, showElectionDetails)
//
// function loadElection(electionId, onSuccessFunction) {
//   if (!electionId) {return}
//   axios.get('/api/election/' + electionId)
//     .then(response => {
//       // console.log(response.data);
//       onSuccessFunction(response.data)
//     });
// }
// function showElectionDetails(details) {
//   // console.log(details)
//   // var detailsSpace = div(workspace, "", "")
//   appendNewHtmlEl(workspace, "br")
//   div(workspace, "", "", "election name: " + details.name)
// }
