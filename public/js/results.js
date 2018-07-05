'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {
    // snapshot versions (corresponds to ResultSnapshotController.php)
    var VERSION_TEST = 1;
    var VERSION_ADD_RESULTS = 2;
    var VERSION_ADD_DEBUG = 3;
    var VERSION_ADD_ERROR_INFO = 4;
    var VERSION_ADD_ELECTOR_INFO = 5;
    var VERSION_SURFACE_CANDIDATE_TIES = 6;
    
    // should be latest version:
    var SNAPSHOT_FORMAT_VERSION = VERSION_SURFACE_CANDIDATE_TIES;
    
    // script-level variables
    var View = Piv.view
    var ResultsList = Piv.div(View.workspace, "", "text1 border-color-3 bg-color-6");

    function main() {
	View.setHeader("Results", ElectionId)
	View.statusbar.innerHTML = ""
	Piv.electionsMenu(View.sidenav, ElectionId)
	Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page
	Piv.http.get(["/api/elections/" + ElectionId + "/result_snapshots"], getLastResultSnapshot, showErrorMessage)
    }

    function displayCandidateGroup(rank, candidates) {
	if (ResultsList.innerHTML != "") {
	    piv.html(ResultsList, "span", "<br><br>")
	}

	var group = Piv.div(ResultsList, "", "border-color-3 bg-color-white")
	for (var key in candidates) {
	    var name = candidates[key].name
	    group.innerHTML += ("<b>Rank " + rank + ":</b> " + name + "<br>")
	}
    }

    function getLastResultSnapshot(snapshots) {
	if (snapshots.length < 1) {
	    showErrorMessage()
	    return
	}
	Piv.http.get(["/api/elections/" + ElectionId + "/result_snapshots/" + snapshots[snapshots.length - 1].id], showElectionResults, showErrorMessage)
    }

    function showElectionResults(results) {
	console.log(results)
	var version = parseInt(results.format_version) // TODO: determine why this is a string in some deployments
	var supported = [VERSION_SURFACE_CANDIDATE_TIES]
	if (supported.indexOf(version) >= 0) {
	    if ('error' in results.result_blob && results.result_blob['error'] != null) {
		Piv.div(View.workspace, "", "100 text3", results.result_blob['error'])
		return
	    }

	    var candidateOrder = results.result_blob.order
	    ResultsList.innerHTML = ""
	    var rank = 1
	    for (var key in candidateOrder) {
		displayCandidateGroup(rank, candidateOrder[key])
		rank += 1
	    }
	}
	else {
	    Piv.div(View.workspace, "", "100 text3", "Snapshot with version "+version+" not accessible.  Please take another snapshot.")
	}
    }

    function showErrorMessage(error) {
	console.log(error)
	Piv.div(View.workspace, "", "w100 text3", "Results for this election are not currently available.")
	if (!error) return
	Piv.div(View.workspace, "", "100 text3", error.response.data.message)
    }

    main()
})(piv, election)
