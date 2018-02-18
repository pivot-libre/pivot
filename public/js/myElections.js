'use strict';
//create a file-specific context via a function
(function(piv) {

var myElectionsView = {}
piv.data = myElectionsView.elections = {}

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var view = piv.view
view.setHeader("My Elections")

var elections = {}
// elections.actions1 = piv.div(myElectionsView.view.workspace, "", "textRight w25")
// elections.name = piv.html(myElectionsView.view.workspace, "ol", "", {"class": "w50 textLeft"})
// elections.actions2 = piv.div(myElectionsView.view.workspace, "", "textLeft w25")
var elections = piv.html(view.workspace, "ol", "", {"class": "w100"})

piv.getResource('/api/election/', showElections)

var hasShowElectionsRun, invitesData
function showElections(myElections) {
  var electn
  for (var key in myElections) {
    electn = myElections[key]
    showElection(elections, electn.name, electn.id, electn.can_vote, "canViewResults", electn.can_edit)
  }
  hasShowElectionsRun = true
  if (invitesData) {
    console.log("called invitesData from showElections")
    invites(invitesData)
  }
}
function showElection(container, name, id, canVote, canViewResults, canEdit) {
  var thisElection = myElectionsView.elections[id] = {}
  var hiddenStyle = "visibility:hidden;", hiddenAttObj = {"style": hiddenStyle, "class": "margin4p0p4p0p"}, resultsButton, defaultHref = "", defaultButton = ""
  // var displayNoneStyle = "display:none;", displayNoneAttObj = {"style": displayNoneStyle, "class": "margin4p0p4p0p"}

  container = piv.html(container, "li", "", {"class": "w100"})

  if (canEdit) {
    defaultHref = "administer/" + id
    // piv.html(container.actions1, "a", "Administer", {"href": defaultHref, "class": "margin4p0p4p0p"})
    defaultButton = piv.html(container, "a", "Administer", {"href": defaultHref, "class": "margin4p0p4p0p"})
  }
  // else { piv.html(container.actions1, "a", "Administer", hiddenAttObj) }
  else { piv.html(container, "a", "Administer", hiddenAttObj) }

  if (canVote) {
    defaultHref = "ballot/" + id
    // defaultButton = piv.html(container.actions1, "a", "Vote", {"href": defaultHref, "class": "margin4p0p4p0p"}) }
    defaultButton = piv.html(container, "a", "Vote", {"href": defaultHref, "class": "margin4p0p4p0p"}) }
    // else { defaultButton = piv.html(container.actions1, "a", "Vote", hiddenAttObj) }
  else { thisElection.noCanVote = piv.html(container, "a", "Vote", hiddenAttObj) }

  // var nameButton = piv.html(container.name, "a", name, {"class": "w100 text1 margin4p0p4p0p", "href": defaultHref});
  var nameButton = piv.html(container, "a", name, {"class": "w50 text1 margin4p0p4p0p", "href": defaultHref});
  // var nameButton = piv.html(container, "a", name, {"class": "w100 text1 margin4p0p4p0p", "href": defaultHref});

  // if (canViewResults) { resultsButton = piv.html(container.actions2, "a", "View Results", {"href": "results/" + id, "style": displayNoneStyle, "class": "margin4p0p4p0p"}) }
  if (canViewResults) { resultsButton = piv.html(container, "a", "View Results", {"href": "results/" + id, "style": hiddenStyle, "class": "margin4p0p4p0p"}) }
  // else { resultsButton = piv.html(container.actions2, "a", "View Results", displayNoneAttObj) }
  else {resultsButton = piv.html(container, "a", "View Results", hiddenAttObj) }

  if (defaultButton) { linkElsOnHover(defaultButton, nameButton, "hover1") }

  piv.getResource('/api/election/' + id + '/result', function() { resultsButton.style.visibility = null })

}
function linkElsOnHover(el1, el2, hoverclass) {
    el1.addEventListener("mouseenter", function() {piv.addClass(el2, hoverclass)})
    el1.addEventListener("mouseleave", function() {piv.removeClass(el2, hoverclass)})
    el2.addEventListener("mouseenter", function() {piv.addClass(el1, hoverclass)})
    el2.addEventListener("mouseleave", function() {piv.removeClass(el1, hoverclass)})
}

piv.postToResource('/api/invite/acceptable', {}, invites)
function invites(data) {
  if (!hasShowElectionsRun) {
    console.log("waiting until showElections is finished")
    invitesData = data
    return
  }
  for (var key in data) {
    var invite = data[key]
    var election = myElectionsView.elections[invite.election_id]
    if (!election) {
      showElection(elections, invite.election_name, invite.election_id, "", "canViewResults", "")
      var voteButton = myElectionsView.elections[invite.election_id].noCanVote
      addEventAcceptToButton(invite.election_id, invite.code, voteButton)
      continue
    }
    var voteButton = election.noCanVote
    if (voteButton) {
      addEventAcceptToButton(invite.election_id, invite.code, voteButton)
    }
  }
}
function addEventAcceptToButton(electionId, code, button) {
  button.removeAttribute("style")
  button.setAttribute("href", "ballot/" + electionId)
  button.addEventListener("click", function() {
    piv.postToResource('/api/invite/accept', {"code": code})
  })
}
// close the self-executing function and feed the piv library to it
})(piv)
