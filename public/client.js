function loadbutton() {
fetch("/DEDataGet", {  
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Name: 'fileName',
                    })
                })
                .then(function(res) {
                    console.log("client res :" + JSON.stringify(res));
                    console.log("client res :" + res);
                })
                .catch(function(err) {
                    console.log("client err :" + JSON.stringify(err));
                    console.log("client err :" + err);
                });








var tds = "", i;
for (i = 1; i <= 6; i++) {
    tds = tds + '<tr class="slds-hint-parent"> ' +
        '<td class="slds-row-select"> ' +
        '<label class="slds-checkbox" for="select-row1"> ' +
        '<input name="select-row1" type="checkbox" id="select-row1" /> ' +
        '<span class="slds-checkbox--faux"></span> ' +
        '<span class="slds-form-element__label slds-assistive-text">select row1</span> ' +
        '</label> ' +
        '</td>' +
        '<th data-label="name" role="row"><a href="#" class="slds-truncate">' + 'Acme' + '</a></th> ' +
        '<td data-label="external-key"><a href="#" class="slds-truncate"> ' + 'Acme' + '</a></td> ' +
        '<td data-label="description"> ' +
        '<span class="slds-truncate">' + '4/14/2015' + '</span>' +
        '</td>' +
        '<td data-label="field-count">' +
        '<span class="slds-truncate">' + 'Prospecting' + '</span>' +
        '</td>' +
        '<td data-label="record-count">' +
        '<span class="slds-truncate">' + '20%' + '</span>' +
        '</td>' +
        '<td data-label="sendable">' +
        '<span class="slds-truncate">' + '$25k' + '</span>' +
        '</td>' +
        '<td data-label="testable">' +
        '<span class="slds-truncate">' + 'ghc' + '</span>' +
        '</td>' +
        '</tr>';
}

document.getElementById('DEBody').innerHTML = tds;




var tds = document.querySelectorAll('#DEBody tbody td'), i;
for (i = 0; i < tds.length; ++i) {
    console.log("tds : " + JSON.stringify(tds[i].innerHTML));
}

}