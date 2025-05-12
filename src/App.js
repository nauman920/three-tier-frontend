import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/items`);

      if (response.status !== 200) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

      const data = response.data;

      if (Array.isArray(data)) {
        setItems(data);
        setError(false);
      } else {
        console.warn("Expected array but received:", data);
        setItems([]);
        setError("invalidData");
      }
    } catch (err) {
      console.error("Error fetching items from backend:", err.message || err);
      setItems([]);

      // Detect mixed content error (HTTPS page calling HTTP API)
      if (
        err.message?.includes("Network Error") &&
        window.location.protocol === "https:" &&
        API_URL.startsWith("http:")
      ) {
        setError("mixedContent");
      } else {
        setError("network");
      }
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
      setError("network");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/items/${id}`);
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      setError("network");
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

        {error === "mixedContent" ? (
          <p className="error-state">
            ❗ Mixed Content Error — This HTTPS page tried to call an HTTP API. Please use HTTPS in your API_URL.
          </p>
        ) : error === "network" ? (
          <p className="error-state">❗ Network Error — backend may not be connected.</p>
        ) : error === "invalidData" ? (
          <p className="error-state">❗ Invalid response from backend — expected an array of items.</p>
        ) : items.length > 0 ? (
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
