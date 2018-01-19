'use strict';

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Cast Ballot"

anchorListDiv(workspace, "", {
    "Rank Candidates": "/ballot/" + election,
    "Review ballot": "/ballotReview/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var rankeditems = html(workspace, "ol", "", {"id": "rankeditems", "class": "itemlist incrementsCounter grabbable hasLabelFrame"});
var unrankeditems = html(workspace, "ul", "", {"id": "unrankeditems", "class": "itemlist cursorPointer hasLabelFrame"});
var drake = dragula([rankeditems, unrankeditems]);
drake.on('drop', function (el) { onCandidateDrop(el); })

loadBallot(election, displayBallot, li1)

function li1(parent, uniq, description, cost, tie, isNew) {
  var candidateLiAtts = {"class": "row1", "onclick": "candidateClick(this)", "data-id": uniq}
  if ("new" == isNew) { candidateLiAtts["data-isNew"] = "new" }
  if (tie) { candidateLiAtts["data-tie"] = tie }
  var box = html(parent, "li", "", candidateLiAtts);

  div(box, "", "hidden1 text1", "new")
  div(box, "", "text1square orderdisplay");
  div(box, "", "grabbable text1", "^v");
  div(box, "", "text1 w67", description);
  html(box, "input", "", {"type": "checkbox", "class": "hidden2 text1square cursorPointer", "name": "ballotcheck", "id": "ballotcheck-" + uniq})
  div(box, "", "hidden3 clickable1", "tie", {"onclick": "processSelected(event,tieSelected)"})
  div(box, "", "hidden3 clickable1", "X", {"onclick": "processSelected(event,sendToEnd)"});
}


function markTieAtt(item, position) {
  if (position == "none") {
    item.removeAttribute("data-tie");
  }
  else {
    item.setAttribute("data-tie", position);
  }
}
function onCandidateDrop(item) {
  var previousItem, previousItemTieAtt;

  //handle ties
  previousItem = item.previousElementSibling;
  if (previousItem) { previousItemTieAtt = previousItem.getAttribute("data-tie"); }
  if (previousItemTieAtt == "start" || previousItemTieAtt == "middle") {
    markTieAtt(item, "middle");
  }
  else { markTieAtt(item, "none"); }

  //do standard candidate move stuff
  onCandidateMove(item);
}
function processSelected(event, processFunction) {
  event.preventDefault();
  event.stopPropagation();
  var functionVars = {}, el, els = document.querySelectorAll("input:checked");
  for (var i = 0; i < els.length; i++) {
    processFunction(els[i], functionVars);
  }
  onCandidateMove();
}
function tieSelected(el, vars) {
  var item = el.parentElement, tieAtt = item.getAttribute("data-tie");
  if (!vars.rankeditems) {
    vars.rankeditems = document.getElementById("rankeditems");
    if (!tieAtt) { markTieAtt(item, "start"); }
    else if (tieAtt == "end") { markTieAtt(item, "middle"); }
  }
  else {
    insertAfter(item, vars.afterEl);
    markTieAtt(item, "middle");
  }
  vars.afterEl = item;  //save off the item, so we can append after it on the next iteration
  el.checked = false;
}
function removeCandidate(item) {
  item.parentElement.removeChild(item)
}
function sendToEnd(el, vars) {
  var item = el.parentElement
  if (!vars.unrankeditems) { vars.unrankeditems = document.getElementById("unrankeditems"); }
  //unckeck, remove tie attributes, and send to the end of the unranked list
  el.checked = false;
  markTieAtt(item, "none");
  vars.unrankeditems.appendChild(item);
}
function candidateClick(el) {
  var rankeditems = document.getElementById("rankeditems");
  if (el.parentElement == rankeditems) { return; }  //no action when clicking a ranked item

  rankeditems.appendChild(el);
  onCandidateMove(el, rankeditems);
}
function markTieEnds() {
  //noe - this doesn't account for cases where the last item is part of a tie. The behavior isn't too bad, though (it allows you to drag items onto the end of the tie), so I'm leaving it for now
  var selector = "#rankeditems > .candidate[data-tie='middle'] + .candidate:not([data-tie='middle']):not([data-tie='end'])";
  var itemsAfterTies = document.querySelectorAll(selector);
  for (var i = 0; i < itemsAfterTies.length; i++) {
    markTieAtt(itemsAfterTies[i].previousElementSibling, "end");
  }
}
function markTieStarts() {
  var selector = "#rankeditems > .candidate:not([data-tie='start']):not([data-tie='middle']) + [data-tie='middle']";
  var itemsStartingTies = document.querySelectorAll(selector);
  for (var i = 0; i < itemsStartingTies.length; i++) {
    markTieAtt(itemsStartingTies[i], "start");
  }
  selector = "#rankeditems > [data-tie='middle']:first-child";
  itemsStartingTies = document.querySelectorAll(selector);
  for (var i = 0; i < itemsStartingTies.length; i++) {
    markTieAtt(itemsStartingTies[i], "start");
  }
}
function removeLoneTieItems() {
  var nextSibling;
  var selector = "#rankeditems > .candidate:not([data-tie]) + .candidate[data-tie]";
  var itemsAlone = document.querySelectorAll(selector);
  for (var i = 0; i < itemsAlone.length; i++) {
    nextSibling = itemsAlone[i].nextElementSibling;
    if (!nextSibling || !nextSibling.getAttribute("data-tie")) { markTieAtt(itemsAlone[i], "none"); }
  }
  selector = "#rankeditems > [data-tie]:first-child";
  itemsAlone = document.querySelectorAll(selector);
  for (var i = 0; i < itemsAlone.length; i++) {
    nextSibling = itemsAlone[i].nextElementSibling;
    if (!nextSibling || !nextSibling.getAttribute("data-tie")) { markTieAtt(itemsAlone[i], "none"); }
  }
}
function cleanUpTies() {
  // mergeIntoTies();
  markTieStarts();
  markTieEnds();
  removeLoneTieItems();
}
function onCandidateMove(candidateEl, rankeditems) {
  if (candidateEl) { candidateEl.removeAttribute("data-isNew")}
  cleanUpTies();
  rankeditems = rankeditems || document.getElementById("rankeditems");
  updateInstructions(rankeditems.childElementCount);
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
  updateStatusDisplay("Saving")
  var candidateRanks = {}
  candidateRanks.votes = makeRankingsArray()
  batchVote(election, candidateRanks)
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
  var saveStatusDomEl = document.getElementById("saveStatusDomEl")
  if (!saveStatusDomEl) { saveStatusDomEl = div(workspace, "saveStatusDomEl", "text1")}
  saveStatusDomEl.innerHTML = newStatus
}
function makeRankingsArray () {
  var rankings = [];
  candidatesToArray(document.querySelectorAll("#rankeditems li"), rankings, "getRanking");
  candidatesToArray(document.querySelectorAll("#unrankeditems li"), rankings);

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

    tieStat = candidates[i].getAttribute("data-tie")
    isTiedWthPrevious = ((tieStat == "middle") || (tieStat == "end"))
    if (isTiedWthPrevious) {item.rank = rank}
    else {item.rank = ++rank}

    targetArray.push(item);
  }
};
function batchVote(electionId, candidateRanks) {
  if (!electionId) {return}
  postToResource('/api/election/' + electionId + '/batchvote', candidateRanks, finishSaveRankings)
}
