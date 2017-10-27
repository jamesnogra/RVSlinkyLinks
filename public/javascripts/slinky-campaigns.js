var selectedCampaignID = -1;
var theData;

$(document).ready(function() {

    $('#reset-btn').click(function() {
        $('#website').val('');
        $('#name').val('');
    });

    $('#submit-btn').click(function() {
        var website = $('#website').val();
        var name = $('#name').val();
        if (!requiredField('website', 'Website', website)) { return; }
        if (!requiredField('name', 'Name', name)) { return; }
        theData = {
            website:  website,
            name:     name,
        };
        $('body').append('<div id="loading-container"><div class="loader"></div></div>');
        $.post("/slinky-links/campaigns", theData).done(function(data) {
            $('#save-campaign-dialog').dialog('open');
            $('#save-campaign-content').html(UserInitials + "|" + data.lastInsertCampaign['CampaignID'] + "|" + theData.website + "|" + theData.name);
            selectedCampaignID = data.lastInsertCampaign['CampaignID'];
            console.log(data);
        }).fail(function(xhr, status, error) {
            alert("Something went wrong.");
            $('#loading-container').remove();
        });
    });

    $(document).ready(function() {
        $('#save-campaign-dialog').dialog();
        $('#save-campaign-dialog').dialog('close');
    });

    $('#save-campaign-button').click(function() {
        $('#save-campaign-dialog').dialog('close');
        $('#loading-container').remove();
        updateLinksTable(theData, selectedCampaignID);
    });

    $('#dont-save-campaign-button').click(function() {
        $('#save-campaign-dialog').dialog('close');
        $.get("/slinky-links/campaigns/delete?CampaignID="+selectedCampaignID).done(function(data) {
            $('#loading-container').remove();
        }).fail(function(xhr, status, error) {
            alert("Something went wrong.");
            $('#loading-container').remove();
        });
    });

});

function deleteCampaign(tempCampaignID) {
    if (confirm('Are you sure you want to delete this Campaign?')) {
        $('#campaign-'+tempCampaignID).remove();
        $.get("/slinky-links/campaigns/delete?CampaignID="+tempCampaignID).done(function(data) {
        }).fail(function(xhr, status, error) {
            alert("Something went wrong.");
        });
    }
}

function updateLinksTable(data, CampaignID) {
    var tempTR = '';
    $('.campaigns-data').last().remove();
    tempTR += '<tr class="campaigns-data" id="campaign-'+CampaignID+'">';
    tempTR += '<td>'+data.name+'</td>';
    tempTR += '<td class="text-center"><a class="btn btn-warning btn-xs" href="/slinky-links/campaigns/edit?CampaignID='+CampaignID+'">Edit</a><button class="btn btn-danger btn-xs" onClick="deleteCampaign('+CampaignID+')">Delete</button></td>';
    tempTR += '</tr>';
    $('#campaigns-table').prepend(tempTR);
}

function requiredField(id, label, val) {
    if (val.length==0) {
        alert(label + ' is a required field.');
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