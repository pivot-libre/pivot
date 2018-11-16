
(function() {
    "use strict";
    document.querySelector("#tryForm").addEventListener('submit', function(event){
        event.preventDefault();

        var form = event.target;
        var requestBody = new FormData(form);

        var toggleResultsVisibility = function(visible){
            var methodName = visible ? 'remove' : 'add';
            document.querySelector('#result').classList[methodName]('hidden');
        };
        
        var displayResponse = function(text){
            document.querySelector('#resultText').innerHTML = text;
            toggleResultsVisibility(true);
        };
        toggleResultsVisibility(false);
        axios.post(
            '/open/try',
            requestBody,
            {transformResponse: undefined}
            ).then(function(response){
           displayResponse(response.data); 
        }).catch(function(error){
            displayResponse(error.response.data);
        });
    });

})();
