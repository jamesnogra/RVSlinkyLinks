$(document).ready(function() {

    $('#submit-btn').click(function() {
        var domain = $('#domain').val();
        domain = cleanDomain(domain);
        var campaignId = $('#campaign-id').val();
        var destinationURL = $('#destination-url').val();
        var linkType = $('#link-type').val();
        var linkURL = $('#link-url').val();
        var anchorText = $('#anchor-text').val();
        var linkLiveDate = $('#link-live-date').val();
        if (!requiredField('domain', 'Domain', domain)) { return; }
        if (!requiredField('campaign', 'Campaign', campaignId)) { return; }
        if (!isValidURL('destination-url', 'Destination', destinationURL)) { return; }
        if (!isValidURL('link-url', 'Link', linkURL)) { return; }
        if (!requiredField('anchor-text', 'Anchor Text', anchorText)) { return; }
        if (!requiredField('link-live-date', 'Link Live Date', linkLiveDate)) { return; }
        var theData = {
            domain:         domain,
            campaignId:     campaignId,
            destinationURL: destinationURL,
            linkURL:        linkURL,
            anchorText:     anchorText,
            linkLiveDate:   linkLiveDate,
            linkType:       linkType, 
        };
        $('body').append('<div id="loading-container"><div class="loader"></div></div>');
        $.post("/slinky-links", theData).done(function(data) {
            $('#loading-container').remove();
            console.log(data);
        }).fail(function(xhr, status, error) {
            alert("Something went wrong.");
            $('#loading-container').remove();
        });
    });

    $('#reset-btn').click(function() {
        $('#domain').val('');
        $('#domain-id').val('');
        $('#campaign').val('');
        $('#campaign-id').val('');
        $('#link-type').val(12);
        $('#destination-url').val('');
        $('#link-url').val('');
        $('#anchor-text').val('');
        $('#link-live-date').val('');
    });

    $('.date').datepicker({
        format: 'yyyy-mm-dd',
        startDate: '0d',
        autoclose: true
    });

    /*//this is for the autocomplete of domains
    var allDomainValues = allDomains.map(function(el) {
        var o = Object.assign({}, el);
        o.value = o.HostName;
        return o;
    })
    $("#domain").autocomplete({
        source: allDomainValues,
        focus: function( event, ui ) {
            $( "#domain" ).val( ui.item.HostName );
            return false;
        },
        select: function(event, ui) {
            $("#domain").val(ui.item.HostName);
            $("#domain-id").val(ui.item.DomainID);
            return false;
        },
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(allDomainValues, request.term);
            response(results.slice(0, 10));
        }
    });
    $("#domain").keyup(function() {
        $("#domain-id").val("");
    });*/

    //this is for the autocomplete of campaigns
    var allCampaignValues = allCampaigns.map(function(el) {
        var o = Object.assign({}, el);
        o.value = o.CampaignName;
        return o;
    })
    $("#campaign").autocomplete({
        source: allCampaignValues,
        focus: function( event, ui ) {
            $( "#campaign" ).val( ui.item.CampaignName );
            return false;
        },
        select: function(event, ui) {
            $("#campaign").val(ui.item.CampaignName);
            $("#campaign-id").val(ui.item.CampaignID);
            return false;
        },
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(allCampaignValues, request.term);
            response(results.slice(0, 10));
        }
    });
    $("#campaign").keyup(function() {
        $("#campaign-id").val("");
    });

});

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