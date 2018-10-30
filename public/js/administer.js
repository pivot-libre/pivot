'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {

  // script-level variables
  var View = Piv.view
  var SnapshotsTaken

  // actions (do stuff)
  Piv.evmanage.setManager(View.workspace, ["click"])

  View.setHeader("Administer", ElectionId)

  // Piv.anchorListDiv(View.workspace, "", {
  //     "Add/Edit candidates": "/candidates/" + ElectionId,
  //     "Manage electorate": "/electorate/" + ElectionId,
  //     "Election details": "/administer/" + ElectionId
  //   }
  // )
  Piv.electionsMenu(ElectionId)

  // Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

  Piv.http.get(["/api/elections/" + ElectionId, "/api/elections/" + ElectionId + "/voter_stats"], showElectionDetails)

  // function definitions
  function showElectionDetails(details, stats) {
    // Piv.div(View.workspace, "", "text3 row1", "Election name: " + details.name)

    // stats
    // Piv.div(View.workspace, "", "text3 row1", "Outstanding invites: " + stats.outstanding_invites)
    // Piv.div(View.workspace, "", "text3 row1", "Approved ballots: " + stats.approved_current)
    // Piv.div(View.workspace, "", "text3 row1", "Unapproved ballots: " + stats.approved_none)
    // Piv.div(View.workspace, "", "text3 row1", "Previously approved ballots: " + stats.approved_previous)

    //calculate results
    var calcResultsButton = Piv.div(Piv.div(View.workspace, "", "w100 margin-bottom-1"), "", "clickable1", "Calculate Results", "", "click", calcElectionResults, [details.id])
    Piv.http.get(["/api/elections/" + details.id + "/result_snapshots"], function(response) {
      SnapshotsTaken = response.length
      if (SnapshotsTaken > 0) calcResultsButton.innerHTML = "Calculate Results" + " (" + response.length + " snapshot(s) taken)"
    })

    //delete button
    Piv.div(Piv.div(View.workspace, "", "w100 margin-bottom-1"), "", "clickable1", "Delete Election", "", "click", deleteElection, [details.id])
  }

  function calcElectionResults(electionId) {
    if (!electionId) {return}
    var calcResultsButton = this.domel
    Piv.http.post(["/api/elections/" + electionId + "/result_snapshots"], "", function() {
      calcResultsButton.innerHTML = "Calculate Results (" + ++SnapshotsTaken + " snapshot(s) taken)"
    })
  }
  function deleteElection(electionId) {
    if (!electionId) {return}
    Piv.http.delete("/api/elections/" + electionId, function() {
      window.location.href = "/myElections"
    })
  }

  // close the self-executing function and feed the piv library to it
})(piv, election)
