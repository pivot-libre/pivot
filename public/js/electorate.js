'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {

  // script-level variables
  var View = Piv.view
  var CheckedElectorCheckboxes = {}
  var SendInvitesButton, DeleteSelectedElectorsButton
  var InviteList = {}
  var SendInProgress
  var DeletionInProgress
  var FilteredStatuses = {}
  var Electors, Invites
  var ElectorateTable
  var ElectorateDirectory = Piv.makeVobjectCollection(["elector_id"])
  var StatusMap = {
    "approved_current": {"title": "Approved", "icon": "&#9733;"},
    "approved_previous": {"title": "Needs Reapproval", "icon": "&#9851;"},
    "approved_none": {"title": "Never Approved", "icon": "&#9744;"},
    "outstanding_invites": {"title": "Never Viewed", "icon": "&#9755;"}
  }
  Piv.StatusMap = StatusMap

  Piv.evmanage.setManager(View.workspace, ["click", "keyup", "paste"])
  View.setHeader("Manage Electorate", ElectionId)
  View.statusbar.innerHTML = ""

  Piv.electionsMenu(ElectionId)

  loadElectorate(ElectionId, displayElectorate)

  // function definitions
  function loadElectorate(electionId, onSuccessFunction) {
    Piv.http.get([
      '/api/elections/' + electionId + '/voter_details',
    ], onSuccessFunction)
  }

  function displayElectorate(electors) {
    if (!Electors) {
      Electors = electors
    }

    Piv.div(View.workspace, "", "w100 font-size-3 padding-1 textLeft color-7", "Invitations")
    var invitesSection = Piv.div(View.workspace, "", "container1")
    Piv.div(invitesSection, "", "w100 font-size-4 margin-bottom-1", "Enter e-mail addresses to send invitations to people who should be included in the electorate.")
    Piv.div(invitesSection, "", "w100 font-size-4", "If any electors require a proxy to vote on their behalf, you may enter the email of the proxy in the 'Username' field, and enter the name of the elector in the 'Voter Name' field after selecting the 'proxy for' checkbox.")

    SendInvitesButton = Piv.div("", "", "clickable1", "Send Invites", "", "click", sendInvites, ["noe"])
    Piv.div(invitesSection, "", "textRight w100", SendInvitesButton)
    var invitesTable = Piv.div("", "invites", "incrementsCounter w100")
    Piv.div(invitesSection, "", "w100", Piv.div("", "", "w100 textLeft", invitesTable))

    newInvite(invitesTable)

    Piv.div(View.workspace, "", "w100 font-size-3 padding-1 textLeft color-7", "Electorate")
    var electorateSection = Piv.div(View.workspace, "", "container1")
    Piv.div(electorateSection, "", "w100 font-size-4", "View voting statuses of your electorate and remove electors from your electorate.")
    var electorFiltersRow = Piv.div(electorateSection, "", "w100")

    DeleteSelectedElectorsButton = Piv.div("", "", "clickable1 disabled", "Delete Selected", "", "click", deleteSelectedElectors, ["noe"])
    Piv.div(electorateSection, "", "textRight w100", DeleteSelectedElectorsButton)
    var electorateTable = ElectorateTable = Piv.div("", "", "incrementsCounter w100")
    Piv.div(electorateSection, "", "w100", Piv.div("", "", "w100 textLeft", electorateTable))

    makeElectorFilters(electorFiltersRow, StatusMap, electorateTable)
    populateElectorateStatusTable(electorateTable, electors, invites)
    updateCountsAndFilters()
  }

  function newInvite(table) {
    var row = Piv.div(table, "", "w75 overflow-visible nowrap hover-children")

    Piv.div(row, "", "text1square orderdisplay");

    var user_name = Piv.html(row, "input", "", {"class": "input-text-1 w50 hover-1", "type": "text", "placeholder": "Username (an email address)"})
    var isProxy = Piv.checkbox(row)
    Piv.div(isProxy.label, "", "color-2 padding-sides-small font-size-1 font-weight-200", "proxy for:")
    // Piv.div(row, "", "font-size-1 input-text-1", "on behalf of:")
    var voter_name = Piv.html(row, "input", "", {"class": "input-text-1 w50 hover-1", "type": "text", "placeholder": "Voter Name"})
    disable(voter_name)
    // Piv.checkbox(row, "", "", "", "", {"class": "margin-right-1"},  clickInviteCheckbox, [voter_name])
    // var checkbox = Piv.checkbox(row, "", "", "", "", {"class": "margin-right-1"})
    Piv.evmanage.listen(isProxy.input, "click", clickInviteCheckbox, [voter_name])

    // input element events
    Piv.evmanage.listen(user_name, "keyup", newInviteMaybe, [table])
    Piv.evmanage.listen(user_name, "paste", newInviteMaybe, [table])
    Piv.evmanage.listen(voter_name, "keyup", newInviteMaybe, [table])
    Piv.evmanage.listen(voter_name, "paste", newInviteMaybe, [table])

    var lastKey = Number(Object.keys(InviteList)[Object.keys(InviteList).length - 1])
    var inviteKey = isNaN(lastKey) ? 0 : lastKey + 1
    InviteList[inviteKey] = {"user_name": user_name, "voter_name": voter_name, "row":row}

    Piv.div(row, "", "clickable2", "&#9747;", "", "click", removeInviteVobject, [inviteKey])
  }

  function disable(domel) {
    domel.disabled = true
    domel.value = ""
    Piv.addClass(domel, "disabled")
  }
  function enable(domel) {
    domel.disabled = false
    // domel.focus()
    Piv.removeClass(domel, "disabled")
  }
  function clickInviteCheckbox(voter_name) {
    console.log(voter_name)
    console.log(this)
    if (this.domel.checked) {
      enable(voter_name)
      return
    }
    disable(voter_name)
  }

  function newInviteMaybe(table) {
    var input = this.domel, lastrow
    var lastKey = Number(Object.keys(InviteList)[Object.keys(InviteList).length - 1])
    if (this.domel.value) {
      if (input == InviteList[lastKey].user_name) newInvite(table)
    }
    else {
      if (Object.keys(InviteList).length < 2) return
      var nextToLastKey = Number(Object.keys(InviteList)[Object.keys(InviteList).length - 2])
      if (this.domel == InviteList[nextToLastKey].user_name) {
        lastrow = InviteList[lastKey].row
        lastrow.parentElement.removeChild(lastrow)
        delete InviteList[lastKey]
      }
    }
  }

  function removeInviteVobject(inviteKey) {
    var invite = InviteList[inviteKey]
    var invitesLength = Object.keys(InviteList).length
    if (invitesLength < 2) return

    if (!invite) return
    if (!invite.user_name.value) return  // don't delete the last input box if it is blank, because people might be confused about how to get it back
    delete InviteList[inviteKey]
    invite.row.parentElement.removeChild(invite.row)
  }

  function sendInvites() {
    if (SendInProgress) {
      console.log("Send in progress")
      return
    }

    if (Piv.hasClass(this.domel, "disabled")) {
      return
    }

    SendInProgress = true
    Piv.addClass(SendInvitesButton, "disabled")
    var innerHtml = SendInvitesButton.innerHTML
    SendInvitesButton.innerHTML = "Sending Invites..."
    View.statusbar.innerHTML = "Sending Invites..."

    var resources = [], payloads = [], inviteKeys = []

    // collect arguments for multiple posts
    for (var key in InviteList) {
      var email = InviteList[key].user_name.value
      var voter_name = InviteList[key].voter_name.value
      if (!email) {
        continue
      }

      resources.push("/api/elections/" + ElectionId + "/invite")
      payloads.push({
        "email": email,
        "voter_name": (!voter_name) ? null : voter_name
      })
      inviteKeys.push(key)
    }

    // do the posts
    Piv.http.post(resources, payloads, function() {
      // remove invite vobjects and add any new electors we didn't
      // already have
      for (var i = 0; i < arguments.length; i++) {
        removeInviteVobject(inviteKeys[i])

        var elector = arguments[i]
        // if elector with given elector_id not already in the elector
        // display, add it
        if (!ElectorateDirectory.indexesSingle.elector_id[elector.id]) {
          makeElectorVobject(
            null,
            elector.voter_name,
            elector.invite_email,
            elector.id,
            "outstanding_invites"
          )
        }
      }

      repopulateElectorateStatusTable()
      updateCountsAndFilters() // noe
      SendInProgress = false
      SendInvitesButton.innerHTML = innerHtml
      View.statusbar.innerHTML = "Sent!"
      Piv.removeClass(SendInvitesButton, "disabled")
    })
  }

  function updateCountsAndFilters() {
    for (var key in StatusMap) {
      if (ElectorateDirectory.length(key) >= 1) {
        Piv.removeClass(FilteredStatuses[key].button, "display-none-1")
      } else {
        Piv.addClass(FilteredStatuses[key].button, "display-none-1")
      }
    }
  }

  function makeElectorFilters(parent, StatusMap, table) {
    for (var key in StatusMap) {
      FilteredStatuses[key] = {}
      var button = FilteredStatuses[key].button = Piv.html(parent, "label", "", {"class": "clickable1 padding-1"})
      if (ElectorateDirectory.length(key) < 1) {
        Piv.addClass(button, "display-none-1")
      }
      StatusMap[key].button = button
      var checkbox = Piv.checkbox(button, "", "", "", "checked", {"class": "margin-right-1"})
      FilteredStatuses[key].status = true;
      Piv.div(button, "", "", StatusMap[key].title + " " + StatusMap[key].icon)
      Piv.evmanage.listen(checkbox.input, "click", filterElectorate, [checkbox.input, key, table])
    }
  }

  function filterElectorate(checkbox, key, table) {
    FilteredStatuses[key].status = checkbox.checked
    repopulateElectorateStatusTable(table)
  }

  function repopulateElectorateStatusTable() {
    var table = ElectorateTable, header = table.firstChild
    Piv.removeAllChildren(table)

    var electorVobject
    for (var electorStatus in FilteredStatuses) {
      if (!FilteredStatuses[electorStatus].status) continue
      for (var key2 in ElectorateDirectory.statuses[electorStatus]) {
        electorVobject = ElectorateDirectory.statuses[electorStatus][key2]
        renderElectorVobject(electorVobject, table)
      }
    }
  }

  function populateElectorateStatusTable(table, electors, invites) {
    if (FilteredStatuses["approved_current"].status)
      displayElectorGroup(table, electors.approved_current, "approved_current")
    if (FilteredStatuses["approved_previous"].status)
      displayElectorGroup(table, electors.approved_previous, "approved_previous")
    if (FilteredStatuses["approved_none"].status)
      displayElectorGroup(table, electors.approved_none, "approved_none")
    if (FilteredStatuses["outstanding_invites"].status)
      displayElectorGroup(table, electors.outstanding_invites, "outstanding_invites")
  }

  function displayElectorGroup(table, electors, status) {
    for (var key in electors) {
      var elector = electors[key]
      var velector = makeElectorVobject(
        elector.user_name,
        elector.voter_name,
        elector.email,
        elector.elector_id,
        status
      )
      renderElectorVobject(velector, table)
    }
  }

  function makeElectorVobject(user_name, voter_name, email, elector_id, status) {
    var vobject = {
      "user_name": user_name ? user_name : "&lt;PENDING&gt;",
      "voter_name": voter_name,
      "email": email,
      "status": status,
      "elector_id": elector_id
    }
    ElectorateDirectory.push(vobject)
    var row = vobject.domel = Piv.html("", "label", "", {"class": "w100 border-bottom-2 overflow-visible nowrap hover-1"})

    Piv.div(row, "", "text3 textRight", StatusMap[status].icon)
    var display = vobject.user_name + (vobject.voter_name ? " <b>on behalf of</b> "+vobject.voter_name : "") + " (" + vobject.email + ")"
    Piv.div(row, "", "text3 textLeft w75", display)

    if ("outstanding_invites" == status) {
      Piv.checkbox(row, "", "", "", "", {"class": "margin-right-1"},  clickElectorCheckbox, [vobject])
    }

    return vobject
  }

  function renderElectorVobject(vobject, parent) {
    if (parent) {
      parent.appendChild(vobject.domel)
      vobject.parent = parent
    }
    else if (vobject.parent) { vobject.parent.appendChild(vobject.domel) }
  }

  function removeElectorVobject(vobject) {
    delete CheckedElectorCheckboxes[vobject.index]
    ElectorateDirectory.remove(vobject)
    if (vobject.domel.parentElement) vobject.domel.parentElement.removeChild(vobject.domel)
  }

  function clickElectorCheckbox(vobject) {
    if (this.domel.checked) { CheckedElectorCheckboxes[vobject.index] = vobject }
    else { delete CheckedElectorCheckboxes[vobject.index] }
    updateDeleteSelectedElectorsButton()
  }

  function updateDeleteSelectedElectorsButton() {
    if (Object.keys(CheckedElectorCheckboxes).length < 1) { Piv.addClass(DeleteSelectedElectorsButton, "disabled") }
    else { Piv.removeClass(DeleteSelectedElectorsButton, "disabled") }
  }

  function deleteSelectedElectors() {
    if (DeletionInProgress) {
      console.log("Deletion in progress")
      return
    }
    if (Piv.hasClass(this.domel, "disabled")) return
    DeletionInProgress = true
    Piv.addClass(DeleteSelectedElectorsButton, "disabled")
    var innerHtml = DeleteSelectedElectorsButton.innerHTML
    DeleteSelectedElectorsButton.innerHTML = "Deleting..."
    View.statusbar.innerHTML = "Deleting..."

    var resources = [], electorVobjectKeys = []
    for (var key in CheckedElectorCheckboxes) {
      resources.push("/api/elections/" + ElectionId + "/electors/" + CheckedElectorCheckboxes[key].elector_id)
      electorVobjectKeys.push(key)
    }
    Piv.http.delete(resources, function() {
      for (var i = 0; i < arguments.length; i++) {
        removeElectorVobject(CheckedElectorCheckboxes[electorVobjectKeys[i]])
      }
      updateDeleteSelectedElectorsButton()
      updateCountsAndFilters()
      DeletionInProgress = false
      DeleteSelectedElectorsButton.innerHTML = innerHtml
      View.statusbar.innerHTML = "Deleted!"
    })
  }

  // close the self-executing function and feed the piv library to it
})(piv, election)
