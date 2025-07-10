// Temple Admin Panel JavaScript
class TempleAdmin {
    constructor() {
        this.API_BASE = 'https://703ff1fd-08fb-42ea-96df-dcb7de36b8a6.preview.emergentagent.com/api';
        this.token = localStorage.getItem('admin_token');
        this.currentTab = 'dashboard';
        this.editingItem = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
    }

    checkAuthStatus() {
        if (this.token) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboardScreen').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardScreen').classList.remove('hidden');
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');
        const submitBtn = document.querySelector('.btn-login');

        // Show loading state
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        submitBtn.disabled = true;
        errorDiv.classList.add('hidden');

        try {
            const response = await fetch(`${this.API_BASE}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('admin_token', this.token);
                this.showDashboard();
                this.loadDashboardData();
            } else {
                errorDiv.textContent = data.detail || 'Login failed';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.classList.remove('hidden');
        } finally {
            // Reset loading state
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    handleLogout() {
        this.token = null;
        localStorage.removeItem('admin_token');
        this.showLogin();
        
        // Clear form
        document.getElementById('loginForm').reset();
    }

    switchTab(tabName) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;

        // Load data for the specific tab
        switch (tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'kundali':
                this.loadKundaliUsers();
                break;
            case 'events':
                this.loadEvents();
                break;
            case 'items':
                this.loadTempleItems();
                break;
            case 'donations':
                this.loadDonations();
                break;
            case 'stories':
                this.loadStories();
                break;
        }
    }

    async makeRequest(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
            ...options,
        };

        try {
            const response = await fetch(`${this.API_BASE}${endpoint}`, config);
            
            if (response.status === 403) {
                this.handleLogout();
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            return null;
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    async loadDashboardData() {
        this.showLoading();
        
        try {
            const stats = await this.makeRequest('/stats');
            
            if (stats) {
                document.getElementById('kundaliCount').textContent = stats.kundali_users || 0;
                document.getElementById('eventsCount').textContent = stats.events || 0;
                document.getElementById('itemsCount').textContent = stats.temple_items || 0;
                document.getElementById('donationsCount').textContent = stats.donations || 0;
                document.getElementById('storiesCount').textContent = stats.stories || 0;
                document.getElementById('totalDonations').textContent = `₹${stats.total_donation_amount || 0}`;
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadKundaliUsers() {
        this.showLoading();
        
        try {
            const users = await this.makeRequest('/kundali-users');
            
            if (users) {
                this.renderKundaliUsers(users);
            }
        } catch (error) {
            console.error('Failed to load kundali users:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderKundaliUsers(users) {
        const tbody = document.getElementById('kundaliTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.birth_date}</td>
                <td>${user.birth_time}</td>
                <td>${user.birth_place}</td>
                <td>${user.phone}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn-edit" onclick="templeAdmin.editKundaliUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="templeAdmin.deleteKundaliUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadEvents() {
        this.showLoading();
        
        try {
            const events = await this.makeRequest('/events');
            
            if (events) {
                this.renderEvents(events);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderEvents(events) {
        const grid = document.getElementById('eventsGrid');
        grid.innerHTML = '';

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-content">
                    <h3 class="card-title">${event.name}</h3>
                    <p class="card-description">${event.description}</p>
                    <div class="card-meta">
                        <span>📅 ${event.date}</span>
                        <span>🕐 ${event.time}</span>
                        <span>🏷️ ${event.category}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="templeAdmin.editEvent('${event.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="templeAdmin.deleteEvent('${event.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    async loadTempleItems() {
        this.showLoading();
        
        try {
            const items = await this.makeRequest('/temple-items');
            
            if (items) {
                this.renderTempleItems(items);
            }
        } catch (error) {
            console.error('Failed to load temple items:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderTempleItems(items) {
        const grid = document.getElementById('itemsGrid');
        grid.innerHTML = '';

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                ${item.image_base64 ? `<img src="data:image/jpeg;base64,${item.image_base64}" alt="${item.name}" class="card-image">` : ''}
                <div class="card-content">
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-description">${item.description}</p>
                    <div class="card-meta">
                        <span>💰 ₹${item.price}</span>
                        <span>🏷️ ${item.category}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="templeAdmin.editItem('${item.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="templeAdmin.deleteItem('${item.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    async loadDonations() {
        this.showLoading();
        
        try {
            const donations = await this.makeRequest('/donations');
            
            if (donations) {
                this.renderDonations(donations);
            }
        } catch (error) {
            console.error('Failed to load donations:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderDonations(donations) {
        const tbody = document.getElementById('donationsTableBody');
        tbody.innerHTML = '';

        donations.forEach(donation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${donation.donor_name}</td>
                <td>₹${donation.amount}</td>
                <td>${donation.date}</td>
                <td>${donation.purpose}</td>
                <td>${donation.contact_details}</td>
                <td>
                    <button class="btn-delete" onclick="templeAdmin.deleteDonation('${donation.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadStories() {
        this.showLoading();
        
        try {
            const stories = await this.makeRequest('/stories');
            
            if (stories) {
                this.renderStories(stories);
            }
        } catch (error) {
            console.error('Failed to load stories:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderStories(stories) {
        const grid = document.getElementById('storiesGrid');
        grid.innerHTML = '';

        stories.forEach(story => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-content">
                    <h3 class="card-title">${story.title}</h3>
                    <p class="card-description">${story.content.substring(0, 100)}...</p>
                    <div class="card-meta">
                        <span>🏷️ ${story.category}</span>
                        <span>✍️ ${story.author}</span>
                        <span>📅 ${story.date}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="templeAdmin.editStory('${story.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="templeAdmin.deleteStory('${story.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Modal functions
    showModal(content) {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        this.editingItem = null;
    }

    // Form functions
    showKundaliForm(user = null) {
        this.editingItem = user;
        const isEdit = user !== null;
        
        const form = `
            <form class="modal-form" onsubmit="templeAdmin.submitKundaliForm(event)">
                <h3>${isEdit ? 'Edit' : 'Add'} Kundali User</h3>
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" value="${user?.name || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="birth_date">Birth Date</label>
                        <input type="date" id="birth_date" name="birth_date" value="${user?.birth_date || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="birth_time">Birth Time</label>
                        <input type="time" id="birth_time" name="birth_time" value="${user?.birth_time || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="birth_place">Birth Place</label>
                    <input type="text" id="birth_place" name="birth_place" value="${user?.birth_place || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="tel" id="phone" name="phone" value="${user?.phone || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" value="${user?.email || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="horoscope_data">Horoscope Data</label>
                    <textarea id="horoscope_data" name="horoscope_data" required>${user?.horoscope_data || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit">${isEdit ? 'Update' : 'Add'} User</button>
                    <button type="button" class="btn-cancel" onclick="templeAdmin.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        this.showModal(form);
    }

    showEventForm(event = null) {
        this.editingItem = event;
        const isEdit = event !== null;
        
        const form = `
            <form class="modal-form" onsubmit="templeAdmin.submitEventForm(event)">
                <h3>${isEdit ? 'Edit' : 'Add'} Event</h3>
                <div class="form-group">
                    <label for="name">Event Name</label>
                    <input type="text" id="name" name="name" value="${event?.name || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="date">Date</label>
                        <input type="date" id="date" name="date" value="${event?.date || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="time">Time</label>
                        <input type="time" id="time" name="time" value="${event?.time || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" required>${event?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" name="category" required>
                        <option value="">Select Category</option>
                        <option value="Festival" ${event?.category === 'Festival' ? 'selected' : ''}>Festival</option>
                        <option value="Puja" ${event?.category === 'Puja' ? 'selected' : ''}>Puja</option>
                        <option value="Ceremony" ${event?.category === 'Ceremony' ? 'selected' : ''}>Ceremony</option>
                        <option value="Special Event" ${event?.category === 'Special Event' ? 'selected' : ''}>Special Event</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit">${isEdit ? 'Update' : 'Add'} Event</button>
                    <button type="button" class="btn-cancel" onclick="templeAdmin.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        this.showModal(form);
    }

    showItemForm(item = null) {
        this.editingItem = item;
        const isEdit = item !== null;
        
        const form = `
            <form class="modal-form" onsubmit="templeAdmin.submitItemForm(event)">
                <h3>${isEdit ? 'Edit' : 'Add'} Temple Item</h3>
                <div class="form-group">
                    <label for="name">Item Name</label>
                    <input type="text" id="name" name="name" value="${item?.name || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="price">Price (₹)</label>
                        <input type="number" step="0.01" id="price" name="price" value="${item?.price || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="category">Category</label>
                        <select id="category" name="category" required>
                            <option value="">Select Category</option>
                            <option value="Prasad" ${item?.category === 'Prasad' ? 'selected' : ''}>Prasad</option>
                            <option value="Puja Items" ${item?.category === 'Puja Items' ? 'selected' : ''}>Puja Items</option>
                            <option value="Decorations" ${item?.category === 'Decorations' ? 'selected' : ''}>Decorations</option>
                            <option value="Books" ${item?.category === 'Books' ? 'selected' : ''}>Books</option>
                            <option value="Artifacts" ${item?.category === 'Artifacts' ? 'selected' : ''}>Artifacts</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" required>${item?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="image">Image</label>
                    <input type="file" id="image" name="image" accept="image/*" onchange="templeAdmin.previewImage(this)">
                    ${item?.image_base64 ? `<img src="data:image/jpeg;base64,${item.image_base64}" alt="Preview" class="image-preview" id="imagePreview">` : '<img id="imagePreview" class="image-preview hidden" alt="Preview">'}
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit">${isEdit ? 'Update' : 'Add'} Item</button>
                    <button type="button" class="btn-cancel" onclick="templeAdmin.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        this.showModal(form);
    }

    showDonationForm() {
        const form = `
            <form class="modal-form" onsubmit="templeAdmin.submitDonationForm(event)">
                <h3>Add Donation</h3>
                <div class="form-group">
                    <label for="donor_name">Donor Name</label>
                    <input type="text" id="donor_name" name="donor_name" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="amount">Amount (₹)</label>
                        <input type="number" step="0.01" id="amount" name="amount" required>
                    </div>
                    <div class="form-group">
                        <label for="date">Date</label>
                        <input type="date" id="date" name="date" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="purpose">Purpose</label>
                    <input type="text" id="purpose" name="purpose" required>
                </div>
                <div class="form-group">
                    <label for="contact_details">Contact Details</label>
                    <input type="text" id="contact_details" name="contact_details" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit">Add Donation</button>
                    <button type="button" class="btn-cancel" onclick="templeAdmin.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        this.showModal(form);
    }

    showStoryForm(story = null) {
        this.editingItem = story;
        const isEdit = story !== null;
        
        const form = `
            <form class="modal-form" onsubmit="templeAdmin.submitStoryForm(event)">
                <h3>${isEdit ? 'Edit' : 'Add'} Story</h3>
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" value="${story?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label for="content">Content</label>
                    <textarea id="content" name="content" rows="5" required>${story?.content || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="category">Category</label>
                        <select id="category" name="category" required>
                            <option value="">Select Category</option>
                            <option value="Religious Stories" ${story?.category === 'Religious Stories' ? 'selected' : ''}>Religious Stories</option>
                            <option value="Temple History" ${story?.category === 'Temple History' ? 'selected' : ''}>Temple History</option>
                            <option value="Devotee Experiences" ${story?.category === 'Devotee Experiences' ? 'selected' : ''}>Devotee Experiences</option>
                            <option value="Legends" ${story?.category === 'Legends' ? 'selected' : ''}>Legends</option>
                            <option value="Teachings" ${story?.category === 'Teachings' ? 'selected' : ''}>Teachings</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="author">Author</label>
                        <input type="text" id="author" name="author" value="${story?.author || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="date">Date</label>
                    <input type="date" id="date" name="date" value="${story?.date || ''}" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit">${isEdit ? 'Update' : 'Add'} Story</button>
                    <button type="button" class="btn-cancel" onclick="templeAdmin.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        this.showModal(form);
    }

    // Image preview function
    previewImage(input) {
        const preview = document.getElementById('imagePreview');
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Form submission functions
    async submitKundaliForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        data.consultation_history = [];
        
        const endpoint = this.editingItem ? `/kundali-users/${this.editingItem.id}` : '/kundali-users';
        const method = this.editingItem ? 'PUT' : 'POST';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method,
                body: JSON.stringify(data),
            });
            
            if (response) {
                this.closeModal();
                this.loadKundaliUsers();
                this.loadDashboardData();
            }
        } catch (error) {
            console.error('Failed to save kundali user:', error);
        }
    }

    async submitEventForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        const endpoint = this.editingItem ? `/events/${this.editingItem.id}` : '/events';
        const method = this.editingItem ? 'PUT' : 'POST';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method,
                body: JSON.stringify(data),
            });
            
            if (response) {
                this.closeModal();
                this.loadEvents();
                this.loadDashboardData();
            }
        } catch (error) {
            console.error('Failed to save event:', error);
        }
    }

    async submitItemForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        // Handle image upload
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            data.image_base64 = await this.fileToBase64(imageFile);
        } else if (this.editingItem) {
            data.image_base64 = this.editingItem.image_base64;
        } else {
            data.image_base64 = '';
        }
        
        delete data.image;
        data.price = parseFloat(data.price);
        
        const endpoint = this.editingItem ? `/temple-items/${this.editingItem.id}` : '/temple-items';
        const method = this.editingItem ? 'PUT' : 'POST';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method,
                body: JSON.stringify(data),
            });
            
            if (response) {
                this.closeModal();
                this.loadTempleItems();
                this.loadDashboardData();
            }
        } catch (error) {
            console.error('Failed to save temple item:', error);
        }
    }

    async submitDonationForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        data.amount = parseFloat(data.amount);
        
        try {
            const response = await this.makeRequest('/donations', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            
            if (response) {
                this.closeModal();
                this.loadDonations();
                this.loadDashboardData();
            }
        } catch (error) {
            console.error('Failed to save donation:', error);
        }
    }

    async submitStoryForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        const endpoint = this.editingItem ? `/stories/${this.editingItem.id}` : '/stories';
        const method = this.editingItem ? 'PUT' : 'POST';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method,
                body: JSON.stringify(data),
            });
            
            if (response) {
                this.closeModal();
                this.loadStories();
                this.loadDashboardData();
            }
        } catch (error) {
            console.error('Failed to save story:', error);
        }
    }

    // Helper function to convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    // Edit functions
    async editKundaliUser(id) {
        const user = await this.makeRequest(`/kundali-users/${id}`);
        if (user) {
            this.showKundaliForm(user);
        }
    }

    async editEvent(id) {
        const events = await this.makeRequest('/events');
        const event = events.find(e => e.id === id);
        if (event) {
            this.showEventForm(event);
        }
    }

    async editItem(id) {
        const items = await this.makeRequest('/temple-items');
        const item = items.find(i => i.id === id);
        if (item) {
            this.showItemForm(item);
        }
    }

    async editStory(id) {
        const stories = await this.makeRequest('/stories');
        const story = stories.find(s => s.id === id);
        if (story) {
            this.showStoryForm(story);
        }
    }

    // Delete functions
    async deleteKundaliUser(id) {
        if (confirm('Are you sure you want to delete this kundali user?')) {
            try {
                await this.makeRequest(`/kundali-users/${id}`, { method: 'DELETE' });
                this.loadKundaliUsers();
                this.loadDashboardData();
            } catch (error) {
                console.error('Failed to delete kundali user:', error);
            }
        }
    }

    async deleteEvent(id) {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await this.makeRequest(`/events/${id}`, { method: 'DELETE' });
                this.loadEvents();
                this.loadDashboardData();
            } catch (error) {
                console.error('Failed to delete event:', error);
            }
        }
    }

    async deleteItem(id) {
        if (confirm('Are you sure you want to delete this temple item?')) {
            try {
                await this.makeRequest(`/temple-items/${id}`, { method: 'DELETE' });
                this.loadTempleItems();
                this.loadDashboardData();
            } catch (error) {
                console.error('Failed to delete temple item:', error);
            }
        }
    }

    async deleteDonation(id) {
        if (confirm('Are you sure you want to delete this donation record?')) {
            try {
                await this.makeRequest(`/donations/${id}`, { method: 'DELETE' });
                this.loadDonations();
                this.loadDashboardData();
            } catch (error) {
                console.error('Failed to delete donation:', error);
            }
        }
    }

    async deleteStory(id) {
        if (confirm('Are you sure you want to delete this story?')) {
            try {
                await this.makeRequest(`/stories/${id}`, { method: 'DELETE' });
                this.loadStories();
                this.loadDashboardData();
            } catch (error) {
                console.error('Failed to delete story:', error);
            }
        }
    }
}

// Global functions for easy access
let templeAdmin;

// Initialize the Temple Admin when the page loads
document.addEventListener('DOMContentLoaded', () => {
    templeAdmin = new TempleAdmin();
});

// Global functions for buttons
function showKundaliForm() {
    templeAdmin.showKundaliForm();
}

function showEventForm() {
    templeAdmin.showEventForm();
}

function showItemForm() {
    templeAdmin.showItemForm();
}

function showDonationForm() {
    templeAdmin.showDonationForm();
}

function showStoryForm() {
    templeAdmin.showStoryForm();
}

function closeModal() {
    templeAdmin.closeModal();
}