'use strict';

//create a file-specific context via a function
(function(Piv, Dragula, ElectionId) {

  // script-level variables
  var View = Piv.view
  var ReviewedStatusDomels = {}, TieSelectedButton
  var Rankeditems, Unrankeditems
  var CurrElectorId = null

  // actions (do stuff)
  Piv.evmanage.setManager(View.workspace, ["click"])

  View.setHeader("Cast Ballot", ElectionId)
  View.statusbar.innerHTML = ""
  Piv.electionsMenu(View.sidenav, ElectionId)

  var ElectorDiv = Piv.div(View.workspace, "Electors", "text1")
  Piv.html(ElectorDiv, "span", "Who are you voting as? ", {})
  var ElectorCombo = Piv.html(ElectorDiv, "select", "", {})

  Piv.div(View.workspace, "", "w100 font-size-3 padding-1 textLeft color-white", "Ranked")
  var RankedSection = Piv.div(View.workspace, "", "container1")
  TieSelectedButton = Piv.div("", "", "clickable1 disabled", "Tie Selected", "", "click", tieSelected)
  Piv.div(RankedSection, "", "textRight w100", TieSelectedButton)
  Rankeditems = Piv.div("", "", "incrementsCounter grabbable w100")
  Piv.div(RankedSection, "", "w100", Piv.div("", "", "w100 textLeft", Rankeditems))

  Piv.div(View.workspace, "", "w100 font-size-3 padding-1 textLeft color-white", "Unranked")
  var UnrankedSection = Piv.div(View.workspace, "", "container1")
  Unrankeditems = Piv.div("", "", "cursor-pointer w100")
  Piv.div(UnrankedSection, "", "w100", Piv.div("", "", "w100 textLeft", Unrankeditems))

  ReviewedStatusDomels.div = Piv.div(View.workspace, "", "textRight w100")
  var reviewedButton = Piv.html(ReviewedStatusDomels.div, "label", "", {"class": "clickable1"})
  ReviewedStatusDomels.checkbox = Piv.checkbox(reviewedButton, "reviewedStatusCheckbox", "", "16px", "", {"class": "margin-right-1"}, function() {
    if (ReviewedStatusDomels.checkbox.input.checked) {
      if (ReviewedStatusDomels.messageDiv) {
        ReviewedStatusDomels.messageDiv.parentElement.removeChild(ReviewedStatusDomels.messageDiv)
        delete ReviewedStatusDomels.messageDiv
      }
      Piv.http.post(["/api/elections/" + ElectionId + "/set_ready"], [{"approved_version": ReviewedStatusDomels.version, "elector_id": CurrElectorId}], function(response) {
        if (!response.is_latest) {
          ReviewedStatusDomels.checkbox.input.checked = false
          Piv.loadBallot(ElectionId, Piv.displayBallot, li1)
          ReviewedStatusDomels.messageDiv = Piv.div(ReviewedStatusDomels.div, "", "w100 text3", "The administrator has updated the ballot since loading the page. Please review again.")
          ReviewedStatusDomels.version = response.latest_version
        }
      })
    }
    else {
      Piv.http.post(["/api/elections/" + ElectionId + "/set_ready"], [{"approved_version": null, "elector_id": CurrElectorId}], function(response) {
      })
    }
  })
  Piv.div(reviewedButton, "", "", "Reviewed")

  console.log("load electors")
  Piv.loadControlledElectors(ElectionId, function(electors) {
    console.log("loaded electors")
    console.log(electors)

    // add them to the combo box
    electors.forEach(function(elector){
      var display = elector.voter_name ? elector.voter_name : "&lt;self&gt;"
      Piv.html(ElectorCombo, "option", display, {"value": elector.id})
    })

    function selectElector() {
      var electorId = ElectorCombo.options[ElectorCombo.selectedIndex].value
      console.log("selected elector " + electorId)
      CurrElectorId = electorId
      Piv.loadBallot(ElectionId, electorId, Piv.displayBallot, li1, Rankeditems, Unrankeditems)

      Piv.http.post(["/api/elections/" + ElectionId + "/get_ready"], [{"elector_id": CurrElectorId}], function(response) {
        ReviewedStatusDomels.version = response.latest_version
        ReviewedStatusDomels.checkbox.input.checked = ReviewedStatusDomels.isApproved = response.is_latest
      })
    }

    selectElector()
    ElectorCombo.onchange = selectElector
  })

  setUpDragHandling(Dragula, [Rankeditems, Unrankeditems])

  // function definitions
  function li1(parent, id, description, tie, isNew) {
    var vobject = {}
    var candidateLiAtts = {"class": "w100 border-bottom-2 overflow-visible hover-1 drag-drop-1", "data-id": id}
    // var candidateLiAtts = {"class": "w100 border-bottom-2 overflow-visible nowrap hover-1", "data-id": id}
    // var candidateLiAtts = {"class": "w100 triggerHoverOpacity75", "data-id": id}

    if ("new" == isNew) { candidateLiAtts["data-isNew"] = "new" }
    if (tie) { candidateLiAtts["data-tie"] = tie }
    var box = vobject.domel =  Piv.html(parent, "li", "", candidateLiAtts)

    Piv.div(box, "", "text1square orderdisplay");
    Piv.div(box, "", "grabbable text3 hidden3", "::", {"width": "21px"});
    // Piv.div(box, "", "grabbable text1 hoverOpacity75", "::", {"width": "21px"});
    var descriptionBox = Piv.div(box, "", "text3 w75")
    // var descriptionBox = Piv.div(box, "", "text1 w67 hoverOpacity75")
    if ("new" == isNew) { Piv.div(descriptionBox, "", "display-none-1 text4 margin-right-1", "new") }
    Piv.div(descriptionBox, "", "", description)

    var xbutton = Piv.div(box, "", "clickable2 hidden1", "X", {"width": "21px"})
    var checkbox = vobject.checkbox = Piv.checkbox(box, "ballotcheck-" + id, "ballotcheck", "", "", {"class": "hidden1 margin-right-1"}, updateTieSelectedButton)
    // var checkbox = vobject.checkbox = Piv.checkbox(box, "ballotcheck-" + id, "ballotcheck", "20px", "", {"class": "hidden1", "width": "21px"}, updateTieSelectedButton)

    Piv.domeldata.set(box, id, "id")
    Piv.domeldata.set(checkbox.input, box, "box")
    Piv.boxlist = Piv.boxlist || [];
    Piv.boxlist.push(box)
    Piv.evmanage.listen(box, "click", candidateClick, [vobject])
    Piv.evmanage.listen(xbutton, "click", sendToEnd, [vobject])
  }

  function updateTieSelectedButton() {
    if (getCheckedCandidates().length > 1) { Piv.removeClass(TieSelectedButton, "disabled") }
    else { Piv.addClass(TieSelectedButton, "disabled") }
  }

  function setUpDragHandling(dragula, containers) {
    var tieCleanupNeeded = false, dragStartState = {}
    var drake = dragula(containers)

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

  function tieSelected() {
    var candidate, candidates = getCheckedCandidates("uncheck")
    if (candidates.length < 2) return  //no need to do anything if there is only one candidate selected

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

  function sendToEnd(vobject) {
    var domel = vobject.domel
    vobject.checkbox.input.checked = false  //make sure the checkbox gets unchecked
    updateFormerSiblingTieStatuses( getTieStatus(domel), domel.previousElementSibling, domel.nextElementSibling)
    setTieStatus(domel, "none")
    Unrankeditems.appendChild(domel);
    onReorder()
  }

  function candidateClick(vobject) {
    var domel = vobject.domel
    if (this.eContext.log.length > 0) return  //quit if the user clicked one of the action buttons
    if (domel.parentElement == Rankeditems) return   //no action when clicking a ranked item
    Rankeditems.appendChild(domel);
    onReorder(domel);
  }

  function onReorder(candidateEl) {
    if (candidateEl) { candidateEl.removeAttribute("data-isNew")}
    updateInstructions(Rankeditems.childElementCount)
    saveRankings()
    updateTieSelectedButton()
  }

  function updateInstructions(rankeditemsCount) {
    // var header = document.getElementById("instructions");
    // if (Unrankeditems.childElementCount == 0) {
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
    candidateRanks.elector_id = CurrElectorId
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
    View.statusbar.innerHTML = newStatus
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
    Piv.http.post(["/api/elections/" + electionId + "/batchvote"], [candidateRanks], finishSaveRankings)
  }

  // close the self-executing function and feed the piv library to it
})(piv, dragula, election)
