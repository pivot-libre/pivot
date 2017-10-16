'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Administer"

anchorListDiv(workspace, "tealButton", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

loadElection(election, showElectionDetails)
// loadElection(2, showElectionDetails)

function loadElection(electionId, onSuccessFunction) {
  if (!electionId) {return}
  axios.get('/api/election/' + electionId)
    .then(response => {
      // console.log(response.data);
      onSuccessFunction(response.data)
    });
}
function showElectionDetails(details) {
  // console.log(details)
  // var detailsSpace = div(workspace, "", "")
  appendNewHtmlEl(workspace, "br")
  div(workspace, "", "", "election name: " + details.name)
}
