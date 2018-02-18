'use strict';

//create a file-specific context via a function
(function(piv) {

var view = piv.view
view.setHeader("Administer")

piv.anchorListDiv(view.workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

piv.getResource('/api/election/' + election, showElectionDetails)

function showElectionDetails(details) {
  var row = piv.div(view.workspace, "", "w100")
  piv.div(row, "", "text1", "election name: " + details.name)
  piv.div(row, "", "clickable1", "Delete Election", {"onclick": "deleteElection(" + details.id + ")"})
}
function deleteElection(electionId) {
  if (!electionId) {return}
  axios.delete('/api/election/' + electionId)
    .then(response => {
      // console.log(response.data);
      window.location.href = "/myElections"
    });
}

// close the self-executing function and feed the piv library to it
})(piv)
