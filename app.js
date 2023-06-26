const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Connection URL
const url = 'mongodb+srv://minhtriet2305:Minhtriet23052003Z@st3ve.73wx2lr.mongodb.net/';
// Database Name
const dbName = 'toy-store';
// Collection Name
const collectionName = 'toys';

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

let toysCollection;

// Connect to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }
  console.log('Connected to MongoDB successfully');
  const db = client.db(dbName);
  toysCollection = db.collection(collectionName);
});

// Create a storage configuration for multer
const storage = multer.diskStorage({
  destination: './public/images',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Create a multer instance with the storage configuration
const upload = multer({ storage }).single('image');

// Get all toys
app.get('/toys', (req, res) => {
  toysCollection
    .find()
    .toArray()
    .then((toys) => {
      res.json(toys);
    })
    .catch((error) => {
      console.error('Error fetching toys:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get a single toy
app.get('/toys/:id', (req, res) => {
  const id = req.params.id;
  toysCollection
    .findOne({ _id: ObjectId(id) })
    .then((toy) => {
      if (toy) {
        res.json(toy);
      } else {
        res.status(404).json({ error: 'Toy not found.' });
      }
    })
    .catch((error) => {
      console.error('Error fetching toy:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Create a new toy
app.post('/toys', (req, res) => {
  upload(req, res, (error) => {
    if (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const toy = req.body;
      toy.image = req.file ? req.file.filename : ''; // Save the uploaded image filename to the toy object

      toysCollection
        .insertOne(toy)
        .then(() => {
          res.status(201).json({ message: 'Toy created successfully.' });
        })
        .catch((error) => {
          console.error('Error creating toy:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    }
  });
});

// Update a toy
app.put('/toys/:id', (req, res) => {
  const id = req.params.id;
  const updatedToy = req.body;
  toysCollection
    .findOne({ _id: ObjectId(id) })
    .then((toy) => {
      if (toy) {
        toysCollection
          .updateOne({ _id: ObjectId(id) }, { $set: updatedToy })
          .then(() => {
            res.json({ message: 'Toy updated successfully.' });
          })
          .catch((error) => {
            console.error('Error updating toy:', error);
            res.status(500).json({ error: 'Internal server error' });
          });
      } else {
        res.status(404).json({ error: 'Toy not found.' });
      }
    })
    .catch((error) => {
      console.error('Error fetching toy:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Delete a toy
app.delete('/toys/:id', (req, res) => {
  const id = req.params.id;
  toysCollection
    .findOne({ _id: ObjectId(id) })
    .then((toy) => {
      if (toy) {
        toysCollection
          .deleteOne({ _id: ObjectId(id) })
          .then(() => {
            res.json({ message: 'Toy deleted successfully.' });
          })
          .catch((error) => {
            console.error('Error deleting toy:', error);
            res.status(500).json({ error: 'Internal server error' });
          });
      } else {
        res.status(404).json({ error: 'Toy not found.' });
      }
    })
    .catch((error) => {
      console.error('Error fetching toy:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
