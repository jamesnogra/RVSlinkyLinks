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
    filter_link += '&hostname='+$('#hostname').val();
    filter_link += '&username='+$('#username').val();
    filter_link += '&link_url='+$('#link_url').val();
    filter_link += '&campaign='+$('#campaign').val();
    filter_link += '&link_type='+$('#link-type').val();
    filter_link += '&anchor_text='+$('#anchor_text').val();
    filter_link += '&link_live_date_start='+$('#link_live_date_start').val();
    filter_link += '&link_live_date_end='+$('#link_live_date_end').val();
    filter_link += '&domain_authority='+$('#domain_authority').val();
    filter_link += '&spam_score='+$('#spam_score').val();
    filter_link += '&page_rank='+$('#page_rank').val();
    filter_link += '&title='+$('#title').val();
    window.location = filter_link;
}

var link_type = {
    '1':'Banner',
    '2':'Home Page/Sidebar',
    '3':'Guest Blog Post',
    '4':'In Content',
    '5':'Footer',
    '6':'Infographic',
    '7':'Scholarship',
    '8':'Guest Post - in content',
    '9':'Guest Post - author attribution',
    '10':'Bonus (viral or syndication)',
    '11':'Bonus (indirect but attributable)',
    '12':'Resource page',
    '13':'Broken Link',
    '14':'Video Link',
    '15':'Municipality',
    '16':'Unlinked Brand Mention',
};

//put all the link types to the add link form
$(document).ready(function() {
    if ($('#link-type').length) {
        for (var key in link_type) {
            $('#link-type').append('<option value="'+key+'" '+((key==12)?'selected':'')+'>'+link_type[key]+'</option>');
        }
    }
});

//put all the real text values of the link type
$(document).ready(function() {
    if ($('.link-type-values').length) {
        $('.link-type-values').each(function() {
            $(this).html(link_type[$(this).html()])
        });
    }
});