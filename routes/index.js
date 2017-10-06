var express = require('express');
var router = express.Router();

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

var add_limit = ' LIMIT 0,50'; //TODO remove this
var UserId = 37; //TODO remove this
router.get('/slinky-links', function(req, res, next) {
    var domains = [], campaigns = [];
    //connection.query('SELECT DomainID, HostName FROM Slinky_Domains_Test'+add_limit, function (err, domains, fields) {
        //if (err) { throw err; }
        connection.query('SELECT CampaignID, CampaignName FROM Slinky_Campaigns_Test WHERE Active=1 AND UserID=?', [UserId], function (err, campaigns, fields) {
            if (err) { throw err; }
            res.render('slinky-links', { title:'Slinky Links', domains:domains, campaigns:campaigns });
        });
    //});
});

/* {POST} slinky links. */
router.post('/slinky-links', function(req, res, next) {
    connection.query('SELECT LinkID FROM Slinky_Links_Test WHERE UserId=? AND DestinationURL=? AND LinkURL=?', [UserId, req.body.destinationURL, req.body.linkURL], function (err, links, fields) {
        if (err) { throw err; }
        if (links.length>0) { //duplicate destination and link URL from the same user
            res.send({'status':'DUPLICATE'});
            return;
        }
        connection.query('INSERT INTO Slinky_Domains_Test SET HostName = ?', [req.body.domain], function (err, savedDomain) {
            if (err) { throw err; }
            res.send({'status':'SAVED', 'DomainID':'savedDomain'});
        });
    });
});

module.exports = router;