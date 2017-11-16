var express = require('express');
var router = express.Router();
var slinky_domains_table = 'Slinky_Domains_Test';
var slinky_links_table = 'Slinky_Links_Test';
var slinky_campaigns_table = 'Slinky_Campaigns_Test';
var slinky_user_table = 'Slinky_User_Test';

//TODO change this part
var add_limit = ' LIMIT 0,50'; //TODO remove this
var UserId = 29; //TODO remove this //this is the logged in user
var UserInitials = 'GFB'; //TODO Remove this

//for the moz.com api
var crypto = require('crypto');
var request = require('request');
var expires = Math.floor((Date.now() / 1000)) + 300; //in seconds.
var accessId = 'mozscape-15c032bb32';
var secretKey = '404ecf4b3531043a069cbba070368e92';
var cols = 1+16384+67108864+68719476736;
var signature = encodeURIComponent(crypto.createHmac('sha1', secretKey).update(accessId + "\n" + expires).digest('base64'));
var url =  "http://lsapi.seomoz.com/linkscape/url-metrics/?Cols=" +  cols + "&AccessID=" + accessId + "&Expires=" + expires + "&Signature=" + signature;

//for date formatting in the all links page
var moment = require('moment');

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'rvseo-dev.clo27q8t7swh.us-east-1.rds.amazonaws.com',
  user     : 'rvseodev837',
  password : 'Siqok28lai21qn2xC',
  database : 'DATA'
});

/* HOME */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* ADD LINKS */
router.get('/slinky-links/links', function(req, res, next) {
    var domains = [], campaigns = [];
    connection.query('SELECT CampaignID, CampaignName FROM '+slinky_campaigns_table+' WHERE Active=1 AND UserID=? ORDER BY CampaignName', [UserId], function (err, campaigns, fields) {
        if (err) { throw err; }
        res.render('slinky-links', { title:'Slinky Links', domains:domains, campaigns:campaigns });
    });
});

/* {POST} slinky links. */
router.post('/slinky-links/links', function(req, res, next) {
    connection.query('SELECT LinkID FROM Slinky_Links_Test WHERE UserId=? AND DestinationURL=? AND LinkURL=?', [UserId, req.body.destinationURL, req.body.linkURL], function (err, links, fields) {
        if (err) { throw err; }
        if (links.length>0) { //duplicate destination and link URL from the same user
            res.send({'status':'DUPLICATE'});
            return;
        }
        connection.query('SELECT DomainID FROM '+slinky_domains_table+' ORDER BY DomainID DESC LIMIT 0,1', [], function (err, lastDomain, fields) {
            if (err) { throw err; }
            if (lastDomain.length == 1) {
                //insert record for Domains table
                rootDomain = req.body.domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
                connection.query('SELECT DomainID FROM '+slinky_domains_table+' WHERE HostName=? OR HostName="www.'+rootDomain+'" LIMIT 0,1', [rootDomain], function (err, rootDomainResult, fields) {
                    rootDomainID = null;
                    if (rootDomainResult.length==1) {
                        rootDomainID = rootDomainResult[0].DomainID;
                    }
                    //console.log(rootDomainResult);
                    connection.query('INSERT INTO '+slinky_domains_table+' (DomainID, RootDomainID, HostName) VALUES (?, ?, ?)', [(lastDomain[0].DomainID+1), rootDomainID, req.body.domain], function (err, result) {
                        if (err) { throw err; }
                    });
                });
                //insert record for Links table
                connection.query('SELECT LinkID FROM '+slinky_links_table+' ORDER BY LinkID DESC LIMIT 0,1', [], function (err, lastLink, fields) {
                    if (err) { throw err; }
                    if (lastLink.length == 1) {
                        request({ url:url, method:'POST', json:true, body:[req.body.linkURL] }, function(err, response){
                            if(err){ console.log(err); return; }
                            //console.log(response.body[0]);
                            connection.query('INSERT INTO '+slinky_links_table+' (LinkID, UserID, DomainID, CampaignID, LinkTypeID, DestinationURL, AnchorText, LinkURL, TheDateTime, LinkLiveDate, DomainAuthority, SpamScore, PageRank, PageTitle, Active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)', [(lastLink[0].LinkID+1), UserId, (lastDomain[0].DomainID+1), req.body.campaign, req.body.linkType, req.body.destinationURL, req.body.anchorText, req.body.linkURL, new Date(), req.body.linkLiveDate, response.body[0].pda, response.body[0].fspsc, response.body[0].umrp, response.body[0].ut], function (err, result) {
                                if (err) { throw err; }
                                connection.query('SELECT * FROM '+slinky_links_table+' WHERE UserID=? ORDER BY LinkID DESC LIMIT 0,1', [UserId], function (err, lastInsertLink, fields) {
                                    if (err) { throw err; }
                                    res.send({'status':'LINK INSERTED', 'lastInsertLink':lastInsertLink[0]});
                                });
                            });
                        });
                    }
                });
            }
        });
    });
});

/* DELETE LINKS */
router.get('/slinky-links/links/delete', function(req, res, next) {
    //get first the corresponding domain
    connection.query('SELECT DomainID FROM '+slinky_links_table+' WHERE LinkID=? LIMIT 0,1', [req.query.LinkID], function (err, links, fields) {
        if (err) { throw err; }
        /*//delete record from links table
        connection.query('DELETE FROM '+slinky_links_table+' WHERE LinkID=?', [req.query.LinkID], function (err, campaigns, fields) {
            if (err) { throw err; }
        });
        //delete record from domains table
        connection.query('DELETE FROM '+slinky_domains_table+' WHERE DomainID=?', [links[0].DomainID], function (err, campaigns, fields) {
            if (err) { throw err; }
        });*/
        connection.query('UPDATE '+slinky_links_table+' SET Active=2 WHERE LinkID=?', [req.query.LinkID], function (err, campaigns, fields) {
            if (err) { throw err; }
        });
        res.send({'status':'LINK AND DOMAIN DELETED'});
    });
});

/* ALL LINKS */
router.get('/slinky-links/links/all', function(req, res, next) {
    var hostname = (typeof req.query.hostname!=='undefined') ? (req.query.hostname.length>0?req.query.hostname:'') : '';
    var destination_url = (typeof req.query.destination_url!=='undefined') ? (req.query.destination_url.length>0?req.query.destination_url:'') : '';
    var username = (typeof req.query.username!=='undefined') ? (req.query.username.length>0?req.query.username:'') : '';
    var link_url = (typeof req.query.link_url!=='undefined') ? (req.query.link_url.length>0?req.query.link_url:'') : '';
    var campaign = (typeof req.query.campaign!=='undefined') ? (req.query.campaign.length>0?req.query.campaign:'') : '';
    var link_type = (typeof req.query.link_type!=='undefined') ? (req.query.link_type.length>0?req.query.link_type:'') : '';
    var link_type_query = '';
    if (link_type.length>0) {
        link_type_query = 'LinkTypeID='+link_type+' AND';
    }
    var anchor_text = (typeof req.query.anchor_text!=='undefined') ? (req.query.anchor_text.length>0?req.query.anchor_text:'') : '';
    var link_live_date_start = (typeof req.query.link_live_date_start!=='undefined') ? (req.query.link_live_date_start.length>0?req.query.link_live_date_start:'') : '';
    var link_live_date_end = (typeof req.query.link_live_date_end!=='undefined') ? (req.query.link_live_date_end.length>0?req.query.link_live_date_end:'') : '';
    var between_date = '';
    if (link_live_date_start.length>0 && link_live_date_end.length>0) {
        between_date = 'AND (LinkLiveDate BETWEEN "'+link_live_date_start+'" AND "'+link_live_date_end+'")';
    }
    var domain_authority = (typeof req.query.domain_authority!=='undefined') ? (req.query.domain_authority.length>0?req.query.domain_authority:'') : '';
    var between_domain_authority = '';
    if (domain_authority.length>0) {
        between_domain_authority = 'AND (DomainAuthority>'+(+domain_authority-5)+' AND DomainAuthority<'+(+domain_authority+5)+')';
    }
    var spam_score = (typeof req.query.spam_score!=='undefined') ? (req.query.spam_score.length>0?req.query.spam_score:'') : '';
    var page_rank = (typeof req.query.page_rank!=='undefined') ? (req.query.page_rank.length>0?req.query.page_rank:'') : '';
    var between_page_rank = '';
    if (page_rank.length>0) {
        between_page_rank = 'AND (PageRank>'+(+page_rank-0.5)+' AND PageRank<'+(+page_rank+0.5)+')';
    }
    var title = (typeof req.query.title!=='undefined') ? (req.query.title.length>0?req.query.title:'') : '';
    var selected_filters = {
        hostname:               hostname,
        destination_url:        destination_url,
        username:               username,
        link_url:               link_url,
        campaign:               campaign,
        link_type:              link_type,
        anchor_text:            anchor_text,
        link_live_date_start:   link_live_date_start,
        link_live_date_end:     link_live_date_end,
        domain_authority:       domain_authority,
        spam_score:             spam_score,
        page_rank:              page_rank,
        title:                  title
    };
    var username = (typeof req.query.username!=='undefined') ? (req.query.username.length>0?req.query.username:'') : '';
    var username_where = '';
    if (username.length>0) {
        username_where = 'WHERE Username="'+username+'"';
    }
    connection.query('SELECT UserID FROM '+slinky_user_table+' '+username_where, function (err, selected_user, fields) {
        if (err) { throw err; }
        var filter_user_by_id = '';
        var selected_user_id = '';
        if (selected_user.length==1) {
            filter_user_by_id = slinky_links_table+'.UserID=' + selected_user[0].UserID + ' AND ';
            selected_user_id = selected_user[0].UserID;
        }
        connection.query('SELECT * FROM '+slinky_links_table+' LEFT JOIN '+slinky_domains_table+' ON '+slinky_links_table+'.DomainID='+slinky_domains_table+'.DomainID LEFT JOIN '+slinky_campaigns_table+' ON '+slinky_links_table+'.CampaignID='+slinky_campaigns_table+'.CampaignID LEFT JOIN '+slinky_user_table+' ON '+slinky_links_table+'.UserID='+slinky_user_table+'.UserID WHERE '+slinky_links_table+'.Active=1 AND '+filter_user_by_id+' HostName LIKE ? AND DestinationURL LIKE ? AND LinkURL LIKE ? AND '+link_type_query+' AnchorText LIKE ? '+between_date+' '+between_domain_authority+' AND SpamScore LIKE ? '+between_page_rank+' AND PageTitle LIKE ? AND '+slinky_campaigns_table+'.CampaignName LIKE ? ORDER BY LinkID DESC ' + add_limit, ['%'+hostname+'%', '%'+destination_url+'%', '%'+link_url+'%', '%'+anchor_text+'%', '%'+spam_score+'%', '%'+title+'%', '%'+campaign+'%'], function (err, links, fields) {
            if (err) { throw err; }
            connection.query('SELECT UserID, Username FROM ' + slinky_user_table, function (err, users, fields) {
                if (err) { throw err; }
                res.render('slinky-links-all', { title:'Slinky Links All', links:links, users:users, moment:moment, selected_filters:selected_filters, selected_user_id:selected_user_id, UserId:UserId });
            });
        });
    });
});

/* ALL LINKS */
router.get('/slinky-links/links/moz', function(req, res, next) {
    request({ url:url, method:'POST', json:true, body:['http://www.pokemongomap.info/'] }, function(err, response){
        if(err){ console.log(err); return; }
        res.send(response.body);
    });
});

/* EDIT VIEW LINKS */
router.get('/slinky-links/links/edit', function(req, res, next) {
    connection.query('SELECT CampaignID, CampaignName FROM '+slinky_campaigns_table+' WHERE Active=1 AND UserID=? ORDER BY CampaignName', [UserId], function (err, campaigns, fields) {
        if (err) { throw err; }
        connection.query('SELECT '+slinky_domains_table+'.DomainID, '+slinky_domains_table+'.HostName, '+slinky_links_table+'.LinkID, '+slinky_links_table+'.DestinationURL, '+slinky_links_table+'.LinkURL, '+slinky_links_table+'.CampaignID, '+slinky_links_table+'.LinkTypeID, '+slinky_links_table+'.AnchorText, '+slinky_links_table+'.LinkLiveDate FROM `'+slinky_domains_table+'` LEFT JOIN '+slinky_links_table+' ON '+slinky_links_table+'.DomainID = '+slinky_domains_table+'.DomainID WHERE '+slinky_links_table+'.LinkID=? LIMIT 0,1', [req.query.LinkID], function (err, result, fields) {
            if (err) { throw err; }
            res.render('slinky-campaigns-edit', { title:'Slinky Links', result:result[0], campaigns:campaigns });
        });
    });
});

/* EDIT POST LINKS */
router.post('/slinky-links/links/edit', function(req, res, next) {
    //update first the domain
    connection.query('UPDATE '+slinky_domains_table+' SET HostName=? WHERE DomainID=?', [req.body.domain, req.body.domainID], function (err, results, fields) {
        if (err) { throw err; }
    });
    connection.query('UPDATE '+slinky_links_table+' SET CampaignID=?, LinkTypeID=?, DestinationURL=?, AnchorText=?, LinkURL=?, LinkLiveDate=? WHERE LinkID=?', [req.body.campaign, req.body.linkType, req.body.destinationURL, req.body.anchorText, req.body.linkURL, req.body.linkLiveDate, req.body.linkID], function (err, results, fields) {
        if (err) { throw err; }
    });
    res.send({'status':'LINK AND DOMAIN EDITED'});
});

/* ADD CAMPAIGNS */
router.get('/slinky-links/campaigns', function(req, res, next) {
    connection.query('SELECT CampaignID, CampaignName FROM '+slinky_campaigns_table+' WHERE Active=1 AND UserID=? ORDER BY CampaignID DESC LIMIT 0,10', [UserId], function (err, campaigns, fields) {
        if (err) { throw err; }
        res.render('slinky-campaigns', { title:'Slinky Links', campaigns:campaigns, UserInitials:UserInitials });
    });
});

/* POST ADD CAMAIGNS */
router.post('/slinky-links/campaigns', function(req, res, next) {
    connection.query('SELECT CampaignID FROM '+slinky_campaigns_table+' ORDER BY CampaignID DESC LIMIT 0,1', [UserId], function (err, lastCampaign, fields) {
        if (err) { throw err; }
        connection.query('INSERT INTO '+slinky_campaigns_table+' (CampaignID, CampaignName, CreatedDate, Active, UserID) VALUES (?, ?, ?, 1, ?)', [(lastCampaign[0].CampaignID+1), req.body.name, new Date(), UserId], function (err, lastCampaign, fields) {
            if (err) { throw err; }
            connection.query('SELECT * FROM '+slinky_campaigns_table+' WHERE UserID=? ORDER BY CampaignID DESC LIMIT 0,1', [UserId], function (err, lastInsertCampaign, fields) {
                if (err) { throw err; }
                res.send({'status':'CAMPAIGN INSERTED', 'lastInsertCampaign':lastInsertCampaign[0]});
            });
        });
    });
});

/* DELETE CAMPAIGNS */
router.get('/slinky-links/campaigns/delete', function(req, res, next) {
    connection.query('DELETE FROM '+slinky_campaigns_table+' WHERE CampaignID=?', [req.query.CampaignID], function (err, campaigns, fields) {
        if (err) { throw err; }
        res.send({'status':'CAMPAIGN DELETED'});
    });
});

module.exports = router;