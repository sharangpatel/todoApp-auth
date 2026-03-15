import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/todos');
      setTodos(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load todos. Please try again.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post('/api/todos', {
        description: newDescription.trim(),
      });
      setTodos([response.data, ...todos]);
      setNewDescription('');
      setError('');
    } catch (err) {
      setError('Failed to create todo. Please try again.');
      console.error('Error creating todo:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleDone = async (id, currentDone) => {
    try {
      const response = await api.put(`/api/todos/${id}`, {
        done: !currentDone,
      });
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await api.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error('Error deleting todo:', err);
    }
  };

  const handleUpdateDescription = async (id, newDesc) => {
    if (!newDesc.trim()) return;

    try {
      const response = await api.put(`/api/todos/${id}`, {
        description: newDesc.trim(),
      });
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-lg">Loading todos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">My Todos</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Todo Form */}
      <form onSubmit={handleCreateTodo} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a new todo..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding...' : 'Add Todo'}
          </button>
        </div>
      </form>

      {/* Todo List */}
      {todos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No todos yet. Create one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo._id}
              className={`flex items-center gap-3 p-1 bg-white text-blue-800 border rounded-lg shadow-sm ${
                todo.done ? 'opacity-60' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggleDone(todo._id, todo.done)}
                className="w-5 h-5 cursor-pointer"
              />

              {todo.done ? (
                <span className="flex-1 line-through text-gray-500">
                  {todo.description}
                </span>
              ) : (
                <input
                  type="text"
                  value={todo.description}
                  onChange={(e) => {
                    // Update local state immediately for better UX
                    setTodos(
                      todos.map((t) =>
                        t._id === todo._id
                          ? { ...t, description: e.target.value }
                          : t
                      )
                    );
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim() !== todo.description) {
                      handleUpdateDescription(todo._id, e.target.value);
                    }
                  }}
                  className="flex-1 px-2 py-1 border border-transparent rounded hover:border-gray-300 focus:outline-none focus:border-blue-500"
                />
              )}

              <button
                onClick={() => handleDeleteTodo(todo._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Todo;