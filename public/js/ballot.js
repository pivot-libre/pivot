'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Cast Ballot"

anchorListDiv(workspace, "stepNavigator", {
    "Rank Candidates": "/ballot/" + election,
    "Review ballot": "/ballotReview/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var rankeditems = html(workspace, "ol", "", "id=rankeditems", "class=itemlist incrementsCounter grabbable hasLabelFrame");
var unrankeditems = html(workspace, "ol", "", "id=unrankeditems", "class=itemlist clickable hasLabelFrame");
var drake = dragula([rankeditems, unrankeditems]);
drake.on('drop', function (el) { onCandidateDrop(el); })

// displayCandidate(rankeditems, "", "description", "cost", "", "")
// displayCandidate(rankeditems, "", "description", "cost", "", "")
// displayCandidate(unrankeditems, "", "description", "cost", "", "yes")
// displayCandidate(unrankeditems, "", "description", "cost", "", "yes")

// loadCandidates(election, displayCandidates)
loadBallot(election, displayBallot)

function loadBallot(electionId, onSuccessFunction) {
  //define functions that we will use to get both the candidate definitions and the user's ranked ballot
  var getballotDefinition = function() { return axios.get('/api/election/' + electionId + '/candidate') }
  var getRankedBallot = function() { return axios.get('/api/election/' + electionId + '/batchvote') }

  axios.all([getballotDefinition(), getRankedBallot()])
    .then(axios.spread(function (definition, rankings) {
      // Both requests are now complete
      // console.log(acct.data, perms.data)
      onSuccessFunction(definition.data, rankings.data)
    }));
}
function displayBallot(ballotDefinition, rankedBallot) {
  var candidate, sortedDefinitions = {}, sortedCandidates = {}
  console.log(rankedBallot.length)

  //if the user hasn't looked at this ballot before, we can simply display the ballot definition
  if (0 == rankedBallot.length) { dispayCandidatesWithRank("", ballotDefinition, rankeditems, unrankeditems); return}

  //build a list of candidate definitions
  for (var key in ballotDefinition) {
    candidate = ballotDefinition[key]
    sortedDefinitions[candidate.id] = candidate
  }

  //build lists of all the candidates that were previously given each rank
  for (var key in rankedBallot) {
    candidate = rankedBallot[key]
    if (!sortedCandidates[candidate.rank]) { sortedCandidates[candidate.rank] = [] }
    sortedCandidates[candidate.rank].push(sortedDefinitions[candidate.candidate_id])
    delete sortedDefinitions[candidate.candidate_id]
  }

  //add any candidates that are new since the user last reviewed this ballot
  for (var key in sortedDefinitions) {
    candidate = sortedDefinitions[key]
    if (!sortedCandidates[""]) { sortedCandidates[""] = [] }
    sortedCandidates[""].push(candidate)
  }
  // console.log(ballotDefinition, rankedBallot)
  // console.log(sortedDefinitions)
  // console.log(sortedCandidates)
  for (var rank in sortedCandidates) {
    dispayCandidatesWithRank(rank, sortedCandidates[rank], rankeditems, unrankeditems)
  }
}
function dispayCandidatesWithRank(rank, candidates, rankeditems, unrankeditems) {
  var candidate
  for (var key in candidates) {
    candidate = candidates[key]
    //if not ranked, it goes in the unranked group
    if (!rank || 0 == rank) { displayCandidate(unrankeditems, candidate.id, candidate.name, "", "", ("" == rank ? "new": "")); continue }

    //if length is 1, it is not a tie
    if (1 == candidates.length) { displayCandidate(rankeditems, candidate.id, candidate.name, "", ""); continue }

    //handle ties:
    //if length is greater than 1 and this is the first key, we are at the start of a tie
    if (0 == key) { displayCandidate(rankeditems, candidate.id, candidate.name, "", "start", ""); continue }

    //if this is not the last key, we are in the middle of a tie
    if (key < candidates.length - 1) { displayCandidate(rankeditems, candidate.id, candidate.name, "", "middle", ""); continue }

    //if we've gotten this far, we must be at the end of a tie
    displayCandidate(rankeditems, candidate.id, candidate.name, "", "end", "")
  }
}
function displayCandidate(parent, uniq, description, cost, tie, isNew) {
  var tie = tie ? "data-tie=" + tie : ""
  var box = html(parent, "li", "", "class=candidate", "onclick=candidateClick(this)", "data-id=" + uniq, tie);

  if ("new" == isNew) { div(box, "", "newitem", "new");}
  var rankingTools = div(box, "", "rankingTools");
  html(rankingTools, "input", "", "type=checkbox", "name=ballotcheck", "id=ballotcheck-" + uniq);
  div(rankingTools, "", "banish", "", "onclick=processSelected(event,banish)");
  div(rankingTools, "", "tie", "", "onclick=processSelected(event,tieSelected)");
  html(rankingTools, "label", "", "class=check", "for=ballotcheck-" + uniq);
  div(rankingTools, "", "rankdisplay");

  var details = div(box, "", "candidateDetails");
  div(details, "", "grippy");
  div(details, "", "candidateDescription", description);
  div(details, "", "candidateCost", cost);
}


function markTieAtt(item, position) {
  if (position == "none") {
    item.removeAttribute("data-tie");
    // item.style["background-color"] = "";
  }
  else {
    item.setAttribute("data-tie", position);
    // item.style["background-color"] = "yellow";
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
  onCandidateMove();
}
function onReorder(el) {
  //placeholder
}
function processSelected(event, processFunction) {
  event.preventDefault();
  event.stopPropagation();
  var functionVars = {}, el, els = document.querySelectorAll(".rankingTools > input:checked");
  for (var i = 0; i < els.length; i++) {
    processFunction(els[i], functionVars);
  }
  onCandidateMove();
}
function tieSelected(el, vars) {
  var item = el.parentElement.parentElement, tieAtt = item.getAttribute("data-tie");
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
function banish(el, vars) {
  var item = el.parentElement.parentElement
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
  onCandidateMove(rankeditems);
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
function onCandidateMove(rankeditems) {
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
// var saveStatuses = {}, saveStatuses.status = "", saveStatuses.
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
  batchVote(election, candidateRanks, finishSaveRankings)
  return "saving"
}
function finishSaveRankings(response) {
  console.log(response);
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
  if (!saveStatusDomEl) { saveStatusDomEl = div(workspace, "saveStatusDomEl")}
  saveStatusDomEl.innerHTML = newStatus
}
function makeRankingsArray () {
  var rankings = [];
  candidatesToArray(document.querySelectorAll("#rankeditems .candidate"), rankings, "getRanking");
  candidatesToArray(document.querySelectorAll("#unrankeditems .candidate"), rankings);

  return rankings
}

function candidatesToArray (candidates, targetArray, isRanked) {
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
// var candidateRanks = {}
// candidateRanks.votes = []
// candidateRanks.votes.push({"candidate_id": 10, "rank":1})
// candidateRanks.votes.push({"candidate_id": 1, "rank":1})
// batchVote(election, candidateRanks)
function batchVote(electionId, candidateRanks, onSuccessFunction) {
  // console.log(candidateRanks)
  if (!electionId) {return}
  axios.post('/api/election/' + electionId + '/batchvote', candidateRanks)
    .then(response => {
      // console.log(response.data);
      onSuccessFunction(response.data)
    });
}
// getRankedCandidates(1,1)
// getRankedCandidates(1,10)
function getRankedCandidates(electionId, candidateId, onSuccessFunction) {
  if (!electionId) {return}
  // axios.get('/api/election/' + electionId + '/candidate')
  axios.get('/api/election/' + electionId + '/candidate/' + candidateId)
  // axios.get('/api/election/' + electionId + '/batchvote/' + candidateId)
  // axios.get('/api/election/' + electionId + '/batchvote')
    .then(response => {
      console.log(response.data);
      // onSuccessFunction(response.data)
    });
}
