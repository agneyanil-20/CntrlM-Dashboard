// --- Team & Auth Data ---
const memberPasswords = {
    'Agney': 'agney123', 'Neha': 'neha123', 'Nived': 'nived123',
    'Sijin': 'sijin123', 'Abhay': 'abhay123', 'Adhil': 'adil123',
    'Shaun': 'shawn123', 'Hari': 'hari123', 'Megha': 'megha123',
    'Christi': 'christi123', 'Dilna': 'mango123'
};

const allClients = [
    { id: 'cli1', name: 'Nails', cycle: '19–19', posts: 6, videos: 0, status: 'progress', owner: 'Neha' },
    { id: 'cli2', name: 'Pantry', cycle: '12–12', posts: 9, videos: 0, status: 'completed', owner: 'Neha' },
    { id: 'cli3', name: 'Tredha', cycle: '19–19', posts: 15, videos: 0, status: 'progress', owner: 'Agney' },
    { id: 'cli4', name: 'Fabaich', cycle: '17–17', posts: 6, videos: 1, status: 'progress', owner: 'Nived' },
    { id: 'cli5', name: 'Techolas', cycle: '12–12', posts: 4, videos: 0, status: 'completed', owner: 'Nived' },
    { id: 'cli6', name: 'Flev', cycle: '19–19', posts: 10, videos: 3, status: 'delayed', owner: 'Agney' },
    { id: 'cli7', name: 'Alchemy', cycle: '—', posts: 0, videos: 0, status: 'progress', owner: 'Agney' },
    { id: 'cli8', name: 'Chaya Club', cycle: '—', posts: 6, videos: 0, status: 'progress', owner: 'Neha' },
    { id: 'cli9', name: 'Matti', cycle: '—', posts: 3, videos: 0, status: 'completed', owner: 'Neha' },
    { id: 'cli10', name: 'Zohaland', cycle: '—', posts: 6, videos: 0, status: 'delayed', owner: 'Nived' },
    { id: 'cli11', name: 'Solydenim', cycle: '—', posts: 10, videos: 0, status: 'progress', owner: 'Nived' },
    { id: 'cli12', name: 'Santa Ma', cycle: '—', posts: 6, videos: 0, status: 'progress', owner: 'Agney' }
];

let currentMember = null;
let completedTasks = new Set();
let progressChart = null;
let contentSplitChart = null;

// --- Initialization ---
function init() {
    renderKPIs();
    renderAllClients();
    initCharts();
    updateUIForAuth();
}

function renderKPIs() {
    const total = allClients.length;
    const completed = allClients.filter(c => c.status === 'completed' || completedTasks.has(c.id)).length;
    const delayed = allClients.filter(c => c.status === 'delayed').length;
    const pending = total - completed;

    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-completed').textContent = completed;
    document.getElementById('kpi-pending').textContent = pending;
    document.getElementById('kpi-delayed').textContent = delayed;
}

function renderAllClients(filteredList = allClients) {
    const grid = document.getElementById('all-clients-grid');
    if (!grid) return;
    grid.innerHTML = '';

    filteredList.forEach((client, index) => {
        const isOwner = currentMember === client.owner;
        const isDone = client.status === 'completed' || completedTasks.has(client.id);
        const progress = isDone ? 100 : (client.status === 'delayed' ? 30 : 65);
        const initials = client.owner[0].toUpperCase();

        const card = document.createElement('div');
        card.className = 'client-card anim-enter';
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="card-top">
                <div class="client-label">
                    <h3>${client.name}</h3>
                    <span>Cycle: ${client.cycle}</span>
                </div>
                <div class="status-badge status-${isDone ? 'completed' : client.status}">
                    ${isDone ? 'COMPLETED' : client.status.toUpperCase()}
                </div>
            </div>

            <div class="card-stats">
                <div class="stat-item"><i class="ph ph-image"></i> ${client.posts} Posts</div>
                <div class="stat-item"><i class="ph ph-video"></i> ${client.videos} Videos</div>
            </div>

            <div class="card-progress">
                <div class="progress-meta">
                    <span>Progress</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>

            <div class="card-footer">
                <div class="owner-info">
                    <div class="avatar-sm">${initials}</div>
                    <span>${client.owner}</span>
                </div>
                <div class="done-pill ${isDone ? 'active' : ''} ${!isOwner ? 'disabled' : ''}" 
                     onclick="toggleClientTask('${client.id}', '${client.owner}')">
                    <i class="ph ${isDone ? 'ph-check-circle-fill' : 'ph-circle'}"></i>
                    <span>${isDone ? 'Done' : 'Mark Done'}</span>
                </div>
            </div>
            ${isOwner ? '<div class="owner-pill" style="position:absolute; bottom:0; right:0; border-radius: 8px 0 0 0">YOURS</div>' : ''}
        `;
        grid.appendChild(card);
    });
}

// --- Charts Logic ---
function initCharts() {
    const ctxProgress = document.getElementById('progressChart').getContext('2d');
    const ctxSplit = document.getElementById('contentSplitChart').getContext('2d');

    if (progressChart) progressChart.destroy();
    if (contentSplitChart) contentSplitChart.destroy();

    // Progress Bar Chart
    progressChart = new Chart(ctxProgress, {
        type: 'bar',
        data: {
            labels: allClients.map(c => c.name),
            datasets: [{
                label: 'Completed',
                data: allClients.map(c => (completedTasks.has(c.id) || c.status === 'completed') ? 100 : 60),
                backgroundColor: '#f97316',
                borderRadius: 4
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });

    // Content Split Donut
    const totalPosts = allClients.reduce((acc, c) => acc + c.posts, 0);
    const totalVideos = allClients.reduce((acc, c) => acc + c.videos, 0);

    contentSplitChart = new Chart(ctxSplit, {
        type: 'doughnut',
        data: {
            labels: ['Posts', 'Videos'],
            datasets: [{
                data: [totalPosts, totalVideos],
                backgroundColor: ['#f97316', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// --- Interaction Logic ---
function filterClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const owner = document.getElementById('ownerFilter').value;
    const status = document.getElementById('statusFilter').value;

    const filtered = allClients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm);
        const matchesOwner = owner === 'all' || c.owner === owner;
        const isDone = c.status === 'completed' || completedTasks.has(c.id);
        const matchesStatus = status === 'all' || 
                              (status === 'completed' && isDone) || 
                              (status === 'pending' && !isDone);
        
        return matchesSearch && matchesOwner && matchesStatus;
    });

    renderAllClients(filtered);
}

function toggleClientTask(id, owner) {
    if (currentMember !== owner) {
        alert(`Verification required: Log in as ${owner} to update this assignment.`);
        return;
    }
    if (completedTasks.has(id)) completedTasks.delete(id);
    else completedTasks.add(id);
    
    renderAllClients();
    renderKPIs();
    initCharts(); // Update charts on change
}

function saveProgress() {
    const toast = document.getElementById('save-status');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- Auth Handling ---
function openPasswordModal(name) {
    window.targetMember = name;
    document.getElementById('modal-user-name').textContent = name;
    document.getElementById('password-modal').classList.add('active');
}

function checkPassword() {
    const pwd = document.getElementById('secret-password').value;
    if (pwd === memberPasswords[window.targetMember]) {
        currentMember = window.targetMember;
        closeModal();
        updateUIForAuth();
        renderAllClients();
    } else {
        alert('Invalid Password');
    }
}

function updateUIForAuth() {
    const display = document.getElementById('user-display-short');
    const avatar = document.getElementById('user-avatar-tiny');
    const saveBtn = document.getElementById('save-btn');

    if (currentMember) {
        display.textContent = currentMember;
        avatar.textContent = currentMember[0];
        saveBtn.style.display = 'flex';
    } else {
        display.textContent = 'Guest';
        avatar.textContent = 'G';
        saveBtn.style.display = 'none';
    }
}

function switchScreen(id) {
    if (id === 'dashboard') {
        const names = ['Agney', 'Neha', 'Nived', 'Sijin', 'Dilna'];
        const listContainer = document.querySelector('#details .member-list');
        // Simple team selector logic for demo
        showTeam('graphic-design');
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showTeam(key) {
    // Re-use previous team definitions
    const members = {
        'graphic-design': ['Agney', 'Neha', 'Nived'],
        'video-production': ['Sijin', 'Shawn', 'Hari']
    }[key] || ['Team Member'];
    
    document.getElementById('team-title').textContent = key.replace('-', ' ').toUpperCase();
    const list = document.getElementById('member-list');
    list.innerHTML = members.map(m => `
        <div class="member-card" onclick="openPasswordModal('${m}')">
            <div class="avatar-circle">${m[0]}</div>
            <span>${m}</span>
        </div>
    `).join('');
    switchScreen('details');
}

function closeModal() { document.getElementById('password-modal').classList.remove('active'); }

init();
