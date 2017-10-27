var express = require('express');
var router = express.Router();
var slinky_domains_table = 'Slinky_Domains_Test';
var slinky_links_table = 'Slinky_Links_Test';
var slinky_campaigns_table = 'Slinky_Campaigns_Test';

//TODO change this part
var add_limit = ' LIMIT 0,50'; //TODO remove this
var UserId = 37; //TODO remove this
var UserInitials = 'GFB'; //TODO Remove this

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
        connection.query('SELECT * FROM '+slinky_links_table+' WHERE Active=1 AND UserID=? ORDER BY LinkID DESC LIMIT 0,10', [UserId], function (err, links, fields) {
            if (err) { throw err; }
            res.render('slinky-links', { title:'Slinky Links', domains:domains, campaigns:campaigns, links:links });
        });
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
                    console.log(rootDomainResult);
                    connection.query('INSERT INTO '+slinky_domains_table+' (DomainID, RootDomainID, HostName) VALUES (?, ?, ?)', [(lastDomain[0].DomainID+1), rootDomainID, req.body.domain], function (err, result) {
                        if (err) { throw err; }
                    });
                });
                //insert record for Links table
                connection.query('SELECT LinkID FROM '+slinky_links_table+' ORDER BY LinkID DESC LIMIT 0,1', [], function (err, lastLink, fields) {
                    if (err) { throw err; }
                    if (lastLink.length == 1) {
                        connection.query('INSERT INTO '+slinky_links_table+' (LinkID, UserID, DomainID, CampaignID, LinkTypeID, DestinationURL, AnchorText, LinkURL, TheDateTime, LinkLiveDate, Active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)', [(lastLink[0].LinkID+1), UserId, (lastDomain[0].DomainID+1), req.body.campaign, req.body.linkType, req.body.destinationURL, req.body.anchorText, req.body.linkURL, new Date(), req.body.linkLiveDate], function (err, result) {
                            if (err) { throw err; }
                            connection.query('SELECT * FROM '+slinky_links_table+' WHERE UserID=? ORDER BY LinkID DESC LIMIT 0,1', [UserId], function (err, lastInsertLink, fields) {
                                if (err) { throw err; }
                                res.send({'status':'LINK INSERTED', 'lastInsertLink':lastInsertLink[0]});
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
        //delete record from links table
        connection.query('DELETE FROM '+slinky_links_table+' WHERE LinkID=?', [req.query.LinkID], function (err, campaigns, fields) {
            if (err) { throw err; }
        });
        //delete record from domains table
        connection.query('DELETE FROM '+slinky_domains_table+' WHERE DomainID=?', [links[0].DomainID], function (err, campaigns, fields) {
            if (err) { throw err; }
        });
        res.send({'status':'LINK AND DOMAIN DELETED'});
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