function cleanDomain(str) {
    var newStr = str.replace("https://", "");
    newStr = newStr.replace("http://", "");
    newStr = newStr.replace("www.", "");
    return newStr;
}

function requiredField(id, label, val) {
    if (val.length==0) {
        alert(label + ' is a required field.');
        addHighLightToInput(id);
        return false;
    }
    return true;
}

function isValidURL(id, label, value) {
    //regex to match URL
    var expressionURL = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regexURL = new RegExp(expressionURL);
    if (!value.match(regexURL)) {
        alert(label + " URL is not a valid URL.");
        addHighLightToInput(id);
        return false;
    }
    return true;
}

function addHighLightToInput(id) {
    $('#'+id).focus();
    $('#'+id).addClass('error-highlight');
    setTimeout(function () {
        $('.error-highlight').removeClass('error-highlight');
    }, 2500);
}