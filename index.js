const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs-extra')
const MongoClient = require('mongodb').MongoClient
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('images'))
app.use(fileUpload())
require('dotenv').config()

// MONGO SETUP
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mx72a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

client.connect(err => {
    const serviceCollection = client.db(process.env.DB_NAME).collection('services')
    const reviewsCollection = client.db(process.env.DB_NAME).collection('reviews')
    const orderCollection = client.db(process.env.DB_NAME).collection('order')
    const adminsCollection = client.db(process.env.DB_NAME).collection('admins')
        
    app.post('/addService',(req,res)=>{
        const file = req.files.image
        const title = req.body.title
        const description = req.body.description
        const encImg = file.data.toString('base64')
        const image = {
            ext: file.mimetype,
            size: file.size,
            name: Buffer.from(encImg,'base64')
        }
        serviceCollection.insertOne({title, description, image})
        .then(result =>{ 
                res.send(result.insertedCount>0 )
        })                
    })

    app.get('/allServices',(req,res)=>{
        serviceCollection.find({}).limit(4)
        .toArray((err,document)=>{
            res.send(document)
        })
    })

    app.post('/addReview',(req,res)=>{
        const file = req.files.image
        const name = req.body.name
        const company = req.body.company
        const review = req.body.review
        const encImg = file.data.toString('base64')
        const image = {
            ext: file.mimetype,
            size: file.size,
            name: Buffer.from(encImg,'base64')
        }
        reviewsCollection.insertOne({name, company, review, image})
        .then(result =>{ 
                res.send(result.insertedCount>0 )
        })                
    })

    app.post('/addOrder',(req,res)=>{
        const title = req.body.title        
        const description = req.body.description        
        const image = req.body.image        
        const name = req.body.name        
        const email = req.body.email        
        const price = req.body.price
        const status = 'pending'        
        orderCollection.insertOne({title, description, image, name, email, price, status})
        .then(result =>{ 
                res.send(result.insertedCount>0 )
        })                
    })

    app.get('/allOrder',(req,res)=>{
        orderCollection.find({})
        .toArray((err,document)=>{
            res.send(document)
        })
    })

    app.get('/allReviews',(req,res)=>{
        reviewsCollection.find({}).limit(4)
        .toArray((err,document)=>{
            res.send(document)
        })
    })

    app.get('/selectedService/:id',(req,res)=>{
        serviceCollection.find({_id:ObjectId(req.params.id)})
        .toArray((err,document)=>{
            res.send(document[0])
        })
    })

    app.patch("/updateStatus/:id",(req,res)=>{
            orderCollection.updateOne({_id:ObjectId(req.params.id)},
                {$set:{status:req.body.updatedStatus}})
                .then(result=>res.send(result.matchedCount>0))
        })

    app.post('/makeAdmin',(req,res)=>{     
        const email = req.body.email   
        adminsCollection.insertOne({email:email})
        .then(result =>{ 
                res.send(result.insertedCount>0 )
        })                
    })

    app.get('/findAdmin/:email',(req,res)=>{
        adminsCollection.find({email:req.params.email})
        .toArray((err,document)=>{
            res.send(document.length>0)
        })
    })


})


app.get('/',(req,res)=> res.send("WElcome Programmer"))
app.listen(port)
