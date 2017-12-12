'use strict';

//functions

//saving to server
function showButton(input) {
  input.nextElementSibling.removeAttribute("style")
}
function updateName(form) {
  form.elements.submit.setAttribute("style", "visibility:hidden;")
  var request = {}
  request.api = "rename"
  request.record = election
  request.data = form.elements.electionName.value
  sendRequestToServer(request)
}
function deleteElection(election) {
  var request = {}
  request.api = "delete"
  request.record = election
  sendRequestToServer(request, goToConfirmDeletePage)
}
function goToConfirmDeletePage(election) {
  // console.log("deleted")
  window.location.href = "confirmDelete.php"
}
// function goToElectionPage(election) {
//   window.location.href = "details.php?election=" + election
// }
function saveElection(name) {
    var request = {}
    request.data = name
    request.api = "election"
    request.record = election
    saveElectionToServer(request)
}

function makeElectorateArray () {
  var electorate = [];
  electorateToArray(document.querySelectorAll("#edititems .candidate"), electorate);
  return electorate
}
function electorateToArray (items, targetArray) {
  for (var i = 0; i < items.length; i++) {
    var item = {};
    var formElements = items[i].querySelector(".candidateDetails").elements
    // console.log(formElements)
    item.username = formElements.username.value
    if (formElements.canVote.checked) {item.vote = "yes"}
    if (formElements.canViewResults.checked) {item.results = "yes"}
    if (formElements.isAdmin.checked) {item.admin = "yes"}

    targetArray.push(item);
  }
}
function removeHrefsForCurrentLoc() {
  var hrefEls = document.querySelectorAll("[href]")
  var currentHref = window.location.href
  for (var i = 0; i < hrefEls.length; i++) {
    if (canonicalize(hrefEls[i].href) == currentHref) { hrefEls[i].removeAttribute("href") }
  }
}
function anchorListDiv(parent, classes, labelsAndHrefs) {
  var stepNavigator = div(parent, "", classes);
  for (var label in labelsAndHrefs) {
    var href = labelsAndHrefs[label]
    html(stepNavigator, "a", label, "href=" + href);
  }
}

//dom
function div(parent, id, classes, innerHtml, attributes) {
  attributes = Array.prototype.slice.call(arguments, 4)
  return html(parent, "div", innerHtml, "id=" + id, "class=" + classes, attributes)
}
function appendNewHtmlEl(parent, tag) {
  var html = document.createElement(tag)
  parent.appendChild(html)
  return html
}
function html(parent, tag, innerHtml, attributes) {
  var i, attString, eqPos, html, attribute, attributes = Array.prototype.slice.call(arguments, 3)
  // attributes = arguments.slice(3)
  html = document.createElement(tag)
  html.innerHTML = (innerHtml || innerHtml === 0) ? innerHtml : ""
  attributes = flattenArray(attributes)
  for (i = 0; i < attributes.length; i++) {
    attString = attributes[i]
    eqPos = attString.indexOf("=")
    attribute = attString.slice(0,eqPos)
    if (!attribute) continue
    html.setAttribute(attribute, attString.slice(eqPos + 1))
  }
  if (parent) parent.appendChild(html)
  return html
}
function flattenArray(array, flattenedArray = []) {
  var i, member
  for (i = 0; i < array.length; i++) {
    member = array[i]
    if (Array.isArray(member)) { flattenArray(member, flattenedArray) }
    else {flattenedArray.push(member)}
  }
  return flattenedArray
}

//helpers
function ordinalSuffix(i) {
  //(got this here: https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number)
  var j = i % 10, k = i % 100;
  if (j == 1 && k != 11) { return i + "st"; }
  if (j == 2 && k != 12) { return i + "nd"; }
  if (j == 3 && k != 13) { return i + "rd"; }
  return i + "th";
}
function insertAfter(el, afterEl) {
  if (afterEl.nextElementSibling) { afterEl.parentNode.insertBefore(el, afterEl.nextElementSibling); }
  else {afterEl.parentNode.appendChild}
}
function canonicalize(url) {
  //(got this here: https://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript)
  var div = document.createElement('div');
  div.innerHTML = "<a></a>";
  div.firstChild.href = url; // Ensures that the href is properly escaped
  div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
  return div.firstChild.href;
}

// function addBudgetItem() {
//   var itemTemplate = document.querySelector("[data-id=template]");
//   var itemContainer = document.getElementById("edititems");
//   var clone = itemTemplate.cloneNode(true)
//   // console.log(clone)
//   clone.removeAttribute("data-id")
//   itemContainer.appendChild(clone)
//   // enable(clone)
//   clone.querySelector("input[type=text]").focus()
// }

// getResource('/api/election')
// getResource('/api/election/1')
// getResource('/api/election/1/result')
// getResource('/api/election/1/candidate')
// getResource('/api/election/1/candidate/1')
// getResource('/api/election/1/candidate/1/rank')
// getResource('/api/election/1/candidate/10/rank')
// getResource('/api/election/2/invite')
function getResource(resource) {
  axios.get(resource)
    .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.log(error);
  })
}
// postToResource('/api/election/2/invite', {"email": "nathan.eckberg@gmail.com"})
postToResource('/api/invite/accept', {"code": "e2562a8a"})
function postToResource(resource, payload) {
  axios.post(resource, payload)
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    })
}
