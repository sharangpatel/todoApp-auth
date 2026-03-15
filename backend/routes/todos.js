
import express from 'express'
import Todo from '../models/Todo.js'

const todoRouter = express.Router()

todoRouter.get('/',async(req,res)=>{   //to get all todos
try {
    // req.user is attached by authMiddleware
    // Find all todos where userId matches the logged-in user
    // Sort by createdAt descending (newest first)
    const todos = await Todo.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    // Send todos array as JSON response
    res.json(todos);
  } catch (error) {
    // If anything goes wrong, send 500 error
    res.status(500).json({ message: error.message });
  }
})

todoRouter.post('/',async(req,res)=>{    //to create a todo
try {
    // Extract description from request body
    const { description } = req.body;
    
    // Validate: description must exist and not be empty
    if (!description || description.trim() === '') {
      return res.status(400).json({ 
        message: 'Description is required' 
      });
    }

    // Create new todo in database
    const todo = await Todo.create({
      description: description.trim(), // Remove extra spaces
      userId: req.user._id,           // From authMiddleware
      done: false                      // Default value
    });

    // Send back the created todo with 201 status (created)
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

todoRouter.put('/:id',async(req,res)=>{  //to update the todo
try {
    // Get todo ID from URL parameters
    const { id } = req.params;
    
    // Get fields to update from request body
    const { description, done } = req.body;

    // Find the todo AND make sure it belongs to the logged-in user
    const todo = await Todo.findOne({ 
      _id: id, 
      userId: req.user._id
    });

    // If todo doesn't exist or doesn't belong to user
    if (!todo) {
      return res.status(404).json({ 
        message: 'Todo not found' 
      });
    }

    // Update only the fields that were provided
    if (description !== undefined) {
      todo.description = description.trim();
    }
    if (done !== undefined) {
      todo.done = done;
    }

    // Save the updated todo
    await todo.save();
    
    // Send back the updated todo
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

todoRouter.delete('/:id',async(req,res)=>{   //to delete a todo
try {
    // Get todo ID from URL parameters
    const { id } = req.params;

    // Find and delete the todo, but only if it belongs to the user
    const todo = await Todo.findOneAndDelete({ 
      _id: id, 
      userId: req.user._id 
    });

    // If todo doesn't exist or doesn't belong to user
    if (!todo) {
      return res.status(404).json({ 
        message: 'Todo not found' 
      });
    }

    // Send success message with deleted todo
    res.json({ 
      message: 'Todo deleted successfully', 
      todo 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})


export default todoRouter;