/*
* File:         index.js
* Author:       Chris Repanich
* Date Created: Jan 10, 2016
*
* Brief Description: Index file for node.js web service
*
* Description: This file is the main functioning file of the web service. 
* It can create new collections depending on the url entered, and GET, POST, DELETE items in collections.
*/
var http = require('http'), express = require('express'), path = require('path');

MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
CollectionDriver = require('./collectionDriver').CollectionDriver;

var app = express();

app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.bodyParser());

var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("webappTest");  //E
  collectionDriver = new CollectionDriver(db); //F
});

app.use(express.static(path.join(__dirname, 'public')));

// collection
/*
* Gets all items from given collection
*/
app.get('/:collection', function(req, res) { //A
   var params = req.params; //B
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
          //Returns json so it can be parsed by apps
	          res.set('Content-Type','application/json'); //G
                  res.send(200, objs); //H
         }
   	});
});
 
// collection/entity
/*
* Gets JSON Object with matching ID in a given collection
*/ 
app.get('/:collection/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
        //returns error if ID does not exist
          if (error) { res.send(400, error); }
          //else it returns JSON Object
          else { res.send(200, objs); } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

//  collection/postNewItem
/*
* Posts a new item to a given collection
*/
app.post('/:collection/postNewItem', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
     });
});

// collection/updateItemById/entity
/*
* Updates object with matching id in a given collection
*/
app.put('/:collection/updateItemById/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send(400, error);
   }
});

// collection/deleteItemById/entity
/*
* Deletes object with matching id in a given collection
*/
app.delete('/:collection/deleteItemById/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.delete(collection, entity, function(err, objs) { //B
          res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" };
       res.send(400, error);
   }
});

app.use(function (req,res) { //1
    res.render('404', {url:req.url}); //2
});
//2 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
 