'use strict';
//create a file-specific context via a function
(function(Piv) {

// script-level variables
var View = Piv.view
var MyElectionsView = {}
var ElectionsDomel = Piv.html(View.workspace, "ol", "", {"class": "w100"})
var HasShowElectionsRun, InvitesData

// actions (do stuff)
Piv.data = MyElectionsView.elections = {}

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

View.setHeader("My Elections")

// noe - tyler added a GET API for acceptable, so we should switch to using getMultResources at some point
// Piv.postToResource('/api/invite/acceptable', {}, invites)
// Piv.getResource('/api/election/', showElections)
// Piv.getResource('/api/invite/acceptable', invites)
Piv.getMultResources(["/api/election/", "/api/invite/acceptable"], showAllMyElections)


function showAllMyElections(elections, invitesData) {
  var invites = {}, invite
  console.log(invitesData)
  for (var key in invitesData) {
    invite = invitesData[key]
    invites[invite.election_id] = invite.code
  }
  var election
  for (var key in elections) {
    election = elections[key]
    showElection(ElectionsDomel, election.name, election.id, election.can_vote, "canViewResults", election.can_edit, invites[election.id])
  }
}

// function showElections(myElections, d2) {
//   console.log(myElections)
//   console.log(d2)
//   return
//   var electn
//   for (var key in myElections) {
//     electn = myElections[key]
//     showElection(ElectionsDomel, electn.name, electn.id, electn.can_vote, "canViewResults", electn.can_edit)
//   }
//   HasShowElectionsRun = true
//   if (InvitesData) {
//     invites(InvitesData)
//     console.log("called invites from showElections")
//   }
// }
function showElection(container, name, id, canVote, canViewResults, canEdit, inviteCode) {
  var thisElection = MyElectionsView.elections[id] = {}
  var hiddenStyle = "visibility:hidden;", hiddenAttObj = {"style": hiddenStyle, "class": "margin4p0p4p0p"}, resultsButton, defaultHref = "", defaultButton = ""
  // var displayNoneStyle = "display:none;", displayNoneAttObj = {"style": displayNoneStyle, "class": "margin4p0p4p0p"}

  container = Piv.html(container, "li", "", {"class": "w100"})

  if (canEdit) {
    defaultHref = "administer/" + id
    // Piv.html(container.actions1, "a", "Administer", {"href": defaultHref, "class": "margin4p0p4p0p"})
    defaultButton = Piv.html(container, "a", "Administer", {"href": defaultHref, "class": "margin4p0p4p0p"})
  }
  // else { Piv.html(container.actions1, "a", "Administer", hiddenAttObj) }
  else { Piv.html(container, "a", "Administer", hiddenAttObj) }

  if (canVote || inviteCode) {
    defaultHref = "ballot/" + id
    defaultButton = Piv.html(container, "a", "Vote", {"href": defaultHref, "class": "margin4p0p4p0p"})
    if (inviteCode) addEventAcceptToButton(id, inviteCode, defaultButton)
  }
  else { thisElection.voteButton = Piv.html(container, "a", "Vote", hiddenAttObj) }

  var nameButton = thisElection.nameButton = Piv.html(container, "a", name, {"class": "w50 text1 margin4p0p4p0p", "href": defaultHref});
  if (inviteCode) addEventAcceptToButton(id, inviteCode, nameButton)

  // if (canViewResults) { resultsButton = Piv.html(container.actions2, "a", "View Results", {"href": "results/" + id, "style": displayNoneStyle, "class": "margin4p0p4p0p"}) }
  if (canViewResults) { resultsButton = Piv.html(container, "a", "View Results", {"href": "results/" + id, "style": hiddenStyle, "class": "margin4p0p4p0p"}) }
  // else { resultsButton = Piv.html(container.actions2, "a", "View Results", displayNoneAttObj) }
  else {resultsButton = Piv.html(container, "a", "View Results", hiddenAttObj) }

  if (defaultButton) { linkElsOnHover(defaultButton, nameButton, "hover1") }

  Piv.getResource('/api/election/' + id + '/result', function() { resultsButton.style.visibility = null })  //noe revert

}
function linkElsOnHover(el1, el2, hoverclass) {
    el1.addEventListener("mouseenter", function() {Piv.addClass(el2, hoverclass)})
    el1.addEventListener("mouseleave", function() {Piv.removeClass(el2, hoverclass)})
    el2.addEventListener("mouseenter", function() {Piv.addClass(el1, hoverclass)})
    el2.addEventListener("mouseleave", function() {Piv.removeClass(el1, hoverclass)})
}

// function invites(data) {
//   if (!HasShowElectionsRun) {
//     console.log("waiting until showElections is finished")
//     InvitesData = data
//     return
//   }
//   for (var key in data) {
//     var invite = data[key]
//     var election = MyElectionsView.elections[invite.election_id]
//     if (!election) {
//       showElection(ElectionsDomel, invite.election_name, invite.election_id, "", "canViewResults", "")
//       var voteButton = MyElectionsView.elections[invite.election_id].voteButton
//       addEventAcceptToButton(invite.election_id, invite.code, voteButton)
//       continue
//     }
//     var voteButton = election.voteButton
//     if (voteButton) {
//       addEventAcceptToButton(invite.election_id, invite.code, voteButton)
//       // linkElsOnHover(voteButton, thisElection.nameButton, "hover1")
//     }
//   }
// }
function addEventAcceptToButton(electionId, code, button) {
  console.log(code)
  button.removeAttribute("style")
  button.setAttribute("href", "ballot/" + electionId)
  button.addEventListener("click", function() {
    Piv.postToResource('/api/invite/accept', {"code": code})
  })
}
// close the self-executing function and feed the piv library to it
})(piv)
