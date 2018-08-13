'use strict';
console.log("pivotlib.js")

// initialize the object for our library
var piv = piv = piv || {};  //(need the ; in order to do this syntax)

//add properties to our object within the context of a self-executing function
(function(lib) {

  //pivot-specific view stuff
  var view = lib.view = {};
  view.workspace = document.querySelector(".workspace")
  view.statusbar = document.querySelector("#statusbar")
  view.sidenav = document.querySelector("#sidenav")
  var mainheader = document.querySelector(".mainheader")
  view.setHeader = function(text, election, delim) {
    mainheader.innerHTML = text
    if (election) {
      delim = delim || ": "
      http.get(["/api/elections/" + election], function(electionDetails) {
        mainheader.innerHTML = text + delim + electionDetails.name
      })
    }
  }

  // a user may control multiple electors in an election.  Get the list of them
  var loadControlledElectors = lib.loadControlledElectors = function(electionId, onSuccess) {
    var onLoadElectors = function(electors) {
      console.log('Electors this user controls: %o', electors)
      onSuccess(electors)
    }

    getMultResources(['/api/elections/' + electionId + '/electors_for_self'], onLoadElectors)
  }

  //load ballot for particular elector controlled by user
  var loadBallot = lib.loadBallot = function(electionId, electorId, onSuccessFunction, perCandidateFunc, rankeditems, unrankeditems) {
    var onLoadBallot = function(candidates, ballot) {
      // step 3: populate ballot
      onSuccessFunction(candidates, ballot, perCandidateFunc, rankeditems, unrankeditems)
    }

    var onLoadElectorsAndCandidates = function(candidates) {
      // step 2: get elector's votes on those candidates
      postToMultResources(['/api/elections/' + electionId + '/batchvote_view'],
                          [{'elector_id': electorId}],
                          function(ballot) {
                            return onLoadBallot(candidates, ballot)
                          })
    }

    // step 1: candidates
    getMultResources(['/api/elections/' + electionId + '/candidates'], onLoadElectorsAndCandidates)
  }

  var displayBallot = lib.displayBallot = function(ballotDefinition, rankedBallot, perCandidateFunc, rankeditems, unrankeditems) {
    var candidate, sortedDefinitions = {}, sortedCandidates = {}

    // make sure the containers are clear before adding candidates to them
    removeAllChildren(rankeditems)
    removeAllChildren(unrankeditems)

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
      if (!rank || 0 == rank) { perCandidateFunc(unrankeditems, candidate.id, candidate.name, "", ("" == rank ? "new": "")); continue }

      //if length is 1, it is not a tie
      if (1 == candidates.length) { perCandidateFunc(rankeditems, candidate.id, candidate.name); continue }

      //handle ties:
      //if length is greater than 1 and this is the first key, we are at the start of a tie
      if (0 == key) { perCandidateFunc(rankeditems, candidate.id, candidate.name, "start"); continue }

      //if this is not the last key, we are in the middle of a tie
      if (key < candidates.length - 1) { perCandidateFunc(rankeditems, candidate.id, candidate.name, "middle"); continue }

      //if we've gotten this far, we must be at the end of a tie
      perCandidateFunc(rankeditems, candidate.id, candidate.name, "end")
    }
  }

  var evmanage = lib.evmanage = {};
  (function(evmanage) {
    var handlers = {}
    evmanage.listen = function(domel, ename, func, args) {
      if (!(domel instanceof Element)) return
      if (!ename) return
      if (!(func instanceof Function)) return
      domel.setAttribute("data-elisten-" + ename, true)
      var domelDataKey = domeldata.getKey(domel)
      handlers[domelDataKey] = handlers[domelDataKey] || {}
      handlers[domelDataKey][ename] = {}
      handlers[domelDataKey][ename].func = func
      handlers[domelDataKey][ename].args = args
    }
    evmanage.bubble = function(e) {
      var currentTarget = e.target, etype = e.type, eContext = {}, log
      eContext.log = []
      do {
        currentTarget = currentTarget.closest("[data-elisten-" + etype + "]")
        if (currentTarget) {
          var func = handlers[domeldata.getKey(currentTarget)][etype].func
          var args = handlers[domeldata.getKey(currentTarget)][etype].args
          if (args) {
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
    // sets actual js event listeners
    evmanage.setJsListeners = function(domel, evnames, evhandler, data) {
      // if (arguments.length < 3) { return }
      // var handler = function() { evhandler.call(domel, data) }
      var handler = function(e) { evhandler.call(domel, e, data) }
      for (var i = 0; i < evnames.length; i++) {
        domel.addEventListener(evnames[i], handler)
      }
    }
    evmanage.setManager = function(domel, evnames, handler) {
      if (!evnames) return
      domel == domel || document
      handler = handler || function(e) { evmanage.bubble(e) }
      evmanage.setJsListeners(domel , evnames, handler )
    }
  })(evmanage)

  // dom manipulation
  // var libElProtoKey = lib.libElProtoKey = "pivot";
  // Element.prototype[libElProtoKey] = {}
  // var domelData = lib.domelData = "pivot";
  // Element.prototype[domelData] = {}
  var domeldata = lib.domeldata = {};
  (function(domeldata) {
    var key, data = []  //, evt = new CustomEvent("domelData")  // CustomEvent isn't compatable with IE

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

  var div = lib.div = function(parent, id, classes, innerHtml, attributes, evnames, evhandler, evargs) {
    attributes = attributes || {}
    if (id) attributes.id = id
    if (classes) attributes.class = classes
    return html(parent, "div", innerHtml, attributes, evnames, evhandler, evargs)
  }

  var html = lib.html = function(parent, tag, innerHtml, attributes, evnames, evhandler, evargs) {
    var i, attString, html, attribute
    html = document.createElement(tag)

    // if (evnames) { doOnEvents(html, evnames, evhandler, evargs) }
    if (evnames) { evmanage.listen(html, evnames, evhandler, evargs) }

    if (innerHtml instanceof Element) { html.appendChild(innerHtml) }
    else { html.innerHTML = (innerHtml || innerHtml === 0) ? innerHtml : "" }

    for (attribute in attributes) {
      if (!attributes.hasOwnProperty(attribute)) continue
      html.setAttribute(attribute, attributes[attribute])
    }
    if (parent) parent.appendChild(html)
    return html
  }

  //helpers
  var removeHrefsForCurrentLoc = lib.removeHrefsForCurrentLoc = function(removeContainer) {
    var isUrlMatch = false
    var hrefEls = document.querySelectorAll("[href]")
    var currentHref = window.location.href
    for (var i = 0; i < hrefEls.length; i++) {
      isUrlMatch = (canonicalize(hrefEls[i].href) == currentHref) || (window.location.pathname == "/" && window.location.protocol + "//" + window.location.host + "/myElections" == canonicalize(hrefEls[i].href))

      if (!isUrlMatch) continue  //skip this anchor if the url doesn't match

      if (removeContainer) { hrefEls[i].parentElement.removeChild(hrefEls[i]) }
      else { hrefEls[i].removeAttribute("href") }
    }
  }

  var anchorListDiv = lib.anchorListDiv = function(parent, classes, labelsAndHrefs) {
    var stepNavigator = div(parent, "", classes);
    for (var label in labelsAndHrefs) {
      var href = labelsAndHrefs[label]
      html(stepNavigator, "a", label, {"href": href});
    }
  }

  var electionsMenu = lib.electionsMenu = function(parent, electionId) {
    http.get(["/api/elections/", "/api/invite/acceptable"], function(elections, invitesData) {
      var election = {}, invite = {}
      for (var i = 0; i < elections.length; i++) {
        election = elections[i]
        if (electionId == election.id)
          break
      }

      if (electionId != election.id) {
        election = ""
      }

      for (var i = 0; i < invitesData.length; i++) {
        invite = invitesData[i]
        if (electionId == invite.election_id)
          break
      }

      if (electionId != invite.election_id) {
        invite = ""
      }

      if (election.can_edit) navitem(parent, "Add/Edit candidates", "/candidates/" + electionId, '<svg viewBox="1.4210854715202004e-14 0 21.73399734497069 23.9580020904541" width="21.73399734497069" height="23.9580020904541" xmlns="http://www.w3.org/2000/svg"><path d="M 12 6 C 12 9.314 9.314 12 6 12 C 2.686 12 0 9.314 0 6 C 0 2.686 2.686 0 6 0 C 9.314 0 12 2.686 12 6 Z M 7.221 4.315 L 5.932 1.182 L 4.999 4.439 L 1.621 4.697 L 4.431 6.59 L 3.632 9.882 L 6.301 7.795 L 9.185 9.572 L 8.025 6.389 L 10.607 4.195 Z" transform="matrix(1, 0, 0, 1, 1.4210854715202004e-14, 0)"/><path d="M 21.734 8.651 C 21.734 11.965 19.048 14.651 15.734 14.651 C 12.42 14.651 9.734 11.965 9.734 8.651 C 9.734 5.337 12.42 2.651 15.734 2.651 C 19.048 2.651 21.734 5.337 21.734 8.651 Z M 14.934 7.851 L 11.734 7.851 L 11.734 9.451 L 14.934 9.451 L 14.934 12.651 L 16.534 12.651 L 16.534 9.451 L 19.734 9.451 L 19.734 7.851 L 16.534 7.851 L 16.534 4.651 L 14.934 4.651 Z" transform="matrix(1, 0, 0, 1, 1.4210854715202004e-14, 0)"/><path d="M 15.942 17.958 C 15.942 21.271 13.256 23.958 9.942 23.958 C 6.628 23.958 3.942 21.271 3.942 17.958 C 3.942 14.644 6.628 11.958 9.942 11.958 C 13.256 11.958 15.942 14.644 15.942 17.958 Z M 5.942 18.952 L 13.942 18.952 L 13.942 16.952 L 5.942 16.952 Z" transform="matrix(1, 0, 0, 1, 1.4210854715202004e-14, 0)"/></svg>')
      if (election.can_edit) navitem(parent, "Manage electorate", "/electorate/" + electionId, '<svg width="200pt" height="200pt" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d=" M 90.44 17.62 C 98.91 15.50 108.10 16.28 116.04 19.95 C 125.76 24.35 133.51 32.84 137.06 42.90 C 140.16 51.50 140.10 61.20 136.80 69.73 C 132.84 80.22 124.20 88.83 113.68 92.72 C 102.38 97.00 89.09 95.68 78.96 89.07 C 73.61 85.52 69.09 80.73 65.84 75.20 C 59.26 64.02 59.24 49.53 65.05 38.04 C 70.05 28.00 79.55 20.33 90.44 17.62 Z"/><path d=" M 36.43 65.50 C 48.37 61.21 62.61 69.06 65.49 81.37 C 68.80 92.86 61.28 105.82 49.78 108.89 C 41.87 111.23 32.84 108.81 27.16 102.84 C 21.52 97.15 19.51 88.36 21.72 80.71 C 23.70 73.62 29.42 67.73 36.43 65.50 Z"/><path d=" M 149.43 65.48 C 161.38 61.20 175.56 69.12 178.44 81.41 C 181.70 92.87 174.23 105.78 162.78 108.87 C 154.64 111.34 145.31 108.65 139.65 102.34 C 135.17 97.46 133.01 90.57 133.94 84.01 C 134.99 75.54 141.32 68.06 149.43 65.48 Z"/><path d=" M 49.69 112.73 C 55.38 110.00 61.69 108.24 68.03 108.32 C 70.25 109.04 71.81 110.99 73.67 112.33 C 84.72 121.41 100.60 123.82 114.00 119.02 C 120.39 117.04 125.48 112.64 130.59 108.56 C 135.74 107.77 141.02 109.48 145.89 111.10 C 150.71 112.67 154.61 116.03 159.15 118.12 C 163.36 118.11 166.13 114.51 169.40 112.42 C 181.38 109.86 194.42 118.79 196.07 131.01 C 196.61 137.64 196.12 144.31 196.17 150.96 C 189.54 151.08 182.91 150.92 176.28 151.08 C 176.44 161.91 176.75 172.76 176.17 183.58 C 125.18 183.50 74.18 183.51 23.19 183.57 C 22.98 172.73 23.17 161.89 23.12 151.05 C 16.52 150.93 9.91 151.11 3.31 150.91 C 3.76 142.67 2.04 134.01 5.06 126.11 C 8.42 117.75 17.07 112.03 26.06 112.03 C 31.76 111.03 34.55 117.77 39.98 118.15 C 43.48 116.88 46.31 114.28 49.69 112.73 Z"/></svg>')
      if (election.can_edit) navitem(parent, "Administer", "/administer/" + electionId, '<svg viewBox="23.285306930541992 6.5975542068481445 153.3827667236328 186.71531677246094" width="153.3827667236328" height="186.71531677246094" xmlns="http://www.w3.org/2000/svg"><path d=" M 83.30 7.19 C 89.24 4.92 96.82 9.45 96.62 16.06 C 96.70 42.05 96.66 68.04 96.63 94.04 C 96.76 95.79 96.49 97.83 97.75 99.26 C 99.08 100.15 100.90 100.16 102.23 99.25 C 103.47 97.82 103.23 95.79 103.36 94.04 C 103.37 82.04 103.23 70.05 103.36 58.06 C 103.28 53.97 106.30 50.27 110.17 49.15 C 115.99 47.11 123.46 51.47 123.27 57.96 C 123.47 66.97 123.25 75.99 123.33 85.00 C 123.46 89.43 122.87 93.93 123.71 98.30 C 125.07 101.06 129.99 100.16 129.85 96.92 C 130.34 86.60 129.69 76.25 130.07 65.93 C 130.12 59.87 136.93 55.92 142.45 57.40 C 146.45 58.25 149.82 61.82 149.91 65.99 C 150.30 76.29 149.65 86.63 150.13 96.92 C 149.91 100.56 155.94 101.02 156.46 97.58 C 157.20 89.42 156.08 81.19 156.92 73.04 C 157.68 68.00 163.19 64.87 168.01 65.60 C 172.65 66.06 176.84 70.14 176.64 74.95 C 176.69 98.66 176.66 122.36 176.65 146.07 C 176.66 156.12 173.17 166.10 166.97 173.99 C 158.16 185.32 144.29 192.41 129.99 193.19 C 113.31 194.26 96.31 188.30 84.03 176.94 C 65.15 159.16 46.37 141.28 27.46 123.53 C 25.61 121.71 23.49 119.70 23.33 116.93 C 22.87 112.77 26.02 108.73 30.05 107.86 C 34.38 106.91 38.88 108.19 42.68 110.29 C 51.71 115.30 60.78 120.22 69.80 125.24 C 71.42 125.92 73.42 127.43 75.12 126.15 C 76.89 125.10 76.58 122.80 76.70 121.06 C 76.61 86.37 76.68 51.66 76.66 16.97 C 76.30 12.62 79.12 8.43 83.30 7.19 Z" transform="matrix(1, 0, 0, 1, -1.7763568394002505e-15, 0)"/></svg>')
      if (election.can_vote || invite) {
        var menuButtonVote = navitem(parent, "Vote", "/ballot/" + electionId, '<svg viewBox="40.27000045776367 12.605377197265625 155.81187438964844 174.72491455078125" width="155.81187438964844" height="174.72491455078125" xmlns="http://www.w3.org/2000/svg"><path d="M 107.797 121.438 C 117.255 112.11 126.356 102.411 135.719 92.978 C 139.823 96.907 143.703 101.063 147.681 105.13 C 134.424 118.777 121.174 132.431 107.823 145.974 C 99.932 137.758 91.901 129.685 84.012 121.469 C 87.989 117.404 91.87 113.247 95.974 109.319 C 99.951 113.319 103.865 117.384 107.797 121.438 Z M 87.54 21.57 C 85.12 28.27 87.15 35.72 84.42 42.35 C 82.26 48.35 77.28 52.57 73.43 57.44 C 67.33 65.01 61.31 72.63 54.94 79.96 C 52.04 83.44 47.47 84.46 43.76 86.75 C 40.73 88.72 40.3 92.65 40.27 95.95 C 40.36 117.98 40.24 140.01 40.29 162.05 C 40.27 165.55 40.85 170.01 44.6 171.45 C 49.45 173.17 54.7 173.2 59.74 174.07 C 71.33 175.96 83.23 176.8 94.33 180.88 C 111.61 186.31 129.92 187.88 147.96 187.17 C 154.58 186.87 161.48 186.58 167.53 183.55 C 173.07 180.91 177.38 175.91 179.17 170.03 C 180.46 166.21 180.25 162.12 181.07 158.21 C 182.27 154.63 185.08 151.84 186.24 148.23 C 187.99 143.69 187.07 138.79 187.29 134.08 C 187.9 130.79 190.12 128.06 190.91 124.81 C 192.21 120.27 190.62 115.62 190.92 111.03 C 191.39 106.84 193.91 103.28 195.08 99.29 C 197.4 91.94 195.66 83.35 190.18 77.83 C 185.72 73.03 179.12 70.85 172.69 70.67 C 158.8 70.18 144.9 70.46 131 70.48 C 125.69 70.44 120.34 70.88 115.09 69.91 C 116.72 63.87 119.94 58.36 121.14 52.18 C 123.77 41.2 123.12 28.39 115.54 19.44 C 110.84 13.59 102.5 11.24 95.37 13.39 C 91.56 14.56 88.77 17.87 87.54 21.57 Z" transform="matrix(1, 0, 0, 1, 0, -8.881784197001252e-16)"/></svg>')
        if (!election.can_vote) {  // if they can't already vote, and we're in this spot in the code, there must be an outstanding invite
          menuButtonVote.addEventListener("click", function() {
            http.post(["/api/invite/accept"], [{"code": invite.code}])
          })
        }
      }
      navitem(parent, "Results", "/results/" + electionId, '<svg viewBox="80.30702209472656 40.8129997253418 12.5589599609375 17.69198226928711" width="12.5589599609375" height="17.69198226928711" xmlns="http://www.w3.org/2000/svg"><path d="M 89.545 54.073 C 89.474 53.636 89.579 53.179 89.849 52.813 L 88.05 51.135 C 88.047 51.138 88.043 51.14 88.04 51.143 C 87.323 51.723 86.27 51.613 85.69 50.895 C 85.391 50.526 85.275 50.068 85.331 49.632 L 83.441 49.23 C 83.34 49.413 83.202 49.58 83.03 49.72 C 82.312 50.301 81.26 50.19 80.679 49.473 C 80.099 48.755 80.209 47.703 80.927 47.122 C 81.43 46.715 82.097 46.648 82.651 46.892 L 88.006 43.674 L 86.732 42.753 L 88.68 42.668 L 89.278 40.813 L 89.959 42.639 L 91.909 42.635 L 90.383 43.847 L 90.989 45.7 L 89.364 44.623 L 87.79 45.772 L 88.057 44.81 L 83.429 47.591 C 83.548 47.798 83.618 48.023 83.641 48.25 L 85.768 48.702 C 85.82 48.647 85.876 48.594 85.937 48.545 C 86.654 47.964 87.707 48.075 88.287 48.792 C 88.638 49.226 88.736 49.782 88.601 50.282 L 90.674 52.215 C 91.314 52.004 92.045 52.196 92.494 52.751 C 93.074 53.469 92.964 54.521 92.246 55.102 C 91.575 55.645 90.61 55.582 90.012 54.984 L 83.643 56.69 C 83.688 57.224 83.477 57.77 83.029 58.133 C 82.312 58.713 81.26 58.603 80.679 57.885 C 80.099 57.168 80.209 56.116 80.927 55.535 C 81.636 54.961 82.672 55.063 83.257 55.758 Z" transform="matrix(1, 0, 0, 1, 0, -3.552713678800501e-15)"/></svg>')

      removeHrefsForCurrentLoc()
    }
            )
  }

  var navitem = lib.navitem = function(parent, label, href, svg) {
    var a = html(parent, "a", "", {"href": href, "class": "clickable4"})
    if (svg) div(a, "", "w100 textCenter", div("", "", "w15", svg))
    div(a, "", "", label)
    return a
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

  var http = lib.http = {}
  var httpMultiple = lib.http.send = function(method, resources, payloads, onSuccess, onFail) {
    if (!resources) {
      resources = []
    } else if (!Array.isArray(resources)) {
      resources = [resources]
    }
    
    if (!payloads) {
      payloads = []
    } else if (!Array.isArray(payloads)) {
      payloads = [payloads]
    }

    var exFuncAry = function() {
      var funcReturns = []
      for (var i in resources) { funcReturns.push( axios[method](resources[i], payloads[i]) ) }
      return funcReturns
    }

    //default onSuccess and onFail functions
    onSuccess = onSuccess || function() {
      console.group("httpMultiple:")
      for (var i in arguments) {
        console.log(arguments[i])
      }
      console.groupEnd()
    };

    onFail = onFail || function(error) {
      console.group("httpMultiple error:")
      console.log(resources)
      console.log(payloads)
      console.log(error)
      console.log(error.response)  //error.response isn't displayed when I just print out error for some reason
      console.groupEnd()
    }

    var thenFunc = function () {
      var responseData = []
      for (var i in arguments){
        responseData.push(arguments[i].data)
      }
      onSuccess.apply(null, responseData)
    }

    axios.all(exFuncAry())
      .then(axios.spread(thenFunc))
      .catch(onFail)  // this is currently sending the error variable to the onFail functions I pass in, but I'm not sure why
  }

  var getMultResources = lib.http.get = function(resources, onSuccess, onFail) {
    httpMultiple("get", resources, "", onSuccess, onFail)
  }

  var postToMultResources = lib.http.post = function(resources, payloads, onSuccess, onFail) {
    httpMultiple("post", resources, payloads, onSuccess, onFail)
  }

  var deleteMultResources = lib.http.delete = function(resources, onSuccess, onFail) {
    httpMultiple("delete", resources, "", onSuccess, onFail)
  }

  var onAxiosError = function(resource, payload, onSuccess, error) {
    console.group("error");
    console.log(resource);
    console.log(payload);
    console.log(onSuccess);
    console.log(error);
    console.groupEnd()
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
  var removeAllChildren = lib.removeAllChildren = function(domel) {
    while (domel.lastChild) { domel.removeChild(domel.lastChild) }
  }

  var makeVobjectCollection = lib.makeVobjectCollection = function(indexesSingle) {
    var collection = {}
    collection.list = []
    collection.statuses = {}
    if (indexesSingle) {
      collection.indexesSingle = {}
      for (var i = 0; i < indexesSingle.length; i++) {
        collection.indexesSingle[indexesSingle[i]] = {}
      }
    }

    collection.push = function(vobject, status) {
      status = (status || vobject.status) || "current"
      vobject.index = collection.list.push(vobject) - 1
      vobject.status = status
      lib.setTreeData(collection, ["statuses", status, vobject.index], vobject)
      for (var key in collection.indexesSingle) {
        // every index field must be set
        if (!vobject[key]) {
          continue  //noe this could still result in wonky indexes; should make this better
        }

        // TODO: what if multiple vobjects have the same key?
        collection.indexesSingle[key][vobject[key]] = vobject
      }

      return vobject.index
    }

    collection.status = function(vobject, status) {
      if (!status) return vobject.status  //don't do anything if the status is unchanged
      if (status == vobject.status) return status  //don't do anything if the status is the same as before
      delete collection.statuses[vobject.status][vobject.index]  //delete the entry for this vobject in the old index
      lib.setTreeData(collection, ["statuses", status, vobject.index], vobject)  //add an entry for this vobject in the new index
      vobject.status = status  //update the status field on the vobject
      return status
    }

    collection.remove = function(vobject) {
      var status = vobject.status
      if (!status)
        return
      //remove from single response indexes
      for (var key in collection.indexesSingle) {
        if (vobject[key])
          delete collection.indexesSingle[key][vobject[key]]
      }
      delete collection.statuses[vobject.status][vobject.index]  //delete the entry for this vobject in whatever index it's in
      vobject.status = false  //noe this needs to be improved
    }

    collection.reset = function() {
      collection.list = []
      collection.statuses = {}
    }

    collection.length = function(status) {
      if (!status) {
        // won't this be wrong, because entries never seem to be deleted from here?
        return collection.list.length
      }
      if (!collection.statuses[status]) {
        return 0
      }
      return Object.keys(collection.statuses[status]).length
    }

    return collection
  }

  var setTreeData = lib.setTreeData = function(obj, keys, value, push) {
    var keyName, key, keysLength = keys.length
    if (!obj) obj = {}
    var objCursor = obj;  //keep our reference to the original obj
    //make sure all of the keys are populated (except for the last one, since we can set that directly afterwards)
    for (key = 0; key < keysLength - 1; key++) {
      keyName = keys[key];
      if (!objCursor[keyName]) {objCursor[keyName] = {};}
      objCursor = objCursor[keyName];
    }

    //set the actual value on the last key
    //check if we are wanting to just set the value, or if we want to push to an array
    if ("push" != push) {objCursor[keys[key]] = value; return obj;}

    //if an array doesn't already exist, create it
    if (!Array.isArray(objCursor[keys[key]])) {objCursor[keys[key]] = [];}
    objCursor[keys[key]].push(value);

    return obj;
  }

  lib.checkbox = function(parent, id, name, size, checked, labelatts, evhandler, evargs) {
    var vobject = {}, label, input, atts = {}, ui
    label = vobject.label = html("", "label", "", labelatts)
    atts.type = "checkbox"
    atts.style = "display:none;"
    if (id) atts.id = id
    if (name) atts.name = name
    input = vobject.input = html(label, "input", "", atts, "click", evhandler, evargs)
    if (checked) input.checked = true
    ui = html(label, "div", "", {"class": "checkboxUI0"})
    // size = size || "16px";
    if (size) {
      ui.style.width = size
      ui.style.height = size
      ui.style["line-height"] = size
      ui.style["font-size"] = size
    }
    parent.appendChild(label)
    return vobject
  }

  lib.table = function(parent, columnHeaders, atts) {
    var table = div(parent, "", "", "", atts)  // create the table
    addClass(table, "table")
    div(parent, "", "row1", div("", "", "", table))  //add the table to a row in the workspace
    if (!columnHeaders || columnHeaders.length < 1) return table
    var row0 = div(table)
    for (var i = 0; i < columnHeaders.length; i++) { row0.appendChild(columnHeaders[i]) }
    return table
  }

  //feed our object to the function so that we can populate it with properties
})(piv)
