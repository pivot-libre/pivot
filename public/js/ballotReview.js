'use strict';

//create a file-specific context via a function
(function(Piv) {

// script-level variables
var View = Piv.view, Rankeditems, Unrankeditems

// actions (do stuff)
View.setHeader("Review Ballot")

Piv.anchorListDiv(View.workspace, "", {
    "Rank Candidates": "/ballot/" + election,
    "Review ballot": "/ballotReview/" + election
  }
)

Rankeditems = Piv.html(View.workspace, "ol", "", {"id": "rankeditems", "class": "itemlist incrementsCounter"});
Unrankeditems = Piv.html(View.workspace, "ol", "", {"id": "unrankeditems", "class": "itemlist"});

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page


Piv.loadBallot(election, Piv.displayBallot, li1, Rankeditems, Unrankeditems)

// function definitions
function li1(parent, uniq, description, tie, isNew) {
  var candidateLiAtts = {"class": "row1"}
  if (tie) { candidateLiAtts["data-tie"] = tie }
  var box = Piv.html(parent, "li", "", candidateLiAtts);

  Piv.div(box, "", "text1square orderdisplay");
  Piv.div(box, "", "text1 w75", description);
}

// close the self-executing function and feed the piv library to it
})(piv)
