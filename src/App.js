import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Create this CSS file

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/items`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      await axios.post(`${API_URL}/api/items`, { name: input });
      setInput('');
      await fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/items/${id}`);
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="content-box">
        <h1 className="app-title">Items Manager</h1>
        
        <form onSubmit={handleSubmit} className="item-form">
          <input
            className="item-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter new item..."
            aria-label="Enter new item"
          />
          <button 
            type="submit" 
            className="add-button"
            disabled={!input.trim()}
          >
            Add Item
          </button>
        </form>

        {items.length > 0 ? (
          <ul className="item-list">
            {items.map(item => (
              <li key={item._id} className="item-card">
                <span className="item-text">{item.name}</span>
                <button 
                  onClick={() => handleDelete(item._id)}
                  className="delete-button"
                  aria-label="Delete item"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No items found. Add your first item above!</p>
        )}
      </div>
    </div>
  );
}

export default App;