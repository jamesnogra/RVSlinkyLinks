$(document).ready(function() {

    $('#submit-btn').click(function() {
        var domain = $('#domain').val();
        domain = cleanDomain(domain);
        var campaign = $('#campaign').val();
        var destinationURL = $('#destination-url').val();
        var linkType = $('#link-type').val();
        var linkURL = $('#link-url').val();
        var anchorText = $('#anchor-text').val();
        var linkLiveDate = $('#link-live-date').val();
        if (!requiredField('domain', 'Domain', domain)) { return; }
        //if (!requiredField('campaign', 'Campaign', campaignId)) { return; }
        if (!requiredField('campaign', 'Campaign', campaign)) { return; }
        if (!isValidURL('destination-url', 'Destination', destinationURL)) { return; }
        if (!isValidURL('link-url', 'Link', linkURL)) { return; }
        if (!requiredField('anchor-text', 'Anchor Text', anchorText)) { return; }
        if (!requiredField('link-live-date', 'Link Live Date', linkLiveDate)) { return; }
        var theData = {
            domain:         domain,
            campaign:       campaign,
            destinationURL: destinationURL,
            linkURL:        linkURL,
            anchorText:     anchorText,
            linkLiveDate:   linkLiveDate,
            linkType:       linkType, 
        };
        $('body').append('<div id="loading-container"><div class="loader"></div></div>');

        //check if this is a new link or edit link
        var postURL = "/slinky-links/links";
        if ( $('#LinkID').length ) {
            postURL = "/slinky-links/links/edit";
            theData.linkID = $('#LinkID').val();
            theData.domainID = $('#DomainID').val();
        }

        $.post(postURL, theData).done(function(data) {
            /*if ( $('#LinkID').length ) {
                window.location = "/slinky-links/links";
            } else {
                $('#loading-container').remove();
                updateLinksTable(theData, data.lastInsertLink.LinkID);
                console.log(data);
            }*/
            window.location = "/slinky-links/links/all";
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
        //startDate: '0d',
        autoclose: true
    });

    //put all the campaigns of this user to the campaigns drop down
    if (typeof allCampaigns !== 'undefined') {
        $.each(allCampaigns, function (i, item) {
            $('#campaign').append($('<option>', { 
                value: item.CampaignID,
                text : item.CampaignName 
            }));
        });
    }

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
    /*var allCampaignValues = allCampaigns.map(function(el) {
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
    });*/
    //autocomplete for users in filter links
    if (typeof all_users !== 'undefined') {
        var allUserValues = all_users.map(function(el) {
            var o = Object.assign({}, el);
            o.value = o.Username;
            return o;
        })
        $("#username").autocomplete({
            source: all_users,
            focus: function( event, ui ) {
                $( "#username" ).val( ui.item.Username );
                return false;
            },
            select: function(event, ui) {
                $("#username").val(ui.item.Username);
                //$("#campaign-id").val(ui.item.CampaignID);
                return false;
            },
            source: function(request, response) {
                var results = $.ui.autocomplete.filter(allUserValues, request.term);
                response(results.slice(0, 10));
            }
        });
    }
    
});

function deleteLink(tempLinkID) {
    if (confirm('Are you sure you want to delete this Link?')) {
        $('#link-'+tempLinkID).remove();
        $.get("/slinky-links/links/delete?LinkID="+tempLinkID).done(function(data) {
        }).fail(function(xhr, status, error) {
            alert("Something went wrong.");
        });
    }
}

function updateLinksTable(data, LinkID) {
    var tempTR = '';
    $('.links-data').last().remove();
    tempTR += '<tr class="links-data" id="link-'+LinkID+'">';
    tempTR += '<td>'+data.destinationURL+'</td>';
    tempTR += '<td>'+data.linkURL+'</td>';
    tempTR += '<td>'+data.anchorText+'</td>';
    tempTR += '<td class="text-center"><a class="btn btn-warning btn-xs" href="/slinky-links/links/edit?LinkID='+LinkID+'">Edit</a><button onClick="deleteLink('+LinkID+')" class="btn btn-danger btn-xs">Delete</button></td>';
    tempTR += '</tr>';
    $('#links-table').prepend(tempTR);
}