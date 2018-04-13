'use strict';

//create a file-specific context via a function
(function(Piv, Dragula, ElectionId) {

// script-level variables
var View = Piv.view
var SavedStatusDomel, ReviewedStatusDomels = {}
var Rankeditems, Unrankeditems

// actions (do stuff)
Piv.evmanage.setManager(View.workspace, ["click"])

View.setHeader("Cast Ballot", ElectionId)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

Piv.div(View.workspace, "", "textRight w75", Piv.div("", "", "clickable1", "Tie Selected", "", "click", tieSelected))
// Rankeditems = Piv.table(View.workspace, "", {"id": "rankeditems", "class": "itemlist incrementsCounter grabbable hasLabelFrame w100"})
Rankeditems = Piv.div("", "", "", "", {"id": "rankeditems", "class": "incrementsCounter grabbable hasLabelFrame w100"})
Piv.div(View.workspace, "", "w100 marginB1", Piv.div("", "", "w75", Rankeditems))
// Unrankeditems = Piv.table(View.workspace, "", {"id": "unrankeditems", "class": "cursorPointer hasLabelFrame"})
Unrankeditems = Piv.div("", "", "", "", {"id": "unrankeditems", "class": "cursorPointer hasLabelFrame w100"})
Piv.div(View.workspace, "", "w100 marginB1", Piv.div("", "", "w75", Unrankeditems))

// Rankeditems = Piv.html(View.workspace, "ol", "", {"id": "rankeditems", "class": "itemlist incrementsCounter grabbable hasLabelFrame"});
// Unrankeditems = Piv.html(View.workspace, "ul", "", {"id": "unrankeditems", "class": "itemlist cursorPointer hasLabelFrame"});

ReviewedStatusDomels.div = Piv.div(View.workspace, "", "textRight w75")
var reviewedButton = Piv.html(ReviewedStatusDomels.div, "label", "", {"class": "clickable1"})
ReviewedStatusDomels.checkbox = Piv.checkbox(reviewedButton, "reviewedStatusCheckbox", "", "16px", "", {"class": "marginR1"}, function() {
  if (ReviewedStatusDomels.checkbox.input.checked) {
    if (ReviewedStatusDomels.messageDiv) {
      ReviewedStatusDomels.messageDiv.parentElement.removeChild(ReviewedStatusDomels.messageDiv)
      delete ReviewedStatusDomels.messageDiv
    }
    Piv.http.post(["/api/election/" + ElectionId + "/set_ready"], [{"approved_version": ReviewedStatusDomels.version}], function(response) {
      if (!response.is_latest) {
        ReviewedStatusDomels.checkbox.input.checked = false
        Piv.loadBallot(ElectionId, Piv.displayBallot, li1)
        ReviewedStatusDomels.messageDiv = Piv.div(ReviewedStatusDomels.div, "", "row1 text3", "The administrator has updated the ballot since loading the page. Please review again.")
        ReviewedStatusDomels.version = response.latest_version
      }
    })
  }
  else {
    Piv.http.post(["/api/election/" + ElectionId + "/set_ready"], [{"approved_version": null}], function(response) {
    })
  }
})
Piv.http.get(["/api/election/" + ElectionId + "/get_ready"], function(response) {
  ReviewedStatusDomels.version = response.latest_version
  ReviewedStatusDomels.checkbox.input.checked = ReviewedStatusDomels.isApproved = response.is_latest
})
// Piv.html(ReviewedStatusDomels.div, "label", "Reviewed", {"for": "reviewedStatusCheckbox", "class": "label0"})
Piv.div(reviewedButton, "", "", "Reviewed")
// Piv.div(View.workspace, "", "textRight w75", )

Piv.loadBallot(ElectionId, Piv.displayBallot, li1)

setUpDragHandling(Dragula, Rankeditems, Unrankeditems)

// function definitions
function li1(parent, id, description, tie, isNew) {
  var candidateLiAtts = {"class": "row1 triggerHoverOpacity75", "data-id": id}

  if ("new" == isNew) { candidateLiAtts["data-isNew"] = "new" }
  if (tie) { candidateLiAtts["data-tie"] = tie }
  // var box = Piv.html(parent, "li", "", candidateLiAtts)
  var box = Piv.html(parent, "div", "", candidateLiAtts)

  // Piv.div(box, "", "hidden1 text1", "new")
  Piv.div(box, "", "text1square orderdisplay");
  // Piv.div(box, "", "grabbable text1 hoverOpacity75", "::", {"style": "width:21px"});
  Piv.div(box, "", "grabbable text1 hoverOpacity75", "::", {"width": "21px"});
  var descriptionBox = Piv.div(box, "", "text1 w67 hoverOpacity75")
  Piv.div(descriptionBox, "", "display_none_1 text4 marginR1", "new")
  Piv.div(descriptionBox, "", "", description)
  // var checkbox = Piv.html(box, "input", "", {"type": "checkbox", "class": "hidden2 text1square cursorPointer", "name": "ballotcheck", "id": "ballotcheck-" + id})
  // var tiebutton = Piv.div(box, "", "hidden3 clickable1", "tie")
  // var tiebutton = Piv.div(box, "", "clickable2", "tie")

  // var xbutton = Piv.div(box, "", "hidden3 clickable1", "X", "")
  var xbutton = Piv.div(box, "", "clickable2 hidden1", "X", {"width": "21px"})
  var checkbox = Piv.checkbox(box, "ballotcheck-" + id, "ballotcheck", "20px", "", {"class": "hidden1", "width": "21px"})

  Piv.domeldata.set(box, id, "id")
  // Piv.domeldata.set(checkbox, box, "box")
  Piv.domeldata.set(checkbox.input, box, "box")
  Piv.boxlist = Piv.boxlist || [];
  Piv.boxlist.push(box)
  Piv.evmanage.listen(box, "click", candidateClick, [box])
  // Piv.evmanage.listen(tiebutton, "click", tieSelected)
  Piv.evmanage.listen(xbutton, "click", sendToEnd, [box])
}

function setUpDragHandling(dragula, rankeditems, unrankeditems) {
  var tieCleanupNeeded = false, dragStartState = {}
  var drake = dragula([rankeditems, unrankeditems])

  drake.on('drag', function (el) { onCandidateDrag(el) })
  drake.on('drop', function (el) { onCandidateDrop(el) })

  // saves off data that we will need on drop
  function onCandidateDrag(domel) {
    dragStartState.prevSibling = domel.previousElementSibling
    dragStartState.nextSibling = domel.nextElementSibling
    dragStartState.tieStatus = getTieStatus(domel)
  }
  function onCandidateDrop(domel) {
    updateFormerSiblingTieStatuses(dragStartState.tieStatus, dragStartState.prevSibling, dragStartState.nextSibling)  // update the tie statuses for the element's former siblings
    setTieStatusAfterDrop(domel)  // update the tie status based on where the element was dragged to
    onReorder(domel)
  }
  function setTieStatusAfterDrop(domel) {
    var tieStat = getTieStatus(domel.previousElementSibling)
    if (!tieStat || "end" == tieStat) {
      setTieStatus(domel, "none")
      return
    }
    setTieStatus(domel, "middle")
  }
}

function getTieStatus(domel) {
  if (!domel) return null
  return domel.getAttribute("data-tie")
}
function setTieStatus(domel, position) {
  if (position == "none") {
    domel.removeAttribute("data-tie")
  }
  else {
    domel.setAttribute("data-tie", position)
  }
}

// noe - maybe needs some work (including everything that uses it). not sure how much I like this paradigm in general
function updateFormerSiblingTieStatuses(tieStat, prevSibling, nextSibling) {
  var sibling, sibTieStat

  // don't need to do anything of the dragged item was in the middle of a tie or not part of a tie
  if (!tieStat || "middle" == tieStat) return

  // if the dragged element was the START of a tie, we need to update the NEXT element sibling
  if ("start" == tieStat) {
    sibling = nextSibling, sibTieStat = getTieStatus(sibling)
    if ("end" == sibTieStat) {
      setTieStatus(sibling, "none") // there were only two elements in this tie, so there is no tie anymore
      return
    }
    if ("middle" == sibTieStat) {
      setTieStatus(sibling, "start") // the next sibling becomes the new start for this tie
      return
    }
    else return
  }

  // if the dragged element was the END of a tie, we need to update the PREVIOUS element sibling
  sibling = prevSibling, sibTieStat = getTieStatus(sibling)
  if ("start" == sibTieStat) {
    setTieStatus(sibling, "none") // there were only two elements in this tie, so there is no tie anymore
  }
  else if ("middle" == sibTieStat) {
    setTieStatus(sibling, "end") // the previous sibling becomes the new end for this tie
  }
}
function getCheckedCandidates(uncheck) {
  var candidates = [], checkbox, checkboxes = Rankeditems.querySelectorAll("input:checked")

  for (var i = 0; i < checkboxes.length; i++) {
    checkbox = checkboxes[i]
    candidates.push({
      "box": Piv.domeldata.get(checkbox, "box"),
      "checkbox": checkbox
    })
    if (uncheck) checkbox.checked = false
  }

  return candidates
}
function tieSelected(box, checkbox, rankeditems, afterEl) {
  var candidate, candidates = getCheckedCandidates("uncheck")
  if (candidates.length < 1) return  //no need to do anything if there is only one candidate selected

  // loop over all the candidates except the first and last and insert them after the first candidate
  for (var i = 1; i < candidates.length; i++) {
    candidate = candidates[i]
    updateFormerSiblingTieStatuses( getTieStatus(candidate.box), candidate.box.previousElementSibling, candidate.box.nextElementSibling)
    setTieStatus(candidate.box, "middle")
    Piv.insertAfter(candidate.box, candidates[i - 1].box)
  }

  // set the tie statuses of the first and last elements
  var boxFirst = candidates[0].box, boxLast = candidates[candidates.length - 1].box
  var tieAtt = getTieStatus(boxFirst)
  if (!tieAtt) {
    setTieStatus(boxFirst, "start")
    setTieStatus(boxLast, "end")
  }
  else if ("end" == tieAtt) {
    setTieStatus(boxFirst, "middle")
    setTieStatus(boxLast, "end")
  }
  else {
    setTieStatus(boxLast, "middle")
  }
  onReorder()
}
function sendSelectedToEnd() {
  var box, candidates = getCheckedCandidates("uncheck")

  for (var i = 0; i < candidates.length; i++) {
    sendToEnd(candidates[i].box)
  }
  onReorder()
}
function sendToEnd(box) {
  updateFormerSiblingTieStatuses( getTieStatus(box), box.previousElementSibling, box.nextElementSibling)
  setTieStatus(box, "none")
  Unrankeditems.appendChild(box);
  onReorder()
}
function candidateClick(box) {
  if (this.eContext.log.length > 0) return  //quit if the user clicked one of the action buttons
  if (box.parentElement == Rankeditems) return   //no action when clicking a ranked item
  Rankeditems.appendChild(box);
  onReorder(box);
}
function onReorder(candidateEl) {
  if (candidateEl) { candidateEl.removeAttribute("data-isNew")}
  updateInstructions(Rankeditems.childElementCount);
  saveRankings();
}
function updateInstructions(rankeditemsCount) {
  // var header = document.getElementById("instructions");
  // if (document.getElementById("unrankeditems").childElementCount == 0) {
  //   header.innerHTML = "You may continue sorting items. When satisfied, you can move on to the Review step.";
  //   return;
  // }
  // header.innerHTML = "Select your " + ordinalSuffix(rankeditems.childElementCount + 1) + " choice";
}

var saveStatus = ""
function saveRankings() {
  //if a save is already in progress, just record that we need to save again and quit
  if (("saving" == saveStatus) || ("queued" == saveStatus)) {
    saveStatus = "queued"
    return "queued"
  }
  saveStatus = "saving"
  updateStatusDisplay("Saving...")
  var candidateRanks = {}
  candidateRanks.votes = makeRankingsArray()
  batchVote(ElectionId, candidateRanks)
  return "saving"
}
function finishSaveRankings(response) {
  if ("queued" == saveStatus) {
    saveStatus = "saved"  //reset saveStatus so that saveRankings doesn't just quit
    saveRankings()
    return
  }
  saveStatus = "saved"
  updateStatusDisplay("Saved!")
}
function updateStatusDisplay(newStatus) {
  if (!SavedStatusDomel) { SavedStatusDomel = Piv.div(View.workspace, "", "row1 text3") }
  SavedStatusDomel.innerHTML = newStatus
}
function makeRankingsArray () {
  var rankings = [];
  candidatesToArray(Rankeditems.querySelectorAll("[data-id]"), rankings, "getRanking");
  candidatesToArray(Unrankeditems.querySelectorAll("[data-id]"), rankings);

  return rankings
}

function candidatesToArray(candidates, targetArray, isRanked) {
  var tieStat, isTiedWthPrevious, rank = 0
  for (var i = 0; i < candidates.length; i++) {
    var item = {};

    item.candidate_id = candidates[i].getAttribute("data-id");

    if (isRanked != "getRanking") {
      item.rank = 0
      targetArray.push(item)
      continue
    }

    tieStat = getTieStatus(candidates[i])
    isTiedWthPrevious = ((tieStat == "middle") || (tieStat == "end"))
    if (isTiedWthPrevious) {item.rank = rank}
    else {item.rank = ++rank}

    targetArray.push(item);
  }
};
function batchVote(electionId, candidateRanks) {
  if (!electionId) {return}
  Piv.http.post(["/api/election/" + electionId + "/batchvote"], [candidateRanks], finishSaveRankings)
}

// close the self-executing function and feed the piv library to it
})(piv, dragula, election)
