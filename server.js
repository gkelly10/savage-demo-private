const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true";
const dbName = "demo";

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {//default route is '/'
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})//renders index.ejs. you're telling the computer what to show the user when they open the app
  // console.log('GET ROUTE IN SERVER.JS', messages.likes)
  })
})

app.post('/messages', (req, res) => {
  db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, likes: 0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    console.log('THIS IS IN SERVER.JS', req.body.likes)
    res.redirect('/')
  })
})

app.put('/thumbUp', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      likes:req.body.likes + 1 //the req stands for request
      //req. body is a js object that represent the actual rquets that the user is making (clicking thumbs up)
      //when the req.body is accssed it has properties (ex.: name, message, likes), in this case the property was thumbsUp, but now it has been changed to likes
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.put('/thumbDown', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      likes:req.body.likes > 0 ? req.body.likes - 1 : 0 //is the total number of thumbsDwon is  0 or less than 0 then ste it to 0 bcs it doesnt make sense to have a negaive number of likes | but if it is it's okay to subtract one 
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
// app.put('/messages', (req, res) => {
//   db.collection('messages')
//   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
//     $set: {
//       thumbDown:req.body.thumbDown - 1
//     } 
//   })
//   })
