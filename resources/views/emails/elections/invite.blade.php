@component('mail::message')
# [{{ $appName }}]({{ $appUrl }})
You have been invited to rank options in the {{ $electionName }} election.

@component('mail::button', ['url' => $ballotUrl ])
Vote
@endcomponent

@endcomponent
