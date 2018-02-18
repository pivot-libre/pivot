'use strict';

// initialize the object for our library
var piv = piv = piv || {};  //(need the ; in order to do this syntax)

//add properties to our object within the context of a self-executing function
(function(lib) {

//pivot-specific view stuff
var view = lib.view = {};
view.workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
view.setHeader = function(text) {
  mainheader.innerHTML = text
}


//load ballot
var loadBallot = lib.loadBallot = function(electionId, onSuccessFunction, perCandidateFunc) {
  var onLoadBallotDataFunc = function(ballotDef, userRankings) {
    onSuccessFunction(ballotDef, userRankings, perCandidateFunc)
  }
  getMultResources(['/api/election/' + electionId + '/candidate', '/api/election/' + electionId + '/batchvote'], onLoadBallotDataFunc)
}
var displayBallot = lib.displayBallot = function(ballotDefinition, rankedBallot, perCandidateFunc) {
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
var dispayCandidatesWithRank = lib.dispayCandidatesWithRank = function(rank, candidates, rankeditems, unrankeditems, perCandidateFunc) {
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

var evmanage = lib.evmanage = {};
(function(evmanage) {
  var handlers = {}
  evmanage.listen = function(domel, ename, func, args) {
    domel.setAttribute("data-elisten", ename)
    var domelDataKey = domeldata.getKey(domel)
    handlers[domelDataKey] = {}
    handlers[domelDataKey][ename] = {}
    handlers[domelDataKey][ename].func = func
    handlers[domelDataKey][ename].args = args
  }
  evmanage.bubble = function(e) {
    var currentTarget = e.target, etype = e.type, eContext = {}, log
    eContext.log = []
    do {
      currentTarget = currentTarget.closest("[data-elisten=" + etype + "]")
      if (currentTarget) {
        var func = handlers[domeldata.getKey(currentTarget)][etype].func
        var args = handlers[domeldata.getKey(currentTarget)][etype].args
        if (args) {
          // console.log( JSON.stringify(eContext.log) )
          log = func.apply({"event": e, "domel": currentTarget, "eContext": eContext}, args)
        }
        else {
          log = func()
        }
        eContext.log.push(log || func)
      }
      if (currentTarget && currentTarget === currentTarget) currentTarget = currentTarget.parentElement  //noe - hacky way to avoid an infinite loop
    }
    while (currentTarget != null);
  }
})(evmanage)

// dom manipulation
// var libElProtoKey = lib.libElProtoKey = "pivot";
// Element.prototype[libElProtoKey] = {}
// var domelData = lib.domelData = "pivot";
// Element.prototype[domelData] = {}
var domeldata = lib.domeldata = {};
(function(domeldata) {
  var key, data = [], evt = new CustomEvent("domelData")

  // bindDomelToKey: creates a way for getKey() to look up a key to data[], given a domel
  var bindDomelToKey = domeldata.bindDomelToKey = function(domel, domelDataKey) {
    //data-addribute based:
    domel.setAttribute("data-datakey", domelDataKey)
    // //event-based
    // domel.addEventListener("domelData", function() {
    //   key = domelDataKey || undefined
    // })
    return domelDataKey
  }
  //     getkey: gets key
  //side effect: sets key
  var getKey = domeldata.getKey = function(domel) {
    //data-addribute based:
    key = domel.getAttribute("data-datakey") || undefined
    // //event-based
    // key = undefined
    // domel.dispatchEvent(evt)

    return key || bindDomelToKey(domel, data.push({}) - 1) //if key is undefined, push to data[], and bind to the new key
  }
  domeldata.set = function(domel, val, prop) {
    key = getKey(domel)
    if (prop) {
      if (data[key] !== Object(data[key])) data[key] = {}  //set it to an object if it was previously a primitive
      data[key][prop] = val
    }
    else {
      data[key] = val
    }
  }
  domeldata.get = function(domel, prop) {
    key = getKey(domel)
    if (prop) {return data[key][prop]}
    else {return data[key]}
  }
  domeldata.data = function() {
    console.log(data)
    console.log(key)
  }
})(domeldata)

var div = lib.div = function(parent, id, classes, innerHtml, attributes, eventnames, dofunc, data) {
  attributes = attributes || {}
  if (id) attributes.id = id
  if (classes) attributes.class = classes
  return html(parent, "div", innerHtml, attributes, eventnames, dofunc, data)
}
var html = lib.html = function(parent, tag, innerHtml, attributes, eventnames, dofunc, data) {
  var i, attString, html, attribute
  html = document.createElement(tag)
  if (eventnames) { doOnEvents(html, eventnames, dofunc, data) }
  html.innerHTML = (innerHtml || innerHtml === 0) ? innerHtml : ""
  for (attribute in attributes) {
    if (!attributes.hasOwnProperty(attribute)) continue
    html.setAttribute(attribute, attributes[attribute])
  }
  if (parent) parent.appendChild(html)
  return html
}
var doOnEvents = lib.doOnEvents = function(domel, eventnames, dofunc, data) {
  // if (arguments.length < 3) { return }
  var todofunc = function() { dofunc.call(domel, data) }
  for (var i = 0; i < eventnames.length; i++) {
    domel.addEventListener(eventnames[i], todofunc)
  }
}
var doOnEvents2 = lib.doOnEvents2 = function(domel, eventnames, dofunc, data) {
  var todofunc = function(e) { dofunc.call(domel, e, data) }
  for (var i = 0; i < eventnames.length; i++) {
    domel.addEventListener(eventnames[i], todofunc)
  }
}

//helpers
var removeHrefsForCurrentLoc = lib.removeHrefsForCurrentLoc = function() {
  var hrefEls = document.querySelectorAll("[href]")
  var currentHref = window.location.href
  for (var i = 0; i < hrefEls.length; i++) {
    if (canonicalize(hrefEls[i].href) == currentHref) { hrefEls[i].removeAttribute("href") }
    else if (window.location.pathname == "/" && window.location.protocol + "//" + window.location.host + "/myElections" == canonicalize(hrefEls[i].href)) { hrefEls[i].removeAttribute("href") }
  }
}
var anchorListDiv = lib.anchorListDiv = function(parent, classes, labelsAndHrefs) {
  var stepNavigator = div(parent, "", classes);
  for (var label in labelsAndHrefs) {
    var href = labelsAndHrefs[label]
    html(stepNavigator, "a", label, {"href": href});
  }
}
var ordinalSuffix = lib.ordinalSuffix = function(i) {
  //(got this here: https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number)
  var j = i % 10, k = i % 100;
  if (j == 1 && k != 11) { return i + "st"; }
  if (j == 2 && k != 12) { return i + "nd"; }
  if (j == 3 && k != 13) { return i + "rd"; }
  return i + "th";
}
var insertAfter = lib.insertAfter = function(el, afterEl) {
  if (afterEl.nextElementSibling) { afterEl.parentNode.insertBefore(el, afterEl.nextElementSibling); }
  else {afterEl.parentNode.appendChild}
}
var canonicalize = lib.canonicalize = function(url) {
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
var getResource = lib.getResource = function(resource, onSuccess, onError) {
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
var postToResource = lib.postToResource = function(resource, payload, onSuccess, onError) {
  axios.post(resource, payload)
    .then(response => {
      if (onSuccess) {onSuccess(response.data); return}
      console.log(response);
    })
    .catch(error => {
      if (onError) {onError(response.data); return}
      console.group("error");
      console.log(resource);
      console.log(payload);
      console.log(onSuccess);
      console.log(error);
      console.groupEnd()
    })
}
var deleteResource = lib.deleteResource = function(resource) {
  axios.delete(resource)
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    })
}

var getMultResources = lib.getMultResources = function(resources, onSuccess, onFail) {

  var exFuncAry = function() {
    var getFuncReturns = []
    for (var i in resources) { getFuncReturns.push( axios.get(resources[i]) ) }
    return getFuncReturns
  }

  //default onSuccess and onFail functions
  onSuccess = onSuccess || function() {
    console.group("getMultResources:");
    for (var i in arguments) { console.log(arguments[i]) }
    console.groupEnd()
  };
  onFail = onFail || function(error) {
      console.group("getMultResources error:");
      console.log(error);
      console.groupEnd()
  }

  var thenFunc = function () {
    var responseData = []
    for (var i in arguments){ responseData.push(arguments[i].data) }
    onSuccess.apply(null, responseData)
  }

  axios.all(exFuncAry())
    .then(axios.spread(thenFunc))
    .catch(onFail);
}


var hasClass = lib.hasClass = function(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
var addClass = lib.addClass = function(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}
var removeClass = lib.removeClass = function(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}
var getStyle = lib.getStyle = function(className) {
    var classes = document.styleSheets[0].rules || document.styleSheets[0].cssRules;
    for (var x = 0; x < classes.length; x++) {
        if (classes[x].selectorText == className) {
            (classes[x].cssText) ? console.log(classes[x].cssText) : console.log(classes[x].style.cssText);
        }
    }
}

//feed our object to the function so that we can populate it with properties
})(piv)
