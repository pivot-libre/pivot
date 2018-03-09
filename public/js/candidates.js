'use strict';

//create a file-specific context via a function
(function(Piv, Dragula) {

// script-level variables
var View = Piv.view
var Election = election
var SaveCandidatesButton
var CandidateDirectory = {}
Piv.CandidateDirectory = CandidateDirectory
CandidateDirectory.index = []
CandidateDirectory.deleted = {}
CandidateDirectory.changed = {}
CandidateDirectory.new = {}
var Edititems

// actions (do stuff)
Piv.evmanage.setManager(View.workspace, ["click"])

View.setHeader("Candidates")

Piv.anchorListDiv(View.workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

Edititems = Piv.html(View.workspace, "ol", "", {"id": "edititems", "class": "itemlist incrementsCounter"})
Dragula([Edititems])
// Drake.on('drop', function (el) { onCandidateDrop(el); })

Piv.div(View.workspace, "", "clickable1", "+ Add Candidates", "", "click", addCandidate);
SaveCandidatesButton = Piv.div(View.workspace, "", "clickable1 disabled", "Save Election", "", "click", saveCandidates, [election]);

loadCandidates(Election, displayCandidates)

// function definitions
function loadCandidates(electionId, onSuccessFunction) {
  if (!electionId) return
  Piv.getResource('/api/election/' + electionId + "/candidate", onSuccessFunction)
}
function displayCandidates(candidates) {
  var candidate
  for (var key in candidates) {
    candidate = candidates[key]
    displayCandidate(Edititems, candidate.id, candidate.name)
  }
}
function displayCandidate(parent, id, name, status) {
  var candidateDef = {"id": id, "status": status || "saved"}
  candidateDef.index = CandidateDirectory.index.push(candidateDef)
  if ("new" == status) CandidateDirectory.new[candidateDef.index] = candidateDef

  var candidateLiAtts = {"class": "row1"}
  if (id) { candidateLiAtts["data-id"] = id}

  var box = candidateDef.domel = Piv.html(parent, "li", "", candidateLiAtts);
  Piv.div(box, "", "grabbable", "#");
  Piv.div(box, "", "grabbable", "^v");
  var input = candidateDef.name = Piv.html(box, "input", "", {"class": "text1 w75", "type": "text", "value": (name || ""), "placeholder": "Candidate name/description"});
  Piv.div(box, "", "clickable1", "X", "", "click", removeCandidate, [candidateDef]);

  return candidateDef
}
function addCandidate() {
  displayCandidate(Edititems, "", "", "new").name.focus()
  updateSaveButton()
}
// function removeCandidate(el) {
function removeCandidate(candidateDef) {
  if ("new" == candidateDef.status) {
    delete CandidateDirectory.new[candidateDef.index]
    candidateDef.status = "deleted"
    candidateDef.domel.parentElement.removeChild(candidateDef.domel)
    updateSaveButton()
    return
  }
  if ("changed" == candidateDef.status) {
    delete CandidateDirectory.changed[candidateDef.index]
  }
  CandidateDirectory.deleted[candidateDef.index] = candidateDef
  candidateDef.status = "deleted"
  candidateDef.domel.parentElement.removeChild(candidateDef.domel)

  updateSaveButton()
}
function updateSaveButton() {
  if ( Object.keys(CandidateDirectory.new).length > 0 ) { buttonEnableDisable(SaveCandidatesButton, "enable") }
  else if ( Object.keys(CandidateDirectory.changed).length > 0) { buttonEnableDisable(SaveCandidatesButton, "enable") }
  else if ( Object.keys(CandidateDirectory.deleted).length > 0) { buttonEnableDisable(SaveCandidatesButton, "enable") }
  else { buttonEnableDisable(SaveCandidatesButton, "disable") }
}
function buttonEnableDisable(button, disable) {
  if ("disable" == disable) { Piv.addClass(button, "disabled") }
  else { Piv.removeClass(button, "disabled") }
}
function saveCandidates(electionId) {
  for (var i in CandidateDirectory.new) {
    saveNewCandidate(electionId, CandidateDirectory.new[i])
  }
    for (var i in CandidateDirectory.deleted) {
    deleteCandidate(electionId, CandidateDirectory.deleted[i])
  }
}
function saveNewCandidate(electionId, candidateDef) {
  Piv.postToResource('/api/election/' + electionId + "/candidate", {"name": candidateDef.name.value}, function(response) {
      candidateDef.domel.setAttribute("data-id", response.id)
      candidateDef.id = response.id
      candidateDef.status = "saved"
      delete CandidateDirectory.new[candidateDef.index]
      updateSaveButton()
  })
}
function deleteCandidate(electionId, candidateDef) {
  Piv.deleteResource('/api/election/' + electionId + "/candidate/" + candidateDef.id, function() {
      delete CandidateDirectory.deleted[candidateDef.index]
      candidateDef = undefined
      updateSaveButton()
  })
}
piv.deleteCandidate = deleteCandidate

// close the self-executing function and feed libraries to it
})(piv, dragula)
