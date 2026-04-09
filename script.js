// --- Team & Auth Data ---
const teams = {
    'graphic-design': { title: 'Graphic Designers', members: ['Agney', 'Neha', 'Nived'] },
    'video-production': { title: 'Video Editors', members: ['Sijin', 'Abhay', 'Adhil', 'Shaun', 'Hari'] },
    'social-media': { title: 'Social Media Managers', members: ['Megha', 'Christi'] },
    'content-writing': { title: 'Content Writers', members: ['Dilna'] }
};

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

let selectedRoleKey = null;
let currentMember = null;
let completedTasks = new Set();
let progressChart = null;
let contentSplitChart = null;

// --- Initialization ---
function init() {
    renderKPIs();
    renderAllClients();
    initCharts();
}

// --- Step 1: Role Selection Logic ---

function selectRole(key) {
    selectedRoleKey = key;
    
    // UI Update: Highlight card
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`role-${key}`).classList.add('selected');
    
    // Enable Continue button
    const btn = document.getElementById('continue-btn');
    btn.classList.remove('disabled');
    
    // Subtle Haptic/Audio Feedback would go here
    console.log("Selected Role:", key);
}

function proceedToNames() {
    if (!selectedRoleKey) return;
    showTeam(selectedRoleKey);
}

// --- Step 2: Member Selection Logic ---

function showTeam(teamKey) {
    const team = teams[teamKey];
    document.getElementById('team-title').textContent = team.title;
    document.getElementById('member-count').textContent = `Select your name among ${team.members.length} members`;

    const list = document.getElementById('member-list');
    list.innerHTML = team.members.map(name => `
        <div class="member-card anim-slide-in" onclick="openPasswordModal('${name}')">
            <div class="avatar-circle">${name[0]}</div>
            <div class="member-name">${name}</div>
        </div>
    `).join('');

    switchScreen('details');
}

function openPasswordModal(name) {
    window.targetMember = name;
    document.getElementById('modal-user-name').textContent = name;
    document.getElementById('password-modal').classList.add('active');
    document.getElementById('secret-password').value = '';
    setTimeout(() => document.getElementById('secret-password').focus(), 100);
}

function checkPassword() {
    const pwd = document.getElementById('secret-password').value;
    if (pwd === memberPasswords[window.targetMember]) {
        currentMember = window.targetMember;
        closeModal();
        updateUIForAuth();
        switchScreen('client-board');
        renderAllClients();
        renderKPIs();
        initCharts();
    } else {
        document.getElementById('password-error').style.display = 'block';
    }
}

// --- Step 3: Dashboard Operations ---

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

        const card = document.createElement('div');
        card.className = 'client-card';
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
                <div class="progress-meta"><span>Progress</span><span>${progress}%</span></div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
            </div>
            <div class="card-footer">
                <div class="owner-info"><div class="avatar-sm">${client.owner[0]}</div><span>${client.owner}</span></div>
                <div class="done-pill ${isDone ? 'active' : ''} ${!isOwner ? 'disabled' : ''}" onclick="toggleClientTask('${client.id}', '${client.owner}')">
                    <i class="ph ${isDone ? 'ph-check-circle-fill' : 'ph-circle'}"></i><span>${isDone ? 'Done' : 'Mark Done'}</span>
                </div>
            </div>
            ${isOwner ? '<div style="position:absolute; top: 0; right: 0; background: var(--primary); color: white; padding: 2px 8px; font-size: 0.6rem; font-weight: 700; border-radius: 0 0 0 8px;">YOU</div>' : ''}
        `;
        grid.appendChild(card);
    });
}

function initCharts() {
    const ctxProgress = document.getElementById('progressChart')?.getContext('2d');
    const ctxSplit = document.getElementById('contentSplitChart')?.getContext('2d');
    if (!ctxProgress || !ctxSplit) return;

    if (progressChart) progressChart.destroy();
    if (contentSplitChart) contentSplitChart.destroy();

    progressChart = new Chart(ctxProgress, {
        type: 'bar',
        data: {
            labels: allClients.map(c => c.name),
            datasets: [{ label: 'Status', data: allClients.map(c => (completedTasks.has(c.id) || c.status === 'completed') ? 100 : 60), backgroundColor: '#f97316', borderRadius: 4 }]
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    contentSplitChart = new Chart(ctxSplit, {
        type: 'doughnut',
        data: {
            labels: ['Posts', 'Videos'],
            datasets: [{ data: [allClients.reduce((acc, c) => acc + c.posts, 0), allClients.reduce((acc, c) => acc + c.videos, 0)], backgroundColor: ['#f97316', '#3b82f6'], borderWidth: 0 }]
        },
        options: { maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });
}

// --- Shared Utilities ---

function updateUIForAuth() {
    if (currentMember) {
        document.getElementById('user-display-short').textContent = currentMember;
    }
}

function logout() {
    currentMember = null;
    selectedRoleKey = null;
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('continue-btn').classList.add('disabled');
    switchScreen('dashboard');
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeModal() { document.getElementById('password-modal').classList.remove('active'); }

function toggleClientTask(id, owner) {
    if (currentMember !== owner) return;
    if (completedTasks.has(id)) completedTasks.delete(id);
    else completedTasks.add(id);
    renderAllClients();
    renderKPIs();
    initCharts();
}

function saveProgress() {
    const toast = document.getElementById('save-status');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function filterClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const owner = document.getElementById('ownerFilter').value;
    const status = document.getElementById('statusFilter').value;

    const filtered = allClients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm);
        const matchesOwner = owner === 'all' || c.owner === owner;
        const isDone = c.status === 'completed' || completedTasks.has(c.id);
        const matchesStatus = status === 'all' || (status === 'completed' && isDone) || (status === 'pending' && !isDone);
        return matchesSearch && matchesOwner && matchesStatus;
    });
    renderAllClients(filtered);
}

init();
