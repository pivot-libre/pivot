<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Pivot Libre Election Result</title>
  </head>
  <body>
        <h1>Pivot Libre Election Result</h1>
      <h2>Election</h2>
        <dl>
            <dt>Election Name</dt>
            <dd>{{ $election->getAttribute('name') }}</dd>
            <dt>Results Date</dt>
            <dd>{{ $snapshotTime->format(DateTime::ATOM) }}</dd>
        </dl>
        <h2>Electors</h2>
        <div>
            @foreach($electorNames as $electorName)
                <span class="electorName">{{ $electorName }}</span>
                @if(!$loop->last)
                <span class="electorSeparator">,</span>
                @endif
            @endforeach
        </div>
       <h2>Ballots</h2>
            @foreach($electorsAndBallots as $electorAndBallot)
	        <div>
                    <span class="electorName">{{ $electorAndBallot['elector']['name'] }}</span>
                    <span class="candidateRanking">
                        @foreach($electorAndBallot['ballot'] as $candidateList)
                            @foreach($candidateList as $candidate)
                                <span class="candidateName">{{ $candidate['name'] }}</span>
                                @if(!$loop->last)
                                    <span class="candidateSeparator">&nbsp;=&nbsp;</span>
                                @endif
                            @endforeach
                            @if(!$loop->last)
                                <span class="candidateSeparator">&nbsp;&gt;&nbsp;</span>
                            @endif
                        @endforeach
                    </span>
                </div>
            @endforeach
        <h2>Tie Breaking</h2>
        <dl>
            <dt>Partially-Ordered Tie-Breaking Ballot</dt>
            <dd>
                <span class="candidateRanking">
                   @foreach($partiallyOrderedTieBreaker as $candidateList)
                        @foreach($candidateList as $candidate)
                            <span class="candidateName">{{ $candidate['name'] }}</span>
                            @if(!$loop->last)
                                <span class="candidateSeparator">&nbsp;=&nbsp;</span>
                            @endif
                        @endforeach
                        @if(!$loop->last)
                            <span class="candidateSeparator">&nbsp;&gt;&nbsp;</span>
                        @endif
                    @endforeach
                </span>
            </dd>
            <dt>Totally-Ordered Tie-Breaking Ballot</dt>
            <dd>
                <span class="candidateRanking">
                   @foreach($totallyOrderedTieBreaker as $candidateList)
                        @foreach($candidateList as $candidate)
                            <span class="candidateName">{{ $candidate['name'] }}</span>
                            @if(!$loop->last)
                                <span class="candidateSeparator">&nbsp;=&nbsp;</span>
                            @endif
                        @endforeach
                        @if(!$loop->last)
                            <span class="candidateSeparator">&nbsp;&gt;&nbsp;</span>
                        @endif
                    @endforeach
                </span>
            </dd>
 
        <h2>Results</h2>
            <span class="candidateRanking">
               @foreach($result as $candidateList)
                    @foreach($candidateList as $candidate)
                        <span class="candidateName">{{ $candidate['name'] }}</span>
                        @if(!$loop->last)
                            <span class="candidateSeparator">&nbsp;=&nbsp;</span>
                        @endif
                    @endforeach
                    @if(!$loop->last)
                        <span class="candidateSeparator">&nbsp;&gt;&nbsp;</span>
                    @endif
                @endforeach
            </span>
  </body>
</html>

