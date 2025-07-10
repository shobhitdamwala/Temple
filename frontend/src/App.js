import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Login Component
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password
      });
      
      localStorage.setItem('admin_token', response.data.token);
      onLogin(response.data.token);
    } catch (error) {
      setError(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-800 mb-2">🕉️ Temple Admin</h1>
          <p className="text-gray-600">Admin Panel Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Default: admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // State for different data
  const [kundaliUsers, setKundaliUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [templeItems, setTempleItems] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stories, setStories] = useState([]);

  // Form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showKundaliForm, setShowKundaliForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  const [editingItem, setEditingItem] = useState(null);

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAllData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`, axiosConfig);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [kundaliRes, eventsRes, itemsRes, donationsRes, storiesRes] = await Promise.all([
        axios.get(`${API}/kundali-users`, axiosConfig),
        axios.get(`${API}/events`, axiosConfig),
        axios.get(`${API}/temple-items`, axiosConfig),
        axios.get(`${API}/donations`, axiosConfig),
        axios.get(`${API}/stories`, axiosConfig)
      ]);

      setKundaliUsers(kundaliRes.data);
      setEvents(eventsRes.data);
      setTempleItems(itemsRes.data);
      setDonations(donationsRes.data);
      setStories(storiesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    onLogout();
  };

  const handleEventSubmit = async (eventData) => {
    try {
      if (editingItem) {
        await axios.put(`${API}/events/${editingItem.id}`, eventData, axiosConfig);
      } else {
        await axios.post(`${API}/events`, eventData, axiosConfig);
      }
      fetchAllData();
      setShowEventForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleItemSubmit = async (itemData) => {
    try {
      if (editingItem) {
        await axios.put(`${API}/temple-items/${editingItem.id}`, itemData, axiosConfig);
      } else {
        await axios.post(`${API}/temple-items`, itemData, axiosConfig);
      }
      fetchAllData();
      setShowItemForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleStorySubmit = async (storyData) => {
    try {
      if (editingItem) {
        await axios.put(`${API}/stories/${editingItem.id}`, storyData, axiosConfig);
      } else {
        await axios.post(`${API}/stories`, storyData, axiosConfig);
      }
      fetchAllData();
      setShowStoryForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving story:", error);
    }
  };

  const handleKundaliSubmit = async (kundaliData) => {
    try {
      await axios.post(`${API}/kundali-users`, kundaliData, axiosConfig);
      fetchAllData();
      setShowKundaliForm(false);
    } catch (error) {
      console.error("Error saving kundali user:", error);
    }
  };

  const handleDonationSubmit = async (donationData) => {
    try {
      await axios.post(`${API}/donations`, donationData, axiosConfig);
      fetchAllData();
      setShowDonationForm(false);
    } catch (error) {
      console.error("Error saving donation:", error);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${API}/${type}/${id}`, axiosConfig);
        fetchAllData();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">🕉️ Temple Admin Panel</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation */}
        <nav className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap space-x-4">
            {[
              { id: "dashboard", label: "📊 Dashboard", icon: "📊" },
              { id: "kundali", label: "🔮 Kundali Users", icon: "🔮" },
              { id: "events", label: "📅 Events", icon: "📅" },
              { id: "items", label: "🛍️ Temple Items", icon: "🛍️" },
              { id: "donations", label: "💰 Donations", icon: "💰" },
              { id: "stories", label: "📖 Stories", icon: "📖" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">🔮</div>
              <h3 className="text-xl font-semibold text-gray-800">Kundali Users</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.kundali_users || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="text-xl font-semibold text-gray-800">Events</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.events || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-800">Temple Items</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.temple_items || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-xl font-semibold text-gray-800">Donations</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.donations || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">📖</div>
              <h3 className="text-xl font-semibold text-gray-800">Stories</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.stories || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">💵</div>
              <h3 className="text-xl font-semibold text-gray-800">Total Donations</h3>
              <p className="text-3xl font-bold text-green-600">₹{stats.total_donation_amount || 0}</p>
            </div>
          </div>
        )}

        {/* Kundali Users */}
        {activeTab === "kundali" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🔮 Kundali Users</h2>
              <button
                onClick={() => setShowKundaliForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Birth Date</th>
                    <th className="px-4 py-2 text-left">Birth Time</th>
                    <th className="px-4 py-2 text-left">Birth Place</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {kundaliUsers.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.birth_date}</td>
                      <td className="px-4 py-2">{user.birth_time}</td>
                      <td className="px-4 py-2">{user.birth_place}</td>
                      <td className="px-4 py-2">{user.phone}</td>
                      <td className="px-4 py-2">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events */}
        {activeTab === "events" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📅 Events</h2>
              <button
                onClick={() => setShowEventForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Event
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-2">{event.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>📅 {event.date}</p>
                    <p>🕐 {event.time}</p>
                    <p>🏷️ {event.category}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(event);
                        setShowEventForm(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("events", event.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Temple Items */}
        {activeTab === "items" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🛍️ Temple Items</h2>
              <button
                onClick={() => setShowItemForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Item
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templeItems.map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  {item.image_base64 && (
                    <img 
                      src={`data:image/jpeg;base64,${item.image_base64}`} 
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>💰 ₹{item.price}</p>
                    <p>🏷️ {item.category}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowItemForm(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("temple-items", item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donations */}
        {activeTab === "donations" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">💰 Donations</h2>
              <button
                onClick={() => setShowDonationForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Donation
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Donor Name</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Purpose</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(donation => (
                    <tr key={donation.id} className="border-b">
                      <td className="px-4 py-2">{donation.donor_name}</td>
                      <td className="px-4 py-2">₹{donation.amount}</td>
                      <td className="px-4 py-2">{donation.date}</td>
                      <td className="px-4 py-2">{donation.purpose}</td>
                      <td className="px-4 py-2">{donation.contact_details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stories */}
        {activeTab === "stories" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📖 Stories</h2>
              <button
                onClick={() => setShowStoryForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Story
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stories.map(story => (
                <div key={story.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{story.title}</h3>
                  <p className="text-gray-600 mb-2">{story.content.substring(0, 100)}...</p>
                  <div className="text-sm text-gray-500">
                    <p>🏷️ {story.category}</p>
                    <p>✍️ {story.author}</p>
                    <p>📅 {story.date}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(story);
                        setShowStoryForm(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("stories", story.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Forms */}
      {showEventForm && (
        <EventForm
          onSubmit={handleEventSubmit}
          onClose={() => {
            setShowEventForm(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
        />
      )}

      {showItemForm && (
        <ItemForm
          onSubmit={handleItemSubmit}
          onClose={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
        />
      )}

      {showStoryForm && (
        <StoryForm
          onSubmit={handleStorySubmit}
          onClose={() => {
            setShowStoryForm(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
        />
      )}

      {showKundaliForm && (
        <KundaliForm
          onSubmit={handleKundaliSubmit}
          onClose={() => setShowKundaliForm(false)}
        />
      )}

      {showDonationForm && (
        <DonationForm
          onSubmit={handleDonationSubmit}
          onClose={() => setShowDonationForm(false)}
        />
      )}
    </div>
  );
};

// Event Form Component
const EventForm = ({ onSubmit, onClose, editingItem }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || "",
    date: editingItem?.date || "",
    time: editingItem?.time || "",
    description: editingItem?.description || "",
    category: editingItem?.category || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {editingItem ? "Edit Event" : "Add New Event"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Festival">Festival</option>
              <option value="Puja">Puja</option>
              <option value="Ceremony">Ceremony</option>
              <option value="Special Event">Special Event</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              {editingItem ? "Update" : "Add"} Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Item Form Component
const ItemForm = ({ onSubmit, onClose, editingItem }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || "",
    price: editingItem?.price || "",
    description: editingItem?.description || "",
    category: editingItem?.category || "",
    image_base64: editingItem?.image_base64 || ""
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        setFormData({...formData, image_base64: base64});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {editingItem ? "Edit Item" : "Add New Item"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Prasad">Prasad</option>
              <option value="Puja Items">Puja Items</option>
              <option value="Decorations">Decorations</option>
              <option value="Books">Books</option>
              <option value="Artifacts">Artifacts</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {formData.image_base64 && (
              <img 
                src={`data:image/jpeg;base64,${formData.image_base64}`} 
                alt="Preview"
                className="mt-2 w-full h-32 object-cover rounded-lg"
              />
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              {editingItem ? "Update" : "Add"} Item
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Story Form Component
const StoryForm = ({ onSubmit, onClose, editingItem }) => {
  const [formData, setFormData] = useState({
    title: editingItem?.title || "",
    content: editingItem?.content || "",
    category: editingItem?.category || "",
    author: editingItem?.author || "",
    date: editingItem?.date || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {editingItem ? "Edit Story" : "Add New Story"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="5"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Religious Stories">Religious Stories</option>
              <option value="Temple History">Temple History</option>
              <option value="Devotee Experiences">Devotee Experiences</option>
              <option value="Legends">Legends</option>
              <option value="Teachings">Teachings</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              {editingItem ? "Update" : "Add"} Story
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Kundali Form Component
const KundaliForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    birth_time: "",
    birth_place: "",
    phone: "",
    email: "",
    horoscope_data: "",
    consultation_history: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Add New Kundali User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Birth Date</label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Birth Time</label>
            <input
              type="time"
              value={formData.birth_time}
              onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Birth Place</label>
            <input
              type="text"
              value={formData.birth_place}
              onChange={(e) => setFormData({...formData, birth_place: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Horoscope Data</label>
            <textarea
              value={formData.horoscope_data}
              onChange={(e) => setFormData({...formData, horoscope_data: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="3"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Donation Form Component
const DonationForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    donor_name: "",
    amount: "",
    date: "",
    purpose: "",
    contact_details: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add New Donation</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Donor Name</label>
            <input
              type="text"
              value={formData.donor_name}
              onChange={(e) => setFormData({...formData, donor_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Purpose</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Contact Details</label>
            <input
              type="text"
              value={formData.contact_details}
              onChange={(e) => setFormData({...formData, contact_details: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Donation
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token) => {
    setToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;