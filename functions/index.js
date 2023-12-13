const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors({ origin: true }));

const db = admin.firestore();

// Routes
app.get("/hello-world", (req, res) => {
  return res.status(200).send("Hello World!");
});

// Create
app.post("/create", (req, res) => {
  (async () => {
    try {
      db.collection("products")
        .doc("/" + req.body.id + "/")
        .create({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
        });

      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  })();
});

// Read
app.get("/api/read/:id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("products").doc(req.params.id);
      const product = await document.get();

      const response = product.data();

      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  })();
});

// Read All
app.get("/api/read/", (req, res) => {
  (async () => {
    try {
      const query = db.collection("products");
      const response = [];

      await query.get().then((QuerySnapshot) => {
        const docs = QuerySnapshot.docs;

        for (const doc of docs) {
          const selectedItem = {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            price: doc.data().price,
          };
          response.push(selectedItem);
        }

        return response;
      });

      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  })();
});

// Update
app.put("/api/update/:id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("products").doc(req.params.id);

      await document.update({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });

      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  })();
});
// Delete
app.delete("/api/delete/:id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("products").doc(req.params.id);

      await document.delete();

      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  })();
});

exports.app = functions.https.onRequest(app);
