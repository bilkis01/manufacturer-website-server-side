const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const query = require('express/lib/middleware/query');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rmea.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const toolCollection = client.db("manufacturer_website").collection("tools");
    const orderCollection = client.db("manufacturer_website").collection("orders");
    const userCollection = client.db("manufacturer_website").collection("users");
    const adminCollection = client.db("manufacturer_website").collection("admins");
    const addCollection = client.db("manufacturer_website").collection("addsorder");

    // get all tools api
    app.get('/tools', async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query)
      const tool = await cursor.toArray();
      res.send(tool);
    })


    // // payment stripe account api 
    // app.post('/create-payment-intent', async (req, res) => {
    //   const service = req.body;
    //   const price = service.price;
    //   const amount = price * 100;
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount: amount,
    //     currency: 'usd',
    //     payment_method_types: ['card']
    //   });
    //   res.send({ clientSecret: paymentIntent.client_secret })
    // });



    //  All user information dashboard api
    app.get('/myorder', async (req, res) => {
      const buyerEmail = req.query.email;
      const cursor = orderCollection.find({ buyerEmail });
      const order = await cursor.toArray();
      res.send(order);
    })
    //  All user information dashboard api
    app.get('/allorder', async (req, res) => {
     
      const cursor = orderCollection.find({});
      const order = await cursor.toArray();
      res.send(order);
    })

    // user update
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options)
      // const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
      res.send(result);
      console.log(result)

    })

    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email
      const cursor = userCollection.find({ email: email });
      const result = await cursor.toArray();
      res.send(result)
      console.log(result)

    })

    //make admin user
    app.put("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const makeAdmin = req.body;
      console.log(makeAdmin)
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          ...makeAdmin,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send({ success: "make admin succes" });
      console.log(result)
    });


    // get tools by id

    app.get('/tools/:id', async (req, res) => {
      const id = req.params.id
      const singleToool = await toolCollection.findOne({ _id: ObjectId(id) })
      res.send(singleToool)
      console.log(`inside ${id}`)
    })

    // user all information in dashboard
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);

    })
    app.delete("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await carCollections.deleteOne({ email: email });
      res.send({ delete: "success" });
    });

    // order 
    app.post('/orders', async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      console.log(result)
      res.send(result)
    })

    // get all products orders data
    app.get('/addsorder', async (req, res) => {
      const manageOrder = await addCollection.find().toArray();
      res.send(manageOrder);

    })

    // add orders
    app.post('/tools', async (req, res) => {
      const tool = req.body;
      const result = await toolCollection.insertOne(tool);
      console.log(result)
      res.send(result)
    })

    // manage order delete
    app.delete("/allorder/:id", async (req, res) => {
     const id = req.params.id
      const result = await orderCollection.deleteOne({ _id: ObjectId(id)});
      res.send({ delete: "success" });
      console.log(result);
    });


    app.delete("/tools/:id", async (req, res) => {
     const id = req.params.id
      const result = await toolCollection.deleteOne({ _id: ObjectId(id)});
      res.send({ delete: "success" });
      console.log(result);
    });



    // payment api

    app.get('/myorder/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      // console.log(result)
      res.send(order)
    })


    // manage orders
    app.get('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.send(order)
    })



   

  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(port, () => {
  console.log(`app listening port ${port}`)
})