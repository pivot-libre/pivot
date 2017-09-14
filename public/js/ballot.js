'use strict';

//save rankings right at the beginning, so that we update the header and record that the user has seen the ballot
onBallotItemMove();

//set up drag/drop rules
var drake = dragula([document.getElementById("rankeditems"), document.getElementById("unrankeditems")]);
drake.on('drop', function (el) { onBallotItemDrop(el); })


//functions
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
function insertAfter(el, afterEl) {
  if (afterEl.nextElementSibling) { afterEl.parentNode.insertBefore(el, afterEl.nextElementSibling); }
  else {afterEl.parentNode.appendChild}
}
function banish(el, vars) {
  var item = el.parentElement.parentElement
  if (!vars.unrankeditems) { vars.unrankeditems = document.getElementById("unrankeditems"); }
  //unckeck, remove tie attributes, and send to the end of the unranked list
  el.checked = false;
  markTieAtt(item, "none");
  vars.unrankeditems.appendChild(item);
}
function processSelected(event, processFunction) {
  event.preventDefault();
  event.stopPropagation();
  var functionVars = {}, el, els = document.querySelectorAll(".ballotrank > input:checked");
  for (var i = 0; i < els.length; i++) {
    processFunction(els[i], functionVars);
  }
  onBallotItemMove();
}
function ballotItemClick(el) {
  var rankeditems = document.getElementById("rankeditems");
  if (el.parentElement == rankeditems) { return; }  //no action when clicking a ranked item

  rankeditems.appendChild(el);
  onBallotItemMove(rankeditems);
}
function ordinalSuffix(i) {
  //(got this here: https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number)
  var j = i % 10, k = i % 100;
  if (j == 1 && k != 11) { return i + "st"; }
  if (j == 2 && k != 12) { return i + "nd"; }
  if (j == 3 && k != 13) { return i + "rd"; }
  return i + "th";
}
function markTieEnds() {
  //noe - this doesn't account for cases where the last item is part of a tie. The behavior isn't too bad, though (it allows you to drag items onto the end of the tie), so I'm leaving it for now
  var selector = "#rankeditems > .ballotselection[data-tie='middle'] + .ballotselection:not([data-tie='middle']):not([data-tie='end'])";
  var itemsAfterTies = document.querySelectorAll(selector);
  for (var i = 0; i < itemsAfterTies.length; i++) {
    markTieAtt(itemsAfterTies[i].previousElementSibling, "end");
  }
}
function markTieStarts() {
  var selector = "#rankeditems > .ballotselection:not([data-tie='start']):not([data-tie='middle']) + [data-tie='middle']";
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
  var selector = "#rankeditems > .ballotselection:not([data-tie]) + .ballotselection[data-tie]";
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
// function mergeIntoTies() {
//   var selector = "#rankeditems > .ballotselection[data-tie]:not([data-tie='end']) + .ballotselection:not([data-tie])";
//   var itemsAmidTies = document.querySelectorAll(selector);
//   for (var i = 0; i < itemsAmidTies.length; i++) {
//     console.log(itemsAmidTies[i]);
//     markTieAtt(itemsAmidTies[i], "middle");
//   }
// }
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
function onBallotItemDrop(item) {
  var previousItem, previousItemTieAtt;
  previousItem = item.previousElementSibling;
  if (previousItem) { previousItemTieAtt = previousItem.getAttribute("data-tie"); }
  if (previousItemTieAtt == "start" || previousItemTieAtt == "middle") {
    markTieAtt(item, "middle");
  }
  else { markTieAtt(item, "none"); }
  onBallotItemMove();
}
function cleanUpTies() {
  // mergeIntoTies();
  markTieStarts();
  markTieEnds();
  removeLoneTieItems();
}
function onBallotItemMove(rankeditems) {
  cleanUpTies();
  rankeditems = rankeditems || document.getElementById("rankeditems");
  updateHeader(rankeditems.childElementCount);
  saveRankings();
}
function updateHeader(rankeditemsCount) {
  var header = document.getElementById("ballotspaceheaderline1");
  if (document.getElementById("unrankeditems").childElementCount == 0) {
    header.innerHTML = "You may continue sorting items. When satisfied, you can move on to the Review step.";
    return;
  }
  header.innerHTML = "Select your " + ordinalSuffix(rankeditems.childElementCount + 1) + " choice";
}
function saveRankings () {
  var rankingsJson = makeRankingsJson();
  saveRankingsToServer(rankingsJson);
}
function saveRankingsToServer(rankingsJson) {
  sendHttpPostRequest("saveRankings.php", "rankingsJson=" + rankingsJson, successfullySaved);
}
function successfullySaved() {
  console.log("saved!");
}
function makeRankingsJson () {
  var rankings = {};
  rankings.ranked = [];
  rankings.unranked = [];
  ;
  ballotItemsToArray(document.querySelectorAll("#rankeditems .ballotselection"), rankings.ranked);
  ballotItemsToArray(document.querySelectorAll("#unrankeditems .ballotselection"), rankings.unranked);

  // return rankings;
  return JSON.stringify(rankings);
}

function ballotItemsToArray (items, toArray) {
  for (var i = 0; i < items.length; i++) {
    var item = {};
    item.description = items[i].querySelector(".ballotdescription").innerHTML;
    item.tie = items[i].getAttribute("data-tie");
    toArray.push(item);
  }
};


function sendHttpPostRequest(serviceFileName, request, onSuccessFunction, onFailFunction) {
  onFailFunction = onFailFunction || httpPostFail;  //default fail function
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      if (onSuccessFunction) { onSuccessFunction(xhttp.responseText); }
    }
    else if (this.readyState == 4 && this.status != 200) { onFailFunction(this.status); }
  }
  xhttp.open("POST", serviceFileName, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(request);
}
function httpPostFail(status) {
  // console.log("status: " + status);
}
