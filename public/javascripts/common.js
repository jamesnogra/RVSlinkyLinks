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

function filterLinks() {
    var filter_link = '/slinky-links/links/all';
    filter_link += '?destination_url='+$('#destination_url').val();
    filter_link += '&link_url='+$('#link_url').val();
    filter_link += '&anchor_text='+$('#anchor_text').val();
    filter_link += '&link_live_date_start='+$('#link_live_date_start').val();
    filter_link += '&link_live_date_end='+$('#link_live_date_end').val();
    filter_link += '&domain_authority='+$('#domain_authority').val();
    filter_link += '&spam_score='+$('#spam_score').val();
    filter_link += '&page_rank='+$('#page_rank').val();
    filter_link += '&title='+$('#title').val();
    window.location = filter_link;
}