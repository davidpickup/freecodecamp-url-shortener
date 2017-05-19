var express = require('express');
var mongo = require('mongodb').MongoClient;
var process = require('process')

var app = express();

// var url = process.env.MONGOLAB_URL;
var url = 'mongodb://localhost:27017/sandbox';
console.log(url);

app.get('/:shorturl', function (req, res) {
  var shorturl = req.params.shorturl;
  console.log(shorturl);
  
  mongo.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      res.send({'shorturl': null});
    } else {
      console.log('Connection established to', url);
      
      var collection = db.collection('urls');
      var data = {'_id': shorturl};
      
      collection.find(data, {'_id':0, 'long':1}).toArray(function(e, documents){
        if (e) throw e;
        console.log(documents);
        if (documents.length > 0) {
          res.redirect(documents[0].long);
        } else {
          res.send('Error: Short URL not in database.');
        }
      });
      
      db.close();
    }
  });
});

app.get('/new/:longurl', function (req, res) {
    var longurl = req.params.longurl;
    console.log(longurl);
    // console.log(ValidURL(longurl));
    
    mongo.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        res.send({'shorturl': null});
      } else {
        console.log('Connection established to', url);

        // do some work here with the database.
        var collection = db.collection('urls');
        var data = {'long': longurl};
        
        collection.update(data, {$set:{'long':longurl}}, { upsert: true },
          function(e,d){
            if (e) throw e;
          });
        
        collection.find(data, {'_id':1}).toArray(function(e, documents){
          if (e) throw e;
          res.send({'shorturl': documents[0]._id});
        });
    
        //Close connection
        db.close();
      }
    });
});

app.listen(process.env.PORT || 5000, function () {
  console.log('Example app listening on port 8080!');
});