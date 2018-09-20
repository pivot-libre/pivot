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
       <h2>Ballots</h2>
            @foreach($electorsAndBallots as $electorAndBallot)
	        <div>
                    <span class="electorName">{{ $electorAndBallot['elector']['name'] }}</span>
                    <span class="candidateranking">
                        @foreach($electorAndBallot['ballot'] as $candidateList)
                            @foreach($candidateList as $candidate)
                                <span class="candidatename">{{ $candidate['name'] }}</span>
                                @if(!$loop->last)
                                    <span class="candidateseparator">&nbsp;=&nbsp;</span>
                                @endif
                            @endforeach
                            @if(!$loop->last)
                                <span class="candidateseparator">&nbsp;&gt;&nbsp;</span>
                            @endif
                        @endforeach
                    </span>
                </div>
            @endforeach
        <h2>Results</h2>
            <span class="candidateranking">
               @foreach($result as $candidateList)
                    @foreach($candidateList as $candidate)
                        <span class="candidatename">{{ $candidate['name'] }}</span>
                        @if(!$loop->last)
                            <span class="candidateseparator">&nbsp;=&nbsp;</span>
                        @endif
                    @endforeach
                    @if(!$loop->last)
                        <span class="candidateseparator">&nbsp;&gt;&nbsp;</span>
                    @endif
                @endforeach
            </span>
  </body>
</html>

