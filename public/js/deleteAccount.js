'use strict';
(function(Piv) {
  var View = Piv.view
  View.setHeader("Delete your account?")
  var DeleteAccountForm = Piv.html(View.workspace, "form", "", {"action": "javascript:;"})

  DeleteAccountForm.addEventListener("submit", function() {deleteAccount(DeleteAccountForm)})
  Piv.html(DeleteAccountForm, "input", "", {"type": "submit", "value": "Confirm [DANGER!]"});

  // function definitions
  function deleteAccount(form) {
    Piv.http.post(["/api/delete_account"], [{}], function(response) {
      alert(response);
    })
  }
})(piv)
