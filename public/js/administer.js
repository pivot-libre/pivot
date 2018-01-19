'use strict';

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Administer"

anchorListDiv(workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

getResource('/api/election/' + election, showElectionDetails)

function showElectionDetails(details) {
  var row = div(workspace, "", "w100")
  div(row, "", "text1", "election name: " + details.name)
  div(row, "", "clickable1", "Delete Election", {"onclick": "deleteElection(" + details.id + ")"})
}
function deleteElection(electionId) {
  if (!electionId) {return}
  axios.delete('/api/election/' + electionId)
    .then(response => {
      // console.log(response.data);
      window.location.href = "/myElections"
    });
}
