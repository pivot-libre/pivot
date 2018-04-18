'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {

// script-level variables
var View = Piv.view

// actions (do stuff)
Piv.evmanage.setManager(View.workspace, ["click"])

View.setHeader("Administer", ElectionId)

Piv.anchorListDiv(View.workspace, "", {
    "Add/Edit candidates": "/candidates/" + ElectionId,
    "Manage electorate": "/electorate/" + ElectionId,
    "Election details": "/administer/" + ElectionId
  }
)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

Piv.http.get(["/api/elections/" + ElectionId, "/api/elections/" + ElectionId + "/voter_stats"], showElectionDetails)

// function definitions
function showElectionDetails(details, stats) {
  Piv.div(View.workspace, "", "text3 row1", "Election name: " + details.name)

  // stats
  Piv.div(View.workspace, "", "text3 row1", "Outstanding invites: " + stats.outstanding_invites)
  Piv.div(View.workspace, "", "text3 row1", "Approved ballots: " + stats.approved_current)
  Piv.div(View.workspace, "", "text3 row1", "Unapproved ballots: " + stats.approved_none)
  Piv.div(View.workspace, "", "text3 row1", "Previously approved ballots: " + stats.approved_previous)

  //delete button
  Piv.div(View.workspace, "", "clickable1", "Delete Election", "", "click", deleteElection, [details.id])
}
function deleteElection(electionId) {
  if (!electionId) {return}
  axios.delete('/api/elections/' + electionId)
    .then(response => {
      // console.log(response.data);
      window.location.href = "/myElections"
    });
}

// close the self-executing function and feed the piv library to it
})(piv, election)
