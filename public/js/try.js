
(function(axios) {
    "use strict";
    
    function resizeTextArea() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    }
    
    var textAreas = Array.prototype.slice.call(document.getElementsByTagName("textarea"));
    textAreas.forEach(function(textArea){
        textArea.setAttribute("style", "height:" + (textArea.scrollHeight) + "px;overflow-y:hidden;");
        textArea.addEventListener("input", resizeTextArea, false);
    });
    
    var toggleResultsVisibility = function(visible){
        var methodName = visible ? "remove" : "add";
        document.querySelector("#result").classList[methodName]("hidden");
    };
    
    var displayResponse = function(text){
        var element = document.querySelector("#resultText");
        element.innerHTML = text;
        toggleResultsVisibility(true);
        resizeTextArea.call(element);
    };
 
    document.querySelector("#tryForm").addEventListener("submit", function(event){
        event.preventDefault();

        var form = event.target;
        var requestBody = new FormData(form);

        toggleResultsVisibility(false);
        axios.post(
            "/open/try",
            requestBody,
            {transformResponse: undefined}
            ).then(function(response){
           displayResponse(response.data); 
        }).catch(function(error){
            displayResponse(error.response.data);
        });
    });

}(axios));
