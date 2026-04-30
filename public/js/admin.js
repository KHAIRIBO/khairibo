// Admin Dashboard JS (Node.js backend)

const App = {
  init() {
    this.checkAuth();
    this.bindEvents();
  },

  showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  async api(endpoint, method = 'GET', body = null) {
    const options = { method, headers: {} };
    if (body) {
      if (body instanceof FormData) {
        options.body = body;
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
    }
    const res = await fetch(endpoint, options);
    const data = await res.json();
    if (res.status === 401) {
      this.showLogin();
      throw new Error('Unauthorized');
    }
    if (!res.ok || data.error) throw new Error(data.error || 'API Error');
    return data;
  },

  async checkAuth() {
    try {
      await this.api('/api/admin/me');
      this.showDashboard();
    } catch (e) {
      this.showLogin();
    }
  },

  showLogin() {
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('hidden');
  },

  showDashboard() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    this.loadAllData();
  },

  bindEvents() {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      try {
        await this.api('/api/admin/login', 'POST', { username, password });
        this.showDashboard();
        this.showToast('Logged in successfully');
      } catch (e) {
        this.showToast(e.message, 'error');
      }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await this.api('/api/admin/logout', 'POST');
      this.showLogin();
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.target).classList.remove('hidden');
      });
    });
  },

  async loadAllData() {
    this.loadContacts();
    this.loadNotes();
    this.loadFiles();
    this.loadEvents();
  },

  // --- Contacts ---
  async loadContacts() {
    try {
      const { data } = await this.api('/api/admin/contact_submissions');
      const tbody = document.getElementById('contacts-table-body');
      tbody.innerHTML = data.map(c => `
        <tr>
          <td>${new Date(c.created_at).toLocaleDateString()}</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${c.message}</td>
          <td>
            <button class="ghost-mini" style="color:red" onclick="app.deleteContact(${c.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch(e) { console.error(e); }
  },

  async deleteContact(id) {
    if(!confirm('Delete this message?')) return;
    try {
      await this.api(`/api/admin/contact_submissions/${id}`, 'DELETE');
      this.loadContacts();
    } catch(e) { this.showToast(e.message, 'error'); }
  },

  // --- Notes ---
  async loadNotes() {
    try {
      const { data } = await this.api('/api/admin/notes');
      const grid = document.getElementById('notes-grid');
      grid.innerHTML = data.map(n => `
        <div class="mini-card">
          <h4>${n.title}</h4>
          <p>${n.content.substring(0, 100)}</p>
          <div style="margin-top: 10px; display:flex; gap: 8px;">
            <button class="ghost-mini" onclick="app.editNote(${n.id}, '${n.title.replace(/'/g, "\\'")}', '${n.content.replace(/'/g, "\\'")}')">Edit</button>
            <button class="ghost-mini" style="color:red" onclick="app.deleteNote(${n.id})">Delete</button>
          </div>
        </div>
      `).join('');
    } catch(e) { this.showToast(e.message, 'error'); }
  },

  openNoteModal() {
    document.getElementById('note-id').value = '';
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('note-modal').classList.remove('hidden');
  },

  editNote(id, title, content) {
    document.getElementById('note-id').value = id;
    document.getElementById('note-title').value = title;
    document.getElementById('note-content').value = content;
    document.getElementById('note-modal').classList.remove('hidden');
  },

  async saveNote(e) {
    e.preventDefault();
    const id = document.getElementById('note-id').value;
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    
    try {
      if (id) {
        await this.api(`/api/admin/notes/${id}`, 'PUT', { title, content });
      } else {
        await this.api('/api/admin/notes', 'POST', { title, content });
      }
      this.closeModal('note-modal');
      this.loadNotes();
      this.showToast('Note saved');
    } catch(e) { this.showToast(e.message, 'error'); }
  },

  async deleteNote(id) {
    if(!confirm('Delete this note?')) return;
    try {
      await this.api(`/api/admin/notes/${id}`, 'DELETE');
      this.loadNotes();
    } catch(e) { this.showToast(e.message, 'error'); }
  },

  // --- Files ---
  async loadFiles() {
    try {
      const { data } = await this.api('/api/admin/files');
      const tbody = document.getElementById('files-table-body');
      tbody.innerHTML = data.map(f => `
        <tr>
          <td>${f.original_name}</td>
          <td>${f.mime_type}</td>
          <td>${new Date(f.uploaded_at).toLocaleDateString()}</td>
          <td>
            <a href="${f.shareable_link}" target="_blank" class="ghost-mini">View</a>
            <button class="ghost-mini" style="color:red" onclick="app.deleteFile(${f.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch(e) { console.error(e); }
  },

  async uploadFile(e) {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    this.showToast('Uploading to Google Drive...', 'success');
    try {
      await this.api('/api/admin/upload', 'POST', formData);
      this.loadFiles();
      this.showToast('File uploaded successfully');
    } catch(err) { this.showToast(err.message, 'error'); }
    e.target.value = '';
  },

  async deleteFile(id) {
    if(!confirm('Delete file from database and Google Drive?')) return;
    try {
      await this.api(`/api/admin/files/${id}`, 'DELETE');
      this.loadFiles();
    } catch(e) { this.showToast(e.message, 'error'); }
  },

  // --- Calendar ---
  async loadEvents() {
    try {
      const { data } = await this.api('/api/admin/events');
      const tbody = document.getElementById('events-table-body');
      tbody.innerHTML = data.map(ev => `
        <tr>
          <td>${ev.title}</td>
          <td>${new Date(ev.start_datetime).toLocaleString()}</td>
          <td>${new Date(ev.end_datetime).toLocaleString()}</td>
          <td>${ev.description || ''}</td>
          <td>
            <button class="ghost-mini" style="color:red" onclick="app.deleteEvent(${ev.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch(e) { console.error(e); }
  },

  openEventModal() {
    document.getElementById('event-form').reset();
    document.getElementById('event-modal').classList.remove('hidden');
  },

  async saveEvent(e) {
    e.preventDefault();
    const payload = {
      title: document.getElementById('event-title').value,
      start_datetime: document.getElementById('event-start').value,
      end_datetime: document.getElementById('event-end').value,
      description: document.getElementById('event-desc').value
    };
    try {
      await this.api('/api/admin/events', 'POST', payload);
      this.closeModal('event-modal');
      this.loadEvents();
      this.showToast('Event added to Google Calendar');
    } catch(err) { this.showToast(err.message, 'error'); }
  },

  async deleteEvent(id) {
    if(!confirm('Delete event?')) return;
    try {
      await this.api(`/api/admin/events/${id}`, 'DELETE');
      this.loadEvents();
    } catch(e) { this.showToast(e.message, 'error'); }
  },

  closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }
};

window.app = App;
document.addEventListener('DOMContentLoaded', () => App.init());
