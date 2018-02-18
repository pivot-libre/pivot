'use strict';

//create a file-specific context via a function
(function(piv) {

var view = piv.view
view.setHeader("Review Ballot")

piv.anchorListDiv(view.workspace, "", {
    "Rank Candidates": "/ballot/" + election,
    "Review ballot": "/ballotReview/" + election
  }
)

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var rankeditems = piv.html(view.workspace, "ol", "", {"id": "rankeditems", "class": "itemlist incrementsCounter"});
var unrankeditems = piv.html(view.workspace, "ol", "", {"id": "unrankeditems", "class": "itemlist"});

piv.loadBallot(election, piv.displayBallot, li1)

function li1(parent, uniq, description, cost, tie, isNew) {
  var candidateLiAtts = {"class": "row1"}
  if (tie) { candidateLiAtts["data-tie"] = tie }
  var box = piv.html(parent, "li", "", candidateLiAtts);

  piv.div(box, "", "text1square orderdisplay");
  piv.div(box, "", "text1 w75", description);
}

// close the self-executing function and feed the piv library to it
})(piv)
