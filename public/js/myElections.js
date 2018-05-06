'use strict';
//create a file-specific context via a function
(function(Piv) {

// script-level variables
var View = Piv.view
var MyElectionsView = {}
var ElectionsDomel
var HasShowElectionsRun, InvitesData

// actions (do stuff)
Piv.data = MyElectionsView.elections = {}

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

View.setHeader("My Elections")

// Piv.div(View.workspace, "", "w100 font-size-3 padding-1 textLeft color-white", "Ranked")
// var ElectionsSection = Piv.div(View.workspace, "", "container1")
// TieSelectedButton = Piv.div("", "", "clickable1 disabled", "Tie Selected", "", "click", tieSelected)
// Piv.div(ElectionsSection, "", "textRight w100", TieSelectedButton)
ElectionsDomel = Piv.html(View.workspace, "ol", "", {"class": "w100"})
// Piv.div(ElectionsSection, "", "w100", Piv.div("", "", "w100 textLeft", ElectionsDomel))
Piv.div(View.workspace, "", "w100", Piv.div("", "", "w100 textLeft", ElectionsDomel))

Piv.http.get(["/api/elections/", "/api/invite/acceptable"], showAllMyElections)


function showAllMyElections(elections, invitesData) {
  var invites = {}, invite
  console.log(invitesData)
  for (var key in invitesData) {
    invite = invitesData[key]
    // invites[invite.election_id] = invite.code
    invites[invite.election_id] = invite
  }
  var election
  for (var key in elections) {
    election = elections[key]
    showElection(ElectionsDomel, election.name, election.id, election.can_vote, "canViewResults", election.can_edit, invites[election.id] ? invites[election.id].code : "")
    delete invites[election.id]
  }
  for (var key in invites) {
    invite = invites[key]
    showElection(ElectionsDomel, invite.election_name, invite.election_id, "can_vote", "canViewResults", "", invite.code)
  }
}

function showElection(container, name, id, canVote, canViewResults, canEdit, inviteCode) {
  var thisElection = MyElectionsView.elections[id] = {}
  var hiddenStyle = "visibility:hidden;", hiddenAttObj = {"style": hiddenStyle, "class": "clickable5"}, resultsButton, defaultHref = "", defaultButton = ""

  container = Piv.html(container, "li", "", {"class": "w100 border-bottom-1 hover-1"})

  // var nameButton = thisElection.nameButton = Piv.html(container, "a", name, {"class": "w50", "href": defaultHref});
  var nameButton = thisElection.nameButton = Piv.html(container, "a", name, {"class": "w50"});
  if (inviteCode) addEventAcceptToButton(id, inviteCode, nameButton)

  if (canEdit) {
    defaultHref = "candidates/" + id
    defaultButton = Piv.html(container, "a", "Administer", {"href": defaultHref, "class": "clickable5"})
  }
  else { Piv.html(container, "a", "Administer", hiddenAttObj) }

  if (canVote || inviteCode) {
    defaultHref = "ballot/" + id
    defaultButton = Piv.html(container, "a", "Vote", {"href": defaultHref, "class": "clickable5"})
    if (inviteCode) addEventAcceptToButton(id, inviteCode, defaultButton)
  }
  else { thisElection.voteButton = Piv.html(container, "a", "Vote", hiddenAttObj) }
  nameButton.setAttribute("href", defaultHref)
  // nameButton.href = defaultHref

  if (canViewResults) { resultsButton = Piv.html(container, "a", "View Results", {"href": "results/" + id, "style": hiddenStyle, "class": "clickable5"}) }
  // if (canViewResults) { resultsButton = Piv.html(container, "a", "View Results", {"href": "results/" + id, "class": "clickable5"}) }
  else {resultsButton = Piv.html(container, "a", "View Results", hiddenAttObj) }

  if (defaultButton) { linkElsOnHover(defaultButton, nameButton, "hoverlink-1") }

  Piv.http.get(["/api/elections/" + id + "/result"], function() { resultsButton.style.visibility = null })  //noe revert
}
function linkElsOnHover(el1, el2, hoverclass) {
    el1.addEventListener("mouseenter", function() {Piv.addClass(el2, hoverclass)})
    el1.addEventListener("mouseleave", function() {Piv.removeClass(el2, hoverclass)})
    el2.addEventListener("mouseenter", function() {Piv.addClass(el1, hoverclass)})
    el2.addEventListener("mouseleave", function() {Piv.removeClass(el1, hoverclass)})
}

function addEventAcceptToButton(electionId, code, button) {
  console.log(code)
  button.removeAttribute("style")
  button.setAttribute("href", "ballot/" + electionId)
  button.addEventListener("click", function() {
    Piv.http.post(["/api/invite/accept"], [{"code": code}])
  })
}
// close the self-executing function and feed the piv library to it
})(piv)
