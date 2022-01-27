const express =require('express')
const { MongoClient, LEGAL_TCP_SOCKET_OPTIONS } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors=require('cors')
const app =express()

// port 
const port=process.env.PORT || 5000;


// middleware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwphj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      console.log('connect to database')
      const database = client.db("jobTask");
      const servicesCollection = database.collection("services");
      const adminCollection = database.collection("adminUserInfo");
        //   get api 
    app.get('/service',async(req,res)=>{
        const cursor = servicesCollection.find({});
        const servertest=await cursor.toArray();
        res.send(servertest)
    })
       //   get api 
    app.get('/services',async(req,res)=>{
        const cursor = servicesCollection.find({});
        const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();

            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products
            });
    })
    // post api
    app.post('/services', async (req, res) => {
        const service = req.body;
        console.log('hit the post api', service);

        const result = await servicesCollection.insertOne(service);
        console.log(result);
        res.json(result)
    });
   
  
    // delete 
    app.delete("/services/:id", async(req, res) => {
     
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await servicesCollection.deleteOne(query);
        res.json(result);
    })

    //    Admin handling 
app.post("/adminUserInfo", async (req, res) => {
    console.log("req.body");
    const result = await adminCollection.insertOne(req.body);
    res.send(result);
    
  });
  //  make admin

  app.put("/adminMaker", async (req, res) => {
    const filter = { email: req.body.email };
    const result = await adminCollection.find(filter).toArray();
    if (result) {
      const documents = await adminCollection.updateOne(filter, {
        $set: { role: "admin" },
      });
     
    }
    
  });
  app.get("/adminCheker/:email", async (req, res) => {
    const result = await adminCollection
      .find({ email: req.params.email })
      .toArray();
    console.log(result);
    res.send(result);
  });










    }
finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('welcome to Job Task webserver')
});
app.listen(port,()=>{
    console.log('server port',port)
})