'use strict';
//create a file-specific context via a function
(function(Piv) {

  // script-level variables
  var View = Piv.view
  var MyElectionsView = {}
  var ElectionsDomel
  var HasShowElectionsRun

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
    // key: election_id, val: array of invitation codes
    var invites = {}

    for (var key in invitesData) {
      var invite = invitesData[key]
      var election_id = invite.election_id
      if (!(election_id in invites)) {
        invites[election_id] = []
      }
      invites[election_id].push(invite.code)
    }

    for (var key in elections) {
      var election = elections[key]
      showElection(ElectionsDomel, election.name, election.id, election.can_vote, "canViewResults", election.can_edit, invites[election.id] ? invites[election.id] : null)
      delete invites[election.id]
    }

    for (var key in invites) {
      var invite = invites[key]
      showElection(ElectionsDomel, invite.election_name, invite.election_id, "can_vote", "canViewResults", "", invites[key])
    }

    var resources = []
    var resources = []
    var elections = []
    for (var key in MyElectionsView.elections) {
      resources.push("/api/elections/" + key + "/result_snapshots/")
      elections.push(key)
    }
    Piv.http.get(resources, function() {
      for (var i in arguments) {
        if (arguments[i].length < 1) continue
        MyElectionsView.elections[elections[i]].resultsButton.style.visibility = null
      }
    })
  }

  function showElection(container, name, id, canVote, canViewResults, canEdit, inviteCodes) {
    var thisElection = MyElectionsView.elections[id] = {}
    var hiddenStyle = "visibility:hidden;", hiddenAttObj = {"style": hiddenStyle, "class": "clickable5"}, resultsButton, defaultHref = "", defaultButton = ""

    container = Piv.html(container, "li", "", {"class": "w100 border-bottom-1 hover-1"})

    // var nameButton = thisElection.nameButton = Piv.html(container, "a", name, {"class": "w50", "href": defaultHref});
    var nameButton = thisElection.nameButton = Piv.html(container, "a", name, {"class": "w50"});
    if (inviteCodes) {
      addEventAcceptToButton(id, inviteCodes, nameButton)
    }

    if (canEdit) {
      defaultHref = "candidates/" + id
      defaultButton = Piv.html(container, "a", "Administer", {"href": defaultHref, "class": "clickable5"})
    }
    else { Piv.html(container, "a", "Administer", hiddenAttObj) }

    if (canVote || inviteCodes) {
      defaultHref = "ballot/" + id
      defaultButton = Piv.html(container, "a", "Vote", {"href": defaultHref, "class": "clickable5"})
      if (inviteCodes) {
        addEventAcceptToButton(id, inviteCodes, defaultButton)
      }
    }
    else { thisElection.voteButton = Piv.html(container, "a", "Vote", hiddenAttObj) }
    nameButton.setAttribute("href", defaultHref)
    // nameButton.href = defaultHref

    if (canViewResults) { resultsButton = Piv.html(container, "a", "View Results", {"href": "results/" + id, "style": hiddenStyle, "class": "clickable5"}) }
    // if (canViewResults) { resultsButton = Piv.html(container, "a", "View Results", {"href": "results/" + id, "class": "clickable5"}) }
    else {resultsButton = Piv.html(container, "a", "View Results", hiddenAttObj) }

    if (defaultButton) { linkElsOnHover(defaultButton, nameButton, "hoverlink-1") }

    thisElection.resultsButton = resultsButton

    // Piv.http.get(["/api/elections/" + id + "/result"], function() { resultsButton.style.visibility = null })  //noe revert
  }

  function linkElsOnHover(el1, el2, hoverclass) {
    el1.addEventListener("mouseenter", function() {Piv.addClass(el2, hoverclass)})
    el1.addEventListener("mouseleave", function() {Piv.removeClass(el2, hoverclass)})
    el2.addEventListener("mouseenter", function() {Piv.addClass(el1, hoverclass)})
    el2.addEventListener("mouseleave", function() {Piv.removeClass(el1, hoverclass)})
  }

  function addEventAcceptToButton(electionId, inviteCodes, button) {
    // console.log(code)
    button.removeAttribute("style")
    button.setAttribute("href", "ballot/" + electionId)
    button.addEventListener("click", function() {
      var urls = []
      var args = []
      inviteCodes.forEach(function(code) {
        urls.push("/api/invite/accept")
        args.push({"code": code})
      })
      Piv.http.post(urls, args)
    })
  }
  // close the self-executing function and feed the piv library to it
})(piv)
