'use strict';

//create a file-specific context via a function
(function(Piv, Dragula, ElectionId) {

  // script-level variables
  var View = Piv.view
  var SaveCandidatesButton, RevertChangesButton
  var OriginalCandidatesFromServer, SaveInProgress
  var CandidateDirectory = Piv.makeVobjectCollection()
  // var CandidateDirectory = {}
  Piv.CandidateDirectory = CandidateDirectory
  var Edititems

  // actions (do stuff)
  Piv.evmanage.setManager(View.workspace, ["click", "keyup", "paste"])

  View.setHeader("Candidates", ElectionId)
  // Piv.html(View.workspace, "a", "Next step: Invite Voters >", {"class": "clickable1 margin-bottom-2", "href": "/electorate/" + ElectionId})
  View.statusbar.innerHTML = ""

  // Piv.anchorListDiv(View.workspace, "", {
  //     "Add/Edit candidates": "/candidates/" + ElectionId,
  //     "Manage electorate": "/electorate/" + ElectionId,
  //     "Election details": "/administer/" + ElectionId
  //   }
  // )
  Piv.electionsMenu(ElectionId)

  // Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page


  // Piv.div(View.workspace, "", "w100 font-size-3 padding-1 textLeft color-white", "Candidates")
  var CandidatesSection = Piv.div(View.workspace, "", "container1")
  Piv.div(CandidatesSection, "", "w100 font-size-4", "Add candidates to be voted on in the election.")
  var ButtonRow = Piv.div(CandidatesSection, "", "textRight w100")
  Piv.div(ButtonRow, "", "clickable1", "+ New Candidate", "", "click", addCandidate);
  RevertChangesButton = Piv.div(ButtonRow, "", "clickable1 disabled", "Revert Changes", "", "click", revertChanges);
  SaveCandidatesButton = Piv.div(ButtonRow, "", "clickable1 disabled", "Save", "", "click", saveCandidates, [ElectionId]);

  Edititems = Piv.html(CandidatesSection, "ol", "", {"class": "incrementsCounter w100"})
  Piv.div(CandidatesSection, "", "w100", Piv.div("", "", "w100 textLeft", Edititems))

  loadCandidates(ElectionId, displayCandidates)

  // function definitions
  function loadCandidates(electionId, onSuccessFunction) {
    if (!electionId) return

    Piv.http.get(["/api/elections/" + electionId + "/batch_candidates"], onSuccessFunction)
  }

  function revertChanges() {
    if (SaveInProgress) {
      console.log("Save in progress")
      return
    }
    resetCandidates()
    displayCandidates(OriginalCandidatesFromServer)
  }

  function resetCandidates() {
    Piv.removeAllChildren(Edititems)
    CandidateDirectory.reset()
    updateSaveButton()
  }

  function displayCandidates(candidates) {
    var candidate
    resetCandidates()
    OriginalCandidatesFromServer = candidates  //save off candidates so the user can revert their changes if need be
    for (var key in candidates) {
      candidate = candidates[key]
      displayCandidate(Edititems, candidate.id, candidate.name)
    }
  }

  function displayCandidate(parent, id, name, status) {
    var vobject = {"id": id, "status": status || "current", "original_name": name}
    CandidateDirectory.push(vobject)

    var candidateLiAtts = {"class": "w75 overflow-visible nowrap hover-children"}
    // var candidateLiAtts = {"class": "w100"}
    if (id) { candidateLiAtts["data-id"] = id}

    var box = vobject.domel = Piv.html(parent, "li", "", candidateLiAtts)
    Piv.div(box, "", "text1square orderdisplay")
    var input = vobject.name = Piv.html(box, "input", "", {"class": "input-text-1 w100 hover-1", "type": "text", "value": (name || ""), "placeholder": "Candidate name/description"})
    // var input = vobject.name = Piv.html(box, "input", "", {"class": "input-text-1 w75", "type": "text", "value": (name || ""), "placeholder": "Candidate name/description"})
    Piv.evmanage.listen(input, "keyup", onNameChange, [vobject])
    Piv.evmanage.listen(input, "paste", onNameChange, [vobject])
    Piv.div(box, "", "clickable2", "&#9747;", "", "click", removeCandidate, [vobject])

    return vobject
  }

  function onNameChange(vobject) {
    if (vobject.status == "new") return  //don't need to track changes for new objects
    if (vobject.name.value == vobject.original_name) {
      CandidateDirectory.status(vobject, "current")
      updateSaveButton()
      return
    }
    if (CandidateDirectory.status(vobject) == "changed") return
    CandidateDirectory.status(vobject, "changed")
    updateSaveButton()
  }

  function addCandidate() {
    displayCandidate(Edititems, "", "", "new").name.focus()
    updateSaveButton()
  }

  function removeCandidate(vobject) {
    if ("new" == vobject.status) {
      CandidateDirectory.status(vobject, "ignore")
      vobject.domel.parentElement.removeChild(vobject.domel)
      updateSaveButton()
      return
    }
    if ("changed" == vobject.status) {
      CandidateDirectory.status(vobject, "deleted")
    }
    CandidateDirectory.status(vobject, "deleted")
    vobject.domel.parentElement.removeChild(vobject.domel)

    updateSaveButton()
  }

  function updateSaveButton() {
    if ( CandidateDirectory.length("new") > 0 ) {
      buttonEnableDisable(SaveCandidatesButton, "enable")
      buttonEnableDisable(RevertChangesButton, "enable")
    }
    else if ( CandidateDirectory.length("changed") > 0) {
      buttonEnableDisable(SaveCandidatesButton, "enable")
      buttonEnableDisable(RevertChangesButton, "enable")
    }
    else if ( CandidateDirectory.length("deleted") > 0) {
      buttonEnableDisable(SaveCandidatesButton, "enable")
      buttonEnableDisable(RevertChangesButton, "enable")
    }
    else {
      buttonEnableDisable(SaveCandidatesButton, "disable")
      buttonEnableDisable(RevertChangesButton, "disable")
    }
  }

  function buttonEnableDisable(button, disable) {
    if ("disable" == disable) { Piv.addClass(button, "disabled") }
    else { Piv.removeClass(button, "disabled") }
  }

  function saveCandidates(electionId) {
    var deleteResources = []

    if (SaveInProgress) {
      console.log("Save in progress")
      return
    }
    SaveInProgress = true
    var innerHtml = SaveCandidatesButton.innerHTML

    for (var i in CandidateDirectory.statuses.deleted) {
      deleteResources.push("/api/elections/" + electionId + "/candidates/" + CandidateDirectory.statuses.deleted[i].id)
    }
    if (deleteResources.length > 0) {
      SaveCandidatesButton.innerHTML = "Deleting..."
      View.statusbar.innerHTML = "Deleting candidates..."
      Piv.http.delete(deleteResources, function(response) {
        for (var i in CandidateDirectory.statuses.deleted) {
          CandidateDirectory.remove(CandidateDirectory.statuses.deleted[i])
        }
        // for (var i = 0; i < arguments.length; i++) {
        // }
        saveCandidateList(electionId, innerHtml)
      })
    }
    else saveCandidateList(electionId, innerHtml)
  }

  function saveCandidateList(electionId, innerHtml) {
    var newAndChangedCandidates = []
    SaveCandidatesButton.innerHTML = "Saving..."
    View.statusbar.innerHTML = "Saving..."

    for (var i in CandidateDirectory.statuses.new) {
      newAndChangedCandidates.push({"name": CandidateDirectory.statuses.new[i].name.value})
    }
    for (var i in CandidateDirectory.statuses.changed) {
      newAndChangedCandidates.push({
        "name": CandidateDirectory.statuses.changed[i].name.value,
        "id": CandidateDirectory.statuses.changed[i].id })
    }
    if (newAndChangedCandidates.length < 1) {
      SaveInProgress = false
      SaveCandidatesButton.innerHTML = innerHtml
      View.statusbar.innerHTML = "Deleted!"
      // loadCandidates(ElectionId, displayCandidates)  //re-load candidates so that we reset OriginalCandidatesFromServer and ensure that we have the latest list
      // resetCandidates()
      updateSaveButton()
      return
    }
    Piv.http.post(["/api/elections/" + electionId + "/batch_candidates"], [{"candidates": newAndChangedCandidates}], function(candidates) {
      displayCandidates(candidates)
      SaveInProgress = false
      SaveCandidatesButton.innerHTML = innerHtml
      View.statusbar.innerHTML = "Saved!"
    })
  }

  // close the self-executing function and feed libraries to it
})(piv, dragula, election)
