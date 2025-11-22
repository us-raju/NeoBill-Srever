const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.port || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crlszhi.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    const database = client.db("neobill_user");
    const billsCollection = database.collection("bills");
    const payBillCollection = database.collection("pay-bills");

    // database related apis here
    app.get("/bills", async (req, res) => {
      const result = await billsCollection.find().toArray();
      res.send(result);
    });

    // limited bill fetch from database
    app.get("/bills-limit", async (req, res) => {
      const limitNum = 6;
      const result = await billsCollection.find().limit(limitNum).toArray();
      res.send(result);
    });

    // bills details page data with id
    app.get("/bills-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await billsCollection.findOne(query);
      res.send(result);
    });

    // receive pay bill data from clint and send database
    app.post("/pay-bills", async (req, res) => {
      const newBills = req.body;
      const result = await payBillCollection.insertOne(newBills);
      res.send(result);
    });

    app.get("/pay-bills", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await payBillCollection.find(query).toArray();
      res.send(result);
    });

    // update pay bills data functionlity here

    app.patch("/pay-bills/:id", async (req, res) => {
      const id = req.params.id;
      const upDateBill = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          amount: upDateBill.amount,
          address: upDateBill.address,
          phone: upDateBill.phone,
          date: upDateBill.date,
        },
      };
      const result = await payBillCollection.updateOne(query, update);
      res.send(result);
    });

    // delete pay bills data functionlity here

    app.delete("/pay-bills/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await payBillCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`this server is running is port: ${port}`);
});
