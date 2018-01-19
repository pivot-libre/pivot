'use strict';

//load ballot
function loadBallot(electionId, onSuccessFunction, perCandidateFunc) {
  //define functions that we will use to get both the candidate definitions and the user's ranked ballot
  var getballotDefinition = function() { return axios.get('/api/election/' + electionId + '/candidate') }
  var getRankedBallot = function() { return axios.get('/api/election/' + electionId + '/batchvote') }

  axios.all([getballotDefinition(), getRankedBallot()])
    .then(axios.spread(function (definition, rankings) {
      // Both requests are now complete
      // console.log(acct.data, perms.data)
      onSuccessFunction(definition.data, rankings.data, perCandidateFunc)
    }));
}
function displayBallot(ballotDefinition, rankedBallot, perCandidateFunc) {
  var candidate, sortedDefinitions = {}, sortedCandidates = {}

  //if the user hasn't looked at this ballot before, we can simply display the ballot definition
  if (0 == rankedBallot.length) { dispayCandidatesWithRank("", ballotDefinition, rankeditems, unrankeditems, perCandidateFunc); return}

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
  for (var rank in sortedCandidates) {
    dispayCandidatesWithRank(rank, sortedCandidates[rank], rankeditems, unrankeditems, perCandidateFunc)
  }
}
function dispayCandidatesWithRank(rank, candidates, rankeditems, unrankeditems, perCandidateFunc) {
  var candidate
  for (var key in candidates) {
    candidate = candidates[key]
    //if not ranked, it goes in the unranked group
    if (!rank || 0 == rank) { perCandidateFunc(unrankeditems, candidate.id, candidate.name, "", "", ("" == rank ? "new": "")); continue }

    //if length is 1, it is not a tie
    if (1 == candidates.length) { perCandidateFunc(rankeditems, candidate.id, candidate.name, "", ""); continue }

    //handle ties:
    //if length is greater than 1 and this is the first key, we are at the start of a tie
    if (0 == key) { perCandidateFunc(rankeditems, candidate.id, candidate.name, "", "start", ""); continue }

    //if this is not the last key, we are in the middle of a tie
    if (key < candidates.length - 1) { perCandidateFunc(rankeditems, candidate.id, candidate.name, "", "middle", ""); continue }

    //if we've gotten this far, we must be at the end of a tie
    perCandidateFunc(rankeditems, candidate.id, candidate.name, "", "end", "")
  }
}

// dom manipulation
function div(parent, id, classes, innerHtml, attributes) {
  attributes = attributes || {}
  if (id) attributes.id = id
  if (classes) attributes.class = classes
  return html(parent, "div", innerHtml, attributes)
}
function html(parent, tag, innerHtml, attributes) {
  var i, attString, html, attribute
  html = document.createElement(tag)
  html.innerHTML = (innerHtml || innerHtml === 0) ? innerHtml : ""
  for (attribute in attributes) {
    if (!attributes.hasOwnProperty(attribute)) continue
    html.setAttribute(attribute, attributes[attribute])
  }
  if (parent) parent.appendChild(html)
  return html
}

//helpers
function removeHrefsForCurrentLoc() {
  var hrefEls = document.querySelectorAll("[href]")
  var currentHref = window.location.href
  for (var i = 0; i < hrefEls.length; i++) {
    if (canonicalize(hrefEls[i].href) == currentHref) { hrefEls[i].removeAttribute("href") }
    else if (window.location.pathname == "/" && window.location.protocol + "//" + window.location.host + "/myElections" == canonicalize(hrefEls[i].href)) { hrefEls[i].removeAttribute("href") }
  }
}
function anchorListDiv(parent, classes, labelsAndHrefs) {
  var stepNavigator = div(parent, "", classes);
  for (var label in labelsAndHrefs) {
    var href = labelsAndHrefs[label]
    html(stepNavigator, "a", label, {"href": href});
  }
}
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

// getResource('/api/election')
// getResource('/api/election/1')
// getResource('/api/election/1/result')
// getResource('/api/election/1/candidate')
// getResource('/api/election/1/candidate/1')
// getResource('/api/election/1/candidate/1/rank')
// getResource('/api/election/1/candidate/10/rank')
// getResource('/api/election/2/invite')
function getResource(resource, onSuccess, onError) {
  axios.get(resource)
    .then(response => {
      if (onSuccess) {onSuccess(response.data); return}
      // console.log(response);
      console.log(JSON.stringify(response.data, "", " "));
    })
    .catch(error => {
      if (onError) {onError(response.data); return}
      console.log(error);
    })
}
// postToResource('/api/election/2/invite', {"email": "nathan.eckberg@gmail.com"})
// postToResource('/api/invite/accept', {"code": "e2562a8a"})
function postToResource(resource, payload, onSuccess, onError) {
  axios.post(resource, payload)
    .then(response => {
      if (onSuccess) {onSuccess(response.data); return}
      console.log(response);
    })
    .catch(error => {
      if (onError) {onError(response.data); return}
      console.log("error:");
      console.log(resource);
      console.log(payload);
      console.log(onSuccess);
      console.log(error);
    })
}
function deleteResource(resource) {
  axios.delete(resource)
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    })
}
