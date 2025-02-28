import express from 'express';
import {configDotenv} from 'dotenv';
import mongoose from 'mongoose';
import path from 'path'; 
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();

const app = express();
const PORT  = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        // Check if collection exists and has documents
        Todo.countDocuments().then(count => {
            console.log(`Number of todos in database: ${count}`);
        });
    })
    .catch((err) => console.log(err.message));

// Current schema
const todoSchema = mongoose.Schema(
  {
    title: {type:String, required: true, unique : true, maxlength:20, minlength:3, trim: true},
    description: {type:String, required: true, maxlength:100, minlength:3, trim: true}, // Note: schema uses 'description'
  },
  {timestamps: true}
);

const Todo = mongoose.model('Todo', todoSchema);

app.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({}).lean(); // Add await and .lean()
    console.log('Fetched todos:', todos); // Debug log
    res.render('index', {title: 'List of Todos', todos: todos});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(error.message);
  }
});

app.get('/add-todo', (req, res) => {
  try {
    res.render('newTodo', {title: 'Add new Todo'});
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/update-todo/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    res.render('updateTodo', {title: 'Update Todo', todo});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});


app.get('/delete-todo/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

app.post('/add-todo', async (req, res) => {
  try {
    const {title, description} = req.body;  // Change 'desc' to 'description'
    const newTodo = new Todo({
      title,
      description
    });

    if(!title || !description){
      return res.status(400).json({message: 'Please enter all fields'});
    }
    await newTodo.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});