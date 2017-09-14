@extends('layouts.ballot')

<?php
//noe incomplete: get this information via the API. The following is just for mockup purposes!!
// $rankingsJson = <<<'EOT'
// {"ranked":[],"unranked":[{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"Participatory Budgeting experiment","tie":null},{"description":"Approve RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"adsfas RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"Approve RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"and 1-year seed-funding for Participatory Budgeting experiment","tie":null}]}
// EOT;
$rankingsJson = '{"ranked":[],"unranked":[{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"Participatory Budgeting experiment","tie":null},{"description":"Approve RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"adsfas RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"Approve RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"and 1-year seed-funding for Participatory Budgeting experiment","tie":null}]}';
$rankings = json_decode($rankingsJson, true);
?>

@section('content')

<body>
  <div id="backgrounddiv">
    <div class="backgroundheader"></div>
    <div id="ballotdiv">
      <div class="ballotheader">City of Madison Operating Budget - 2018</div>
      <div class="stepnav">
        <a>Rank items</a>
        <a href="review.php">Review</a>
        <a href="#">Cast ballot</a>
      </div>
      <div class="ballotspace">
        <div class="ballotspaceheader">
          <div id="ballotspaceheaderline1">Select your 1st choice</div>
        </div>
        <ol id="rankeditems" class="ballotselections">

          <?php
          $rank = 0;
          $uniq = 0;
          foreach ($rankings["ranked"] as $item) {
              ballotselection(++$uniq, $item["description"], "(-$225,000)", $item["tie"]);
          }
          // ballotselection(++$rank, "Approve RFP and 1-year seed-funding for Participatory Budgeting experiment", "(-$225,000)");
          // ballotselection(++$rank, "and 1-year seed-funding for Participatory Budgeting experiment", "(-$225,000)");
          // ballotselection(++$rank, "adsfas RFP and 1-year seed-funding for Participatory Budgeting experiment", "(-$125,000)");
          // ballotselection(++$rank, "Approve RFP and 1-year seed-funding for Participatory Budgeting experiment", "(-$225,000)");
          // ballotselection(++$rank, "funding for Participatory Budgeting experiment", "(-$225,000)");
          ?>
        </ol>
        <ol id="unrankeditems" class="ballotselections">
          <?php
          foreach ($rankings["unranked"] as $item) {
              ballotselection(++$uniq, $item["description"], "(-$225,000)");
          }
          // ballotselection(++$rank, "funding for Participatory Budgeting experiment", "(-$225,000)");
          // ballotselection(++$rank, "Participatory Budgeting experiment", "(-$225,000)");
          // ballotselection(++$rank, "funding for Participatory Budgeting experiment", "(-$225,000)");
          ?>
        </ol>
      </div>
    </div>
  </div>
@endsection


<?php
function ballotselection($uniq, $description, $cost, $tie = "") {
  if (!$tie) { $tie = ""; }
  else { $tie = ' data-tie="' . $tie . '"'; }
echo <<<HTML
  <li class="ballotselection" onclick="ballotItemClick(this)"$tie>
    <label class="ballotrank" for="ballotcheck-$uniq">
      <input type="checkbox" name="ballotcheck" id="ballotcheck-$uniq"></input>
      <div class="tie" onclick="processSelected(event,tieSelected)"></div>
      <div class="banish" onclick="processSelected(event,banish)"></div>
      <div class="rankdisplay"></div>
    </label>
    <div class="grippy"></div>
    <div class="ballotdescription">$description</div>
    <div class="ballotcost">$cost</div>
  </li>
HTML;
  }
?>
