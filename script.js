// --- Data & State Management ---

// Default Initial Data with Specific Video Production Mappings
const defaultClients = [
    { id: 'cli1', name: 'Speeki English', cycle: '19–19', posts: 6, videos: 0, status: 'progress', owner: 'Shaun', startDate: '2026-03-25', links: [], history: [] },
    { id: 'cli2', name: 'Speeki German', cycle: '12–12', posts: 9, videos: 0, status: 'completed', owner: 'Shaun', startDate: '2026-03-10', links: [], history: [] },
    { id: 'cli3', name: 'Stray Dogs AI', cycle: '19–19', posts: 15, videos: 0, status: 'progress', owner: 'Adhil', startDate: '2026-03-20', links: [], history: [] },
    { id: 'cli4', name: 'Fabrich', cycle: '17–17', posts: 6, videos: 1, status: 'progress', owner: 'Adhil', startDate: '2026-03-15', links: [], history: [] },
    { id: 'cli5', name: 'Techolas', cycle: '12–12', posts: 4, videos: 0, status: 'completed', owner: 'Abhay', startDate: '2026-03-05', links: [], history: [] },
    { id: 'cli6', name: 'Nails by Rita', cycle: '19–19', posts: 10, videos: 3, status: 'delayed', owner: 'Abhay', startDate: '2026-03-28', links: [], history: [] },
    { id: 'cli7', name: 'Santa Maria', cycle: '—', posts: 0, videos: 0, status: 'progress', owner: 'Hari', startDate: '2026-03-12', links: [], history: [] },
    { id: 'cli8', name: 'Soly Denim', cycle: '—', posts: 6, videos: 0, status: 'progress', owner: 'Hari', startDate: '2026-03-18', links: [], history: [] },
    { id: 'cli9', name: 'Matti', cycle: '—', posts: 3, videos: 0, status: 'completed', owner: 'SIJIN', startDate: '2026-03-22', links: [], history: [] },
    { id: 'cli10', name: 'Zoholand', cycle: '—', posts: 6, videos: 0, status: 'delayed', owner: 'SIJIN', startDate: '2026-03-26', links: [], history: [] },
    { id: 'cli11', name: 'Tredha', cycle: '19–19', posts: 12, videos: 0, status: 'progress', owner: 'Agney', startDate: '2026-03-20', links: [], history: [] },
    { id: 'cli12', name: 'Pantry', cycle: '12–12', posts: 8, videos: 0, status: 'progress', owner: 'Neha', startDate: '2026-03-25', links: [], history: [] }
];

const memberPasswords = {
    'Agney': 'agney123', 'Neha': 'neha123', 'Nived': 'nived123',
    'SIJIN': 'sijin123', 'Abhay': 'abhay123', 'Adhil': 'adil123',
    'Shaun': 'shawn123', 'Hari': 'hari123', 'Megha': 'megha123',
    'Christi': 'christi123', 'Dilna': 'mango123', 'admin': 'admin123'
};

const teams = {
    'graphic-design': { title: 'Graphic Designers', members: ['Agney', 'Neha', 'Nived'] },
    'video-production': { title: 'Video Editors', members: ['SIJIN', 'Abhay', 'Adhil', 'Shaun', 'Hari'] },
    'social-media': { title: 'Social Media Managers', members: ['Megha', 'Christi'] },
    'content-writing': { title: 'Content Writers', members: ['Dilna'] }
};

let allClients = JSON.parse(localStorage.getItem('cntrlm_clients')) || defaultClients;
let completedTasks = new Set(JSON.parse(localStorage.getItem('cntrlm_completed')) || []);

// IMPORTANT: Overwrite with new mapping if user just provided it
// This ensures the new mapping takes effect even if localStorage has old data
const forceNewMapping = true; 
if (forceNewMapping && !localStorage.getItem('mapping_updated_v2')) {
    allClients = defaultClients;
    localStorage.setItem('cntrlm_clients', JSON.stringify(allClients));
    localStorage.setItem('mapping_updated_v2', 'true');
}

let selectedRoleKey = null;
let currentMember = null;
let currentView = 'grid';
let activeFilters = { owner: 'all', status: 'all' };
let progressChart = null;
let currentReportClientId = null;

// --- Initialization ---
function init() {
    renderKPIs();
    renderAllClients();
    initCharts();
}

function syncToCloud() {
    localStorage.setItem('cntrlm_clients', JSON.stringify(allClients));
    localStorage.setItem('cntrlm_completed', JSON.stringify(Array.from(completedTasks)));
}

// --- Utilities ---

function getDaysRemaining(startDateStr) {
    const startDate = new Date(startDateStr);
    const today = new Date();
    const cycleDays = 30;
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = cycleDays - diffDays;
    return remaining > 0 ? remaining : 0;
}

function getDeadlineClass(days) {
    if (days > 15) return 'deadline-safe';
    if (days > 5) return 'deadline-soon';
    return 'deadline-critical';
}

// --- Navigation ---
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function logout() {
    currentMember = null; selectedRoleKey = null; switchScreen('dashboard');
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('continue-btn')?.classList.add('disabled');
}

// --- Selection Logic ---
function selectRole(key) {
    selectedRoleKey = key;
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`role-${key}`).classList.add('selected');
    document.getElementById('continue-btn').classList.remove('disabled');
}

function proceedToNames() {
    if (selectedRoleKey === 'admin') openPasswordModal('admin');
    else showTeam(selectedRoleKey);
}

function showTeam(teamKey) {
    const team = teams[teamKey];
    document.getElementById('team-title').textContent = team.title;
    const list = document.getElementById('member-list');
    list.innerHTML = team.members.map(name => `<div class="member-card" onclick="openPasswordModal('${name}')"><div class="avatar-circle">${name[0]}</div><div class="member-name">${name}</div></div>`).join('');
    switchScreen('details');
}

function openPasswordModal(name) {
    window.targetMember = name;
    document.getElementById('modal-user-name').textContent = name === 'admin' ? 'Administrator' : name;
    document.getElementById('password-modal').classList.add('active');
    document.getElementById('secret-password').value = '';
    setTimeout(() => document.getElementById('secret-password').focus(), 100);
}

function checkPassword() {
    if (document.getElementById('secret-password').value === memberPasswords[window.targetMember]) {
        currentMember = window.targetMember;
        closeModal();
        if (currentMember === 'admin') { switchScreen('admin-panel'); renderAdminList(); }
        else { switchScreen('client-board'); renderKPIs(); renderAllClients(); initCharts(); }
    } else document.getElementById('password-error').style.display = 'block';
}

// --- Client Board Operations ---

function renderAllClients(filteredList = null) {
    if (!filteredList) filteredList = getFilteredList();
    const grid = document.getElementById('all-clients-grid');
    if (!grid) return;
    grid.innerHTML = '';
    grid.className = `clients-feed ${currentView}-view`;

    filteredList.forEach((client, index) => {
        const isOwner = currentMember === client.owner;
        const isDone = client.status === 'completed' || completedTasks.has(client.id);
        const progress = isDone ? 100 : 65;
        const days = getDaysRemaining(client.startDate || '2026-03-01');

        const card = document.createElement('div');
        card.className = 'client-card anim-slide-up';
        card.style.animationDelay = `${index * 0.05}s`;
        card.onclick = (e) => { if (!e.target.closest('.done-pill')) openClientReport(client.id); };

        card.innerHTML = `
            <div class="card-top">
                <div class="card-top-flex">
                    <div class="client-label"><h3>${client.name}</h3><span>${client.cycle}</span></div>
                    <div class="deadline-chip ${getDeadlineClass(days)}">${days} days left</div>
                </div>
            </div>
            <div class="card-stats">
                <div class="stat-item"><i class="ph ph-image"></i> ${client.posts}</div>
                <div class="stat-item"><i class="ph ph-video"></i> ${client.videos}</div>
                <div class="status-badge status-${isDone ? 'completed' : client.status}" style="margin-left: auto;">${isDone ? 'DONE' : client.status.toUpperCase()}</div>
            </div>
            <div class="card-progress">
                <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
            </div>
            <div class="card-footer">
                <div class="owner-info"><div class="avatar-sm">${client.owner[0]}</div><span>${client.owner}</span></div>
                <div class="done-pill ${isDone ? 'active' : ''} ${!isOwner ? 'disabled' : ''}" onclick="toggleClientTask('${client.id}', '${client.owner}', event)">
                    <i class="ph ${isDone ? 'ph-check-circle-fill' : 'ph-circle'}"></i> <span>${isDone ? 'Done' : 'Mark Done'}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- Report Screen Logic ---

function openClientReport(clientId) {
    currentReportClientId = clientId;
    const client = allClients.find(c => c.id === clientId);
    const isDone = client.status === 'completed' || completedTasks.has(client.id);
    const progress = isDone ? 100 : 70;
    const days = getDaysRemaining(client.startDate);

    document.getElementById('report-client-name').textContent = client.name;
    document.getElementById('report-status-badge').className = `status-badge status-${isDone ? 'completed' : client.status}`;
    document.getElementById('report-status-badge').textContent = isDone ? 'COMPLETED' : client.status.toUpperCase();
    document.getElementById('report-days-left').textContent = days;
    document.getElementById('report-progress-pct').textContent = `${progress}%`;
    document.getElementById('report-progress-fill').style.width = `${progress}%`;

    renderReportLinks(client);
    renderReportHistory(client);
    switchScreen('client-report');
}

function renderReportLinks(client) {
    const list = document.getElementById('report-link-list');
    list.innerHTML = client.links.length > 0 ? client.links.map(link => `
        <div class="link-item">
            <div class="link-info">
                <a href="${link.url}" target="_blank">${link.url}</a>
                <small>Added by ${link.savedBy} on ${link.date}</small>
            </div>
            <i class="ph ph-link-simple"></i>
        </div>
    `).join('') : '<p style="color:var(--text-muted); font-size:0.9rem;">No links saved yet.</p>';
}

function renderReportHistory(client) {
    const list = document.getElementById('report-history-list');
    list.innerHTML = client.history && client.history.length > 0 ? client.history.map(row => `
        <tr><td>${row.month}</td><td>${row.posts}</td><td>${row.videos}</td><td><span class="status-badge status-completed">${row.result}</span></td></tr>
    `).join('') : '<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--text-muted);">No history data found.</td></tr>';
}

function promptAddLink() {
    const url = prompt("Enter the URL link to save (e.g. Google Drive, Portfolio):");
    if (url && currentReportClientId) {
        const client = allClients.find(c => c.id === currentReportClientId);
        client.links.push({
            url: url,
            savedBy: currentMember || 'Unknown',
            date: new Date().toLocaleDateString()
        });
        syncToCloud();
        renderReportLinks(client);
    }
}

// --- Admin Panel ---

function renderAdminList() {
    const list = document.getElementById('admin-client-list');
    list.innerHTML = allClients.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.cycle}</td>
            <td>${c.posts}P / ${c.videos}V</td>
            <td>${c.owner}</td>
            <td><span class="status-badge status-${c.status}">${c.status}</span></td>
            <td class="action-btns">
                <button class="edit-btn" onclick="openAdminModal('${c.id}')"><i class="ph ph-note-pencil"></i></button>
                <button class="delete-btn" onclick="deleteClient('${c.id}')"><i class="ph ph-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// --- Filtering & View Toggles ---
function getFilteredList() {
    const searchTerm = document.getElementById('clientSearch')?.value.toLowerCase() || '';
    return allClients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm);
        const matchesOwner = activeFilters.owner === 'all' || c.owner === activeFilters.owner;
        const isDone = c.status === 'completed' || completedTasks.has(c.id);
        const matchesStatus = activeFilters.status === 'all' || (activeFilters.status === 'completed' && isDone) || (activeFilters.status === 'pending' && !isDone);
        return matchesSearch && matchesOwner && matchesStatus;
    });
}
function setView(view) { currentView = view; renderAllClients(); }
function setChipFilter(type, value) { activeFilters[type] = value; renderAllClients(); }
function toggleClientTask(id, owner, e) {
    e.stopPropagation(); if (currentMember !== owner) return;
    if (completedTasks.has(id)) completedTasks.delete(id); else completedTasks.add(id);
    syncToCloud(); renderAllClients(); renderKPIs();
}

// --- Charts ---
function initCharts() {
    const ctx = document.getElementById('progressChart')?.getContext('2d');
    if (!ctx) return;
    if (progressChart) progressChart.destroy();
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allClients.map(c => c.name),
            datasets: [{ label: 'Status', data: allClients.map(c => (completedTasks.has(c.id) || c.status === 'completed') ? 100 : 70), backgroundColor: '#FF6A00', borderRadius: 8 }]
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function renderKPIs() {
    const total = allClients.length;
    const completed = allClients.filter(c => c.status === 'completed' || completedTasks.has(c.id)).length;
    const delayed = allClients.filter(c => c.status === 'delayed' && !completedTasks.has(c.id)).length;
    const active = total - completed - delayed;
    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-completed').textContent = completed;
    document.getElementById('kpi-pending').textContent = delayed;
    if (document.getElementById('kpi-active')) {
        document.getElementById('kpi-active').textContent = active;
    }
}

function closeModal() { document.getElementById('password-modal').classList.remove('active'); }
function filterClients() { renderAllClients(); }
init();
