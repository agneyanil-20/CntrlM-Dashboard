// --- Data & State Management ---

const defaultClients = [
    { id: 'cli1', name: 'Speeki English', cycle: '19–19', posts: 6, videos: 0, designOwner: '', videoOwner: 'Shaun', designStatus: 'pending', videoStatus: 'progress', startDate: '2026-03-25', links: [], history: [] },
    { id: 'cli2', name: 'Speeki German', cycle: '12–12', posts: 9, videos: 0, designOwner: '', videoOwner: 'Shaun', designStatus: 'pending', videoStatus: 'completed', startDate: '2026-03-10', links: [], history: [] },
    { id: 'cli3', name: 'Stray Dogs AI', cycle: '19–19', posts: 15, videos: 0, designOwner: '', videoOwner: 'Adhil', designStatus: 'pending', videoStatus: 'progress', startDate: '2026-03-20', links: [], history: [] },
    { id: 'cli4', name: 'Fabrich', cycle: '17–17', posts: 6, videos: 1, designOwner: 'Neha', videoOwner: 'Adhil', designStatus: 'progress', videoStatus: 'progress', startDate: '2026-03-15', links: [], history: [] },
    { id: 'cli5', name: 'Techolas', cycle: '12–12', posts: 4, videos: 0, designOwner: 'Neha', videoOwner: 'Abhay', designStatus: 'completed', videoStatus: 'completed', startDate: '2026-03-05', links: [], history: [] },
    { id: 'cli6', name: 'Nails by Rita', cycle: '19–19', posts: 10, videos: 3, designOwner: 'Neha', videoOwner: 'Abhay', designStatus: 'delayed', videoStatus: 'delayed', startDate: '2026-03-28', links: [], history: [] },
    { id: 'cli7', name: 'Santa Maria', cycle: '—', posts: 0, videos: 0, designOwner: '', videoOwner: 'Hari', designStatus: 'pending', videoStatus: 'progress', startDate: '2026-03-12', links: [], history: [] },
    { id: 'cli8', name: 'Soly Denim', cycle: '—', posts: 6, videos: 0, designOwner: '', videoOwner: 'Hari', designStatus: 'pending', videoStatus: 'progress', startDate: '2026-03-18', links: [], history: [] },
    { id: 'cli9', name: 'Matti', cycle: '—', posts: 3, videos: 0, designOwner: '', videoOwner: 'SIJIN', designStatus: 'pending', videoStatus: 'completed', startDate: '2026-03-22', links: [], history: [] },
    { id: 'cli10', name: 'Zoholand', cycle: '—', posts: 6, videos: 0, designOwner: '', videoOwner: 'SIJIN', designStatus: 'pending', videoStatus: 'delayed', startDate: '2026-03-26', links: [], history: [] },
    { id: 'cli11', name: 'Tredha', cycle: '19–19', posts: 12, videos: 0, designOwner: 'Agney', videoOwner: '', designStatus: 'progress', videoStatus: 'pending', startDate: '2026-03-20', links: [], history: [] }
];

const memberPasswords = {
    'Agney': 'agney123', 'Neha': 'neha123', 'Nived': 'nived123',
    'SIJIN': 'sijin123', 'Abhay': 'abhay123', 'Adhil': 'adil123',
    'Shaun': 'shawn123', 'Hari': 'hari123', 'admin': 'admin123'
};

const teams = {
    'graphic-design': { title: 'Graphic Designers', members: ['Agney', 'Neha', 'Nived'] },
    'video-production': { title: 'Video Editors', members: ['SIJIN', 'Abhay', 'Adhil', 'Shaun', 'Hari'] }
};

let allClients = JSON.parse(localStorage.getItem('cntrlm_clients_v4')) || defaultClients;

if (!localStorage.getItem('mapping_updated_v4')) {
    allClients = defaultClients;
    localStorage.setItem('cntrlm_clients_v4', JSON.stringify(allClients));
    localStorage.setItem('mapping_updated_v4', 'true');
}

let selectedRoleKey = null;
let currentMember = null;
let currentView = 'grid';
let activeFilters = { role: 'all', owner: 'all', status: 'all' };
let progressChart = null;

// --- Initialization ---
function init() {
    renderKPIs();
    renderAllClients();
    initCharts();
    populateOwnerChips();
}

function syncToCloud() {
    localStorage.setItem('cntrlm_clients_v4', JSON.stringify(allClients));
}

// --- Utilities ---
function getDaysRemaining(startDateStr) {
    const startDate = new Date(startDateStr);
    const today = new Date();
    const cycleDays = 30;
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = cycleDays - (diffDays || 0);
    return remaining > 0 ? remaining : 0;
}

function getDeadlineClass(days) {
    if (days > 15) return 'deadline-safe';
    if (days > 5) return 'deadline-soon';
    return 'deadline-critical';
}

function getProgressNum(status) {
    if (status === 'completed') return 100;
    if (status === 'progress') return 60;
    if (status === 'delayed') return 30;
    return 10;
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
        else { 
            switchScreen('client-board'); 
            init(); 
            document.getElementById('user-display-short').textContent = currentMember; 
            document.getElementById('user-avatar-tiny').textContent = currentMember[0]; 
        }
    } else {
        document.getElementById('password-error').style.display = 'block';
    }
}

function closeModal() { document.getElementById('password-modal').classList.remove('active'); }

// --- Filtering ---
function populateOwnerChips() {
    const mems = Array.from(new Set([...teams['graphic-design'].members, ...teams['video-production'].members]));
    const container = document.getElementById('owner-chips');
    if (!container) return;
    container.innerHTML = `<span class="chip active" onclick="setChipFilter('owner', 'all')">All</span>` + 
        mems.map(m => `<span class="chip" onclick="setChipFilter('owner', '${m}')">${m}</span>`).join('');
}

function setChipFilter(type, value) {
    activeFilters[type] = value;
    const container = document.getElementById(`${type}-chips`);
    if (container) {
        container.querySelectorAll('.chip').forEach(c => {
            const isAll = c.textContent.trim() === 'All' && value === 'all';
            const matchesValue = c.textContent.trim() === value;
            c.classList.toggle('active', isAll || matchesValue);
        });
    }
    renderAllClients();
}

function getFilteredList() {
    const searchTerm = document.getElementById('clientSearch')?.value.toLowerCase() || '';
    return allClients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm);
        let matchesRole = true;
        if (activeFilters.role === 'graphic-design') matchesRole = !!c.designOwner;
        else if (activeFilters.role === 'video-production') matchesRole = !!c.videoOwner;
        const matchesOwner = activeFilters.owner === 'all' || c.designOwner === activeFilters.owner || c.videoOwner === activeFilters.owner;
        let matchesStatus = true;
        if (activeFilters.status === 'completed') matchesStatus = (c.designOwner ? c.designStatus === 'completed' : true) && (c.videoOwner ? c.videoStatus === 'completed' : true);
        else if (activeFilters.status === 'progress') matchesStatus = (c.designStatus === 'progress' || c.videoStatus === 'progress');
        return matchesSearch && matchesRole && matchesOwner && matchesStatus;
    });
}

function renderAllClients(filteredList = null) {
    if (!filteredList) filteredList = getFilteredList();
    const grid = document.getElementById('all-clients-grid');
    if (!grid) return;
    grid.innerHTML = '';
    grid.className = `clients-feed ${currentView}-view role-based-grid`;

    filteredList.forEach((client, index) => {
        const days = getDaysRemaining(client.startDate);
        const card = document.createElement('div');
        card.className = 'client-card split-layout anim-slide-up';
        card.style.animationDelay = `${index * 0.05}s`;

        const sections = [
            { type: 'design', label: 'Design', icon: 'paint-brush', owner: client.designOwner, status: client.designStatus },
            { type: 'video', label: 'Video Editing', icon: 'video-camera', owner: client.videoOwner, status: client.videoStatus }
        ];

        let sectionsHTML = '';
        sections.forEach(s => {
            if (!s.owner) return;
            const isDone = s.status === 'completed';
            const isOwner = currentMember === s.owner;
            const btnClass = isOwner ? (isDone ? 'btn-mark-done active' : 'btn-mark-done') : 'btn-mark-done disabled';
            const progress = getProgressNum(s.status);
            const btnText = isOwner ? (isDone ? 'Done' : 'Mark Done') : (isDone ? 'Done' : 'Assigned to ' + s.owner);

            sectionsHTML += `
                <div class="task-section ${s.type}-section">
                    <div class="section-top">
                        <div class="section-label"><i class="ph ph-${s.icon}"></i> ${s.label}</div>
                        <span class="status-badge status-${s.status}">${s.status.toUpperCase()}</span>
                    </div>
                    <div class="owner-chip">
                        <div class="avatar-sm" style="background:#0F3F41">${s.owner[0]}</div>
                        <span>${s.owner}</span>
                    </div>
                    <div class="progress-bar-thin"><div class="progress-fill-thin bg-${s.status}" style="width: ${progress}%;"></div></div>
                    <div class="${btnClass}" onclick="toggleTask('${client.id}', '${s.type}', event)">
                        <i class="ph ${isDone ? 'ph-check-circle-fill' : 'ph-circle'}"></i> <span>${btnText}</span>
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="card-top" style="margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                <div class="card-top-flex">
                    <div class="client-label"><h3>${client.name}</h3></div>
                    <div class="deadline-chip ${getDeadlineClass(days)}">${days} days left</div>
                </div>
            </div>
            <div class="split-sections">${sectionsHTML}</div>
        `;
        // Allow everyone to view report but restrict edits inside
        card.onclick = (e) => { if (!e.target.closest('.btn-mark-done')) openClientReport(client.id); };
        grid.appendChild(card);
    });
}

function toggleTask(id, type, e) {
    e.stopPropagation();
    const client = allClients.find(c => c.id === id);
    if (!client) return;
    const owner = type === 'design' ? client.designOwner : client.videoOwner;
    if (currentMember !== owner) return; // STRICT PERMISSION

    if (type === 'design') client.designStatus = client.designStatus === 'completed' ? 'progress' : 'completed';
    else client.videoStatus = client.videoStatus === 'completed' ? 'progress' : 'completed';
    
    syncToCloud(); 
    renderAllClients(); 
    renderKPIs();
    initCharts();
}

// --- Report Screen ---
function openClientReport(clientId) {
    const client = allClients.find(c => c.id === clientId);
    window.currentReportClientId = clientId;
    const isOwner = client.designOwner === currentMember || client.videoOwner === currentMember;
    
    document.getElementById('report-client-name').textContent = client.name;
    document.getElementById('report-status-badge').textContent = 'CLIENT OVERVIEW';
    document.getElementById('report-days-left').textContent = getDaysRemaining(client.startDate);
    
    const overallProgress = ((client.designOwner ? getProgressNum(client.designStatus) : 0) + (client.videoOwner ? getProgressNum(client.videoStatus) : 0)) / ((client.designOwner ? 1 : 0) + (client.videoOwner ? 1 : 0));
    document.getElementById('report-progress-pct').textContent = Math.round(overallProgress) + '%';
    document.getElementById('report-progress-fill').style.width = overallProgress + '%';

    // Show/Hide Edit tools based on ownership
    const editBtn = document.querySelector('.btn-add-detail') || document.createElement('button');
    if (isOwner) {
        editBtn.className = 'btn-primary btn-add-detail';
        editBtn.innerHTML = '<i class="ph ph-note-pencil"></i> Edit Details';
        editBtn.onclick = () => editClientDetails(client);
        if (!document.querySelector('.btn-add-detail')) document.querySelector('.report-header-main').appendChild(editBtn);
    } else if (document.querySelector('.btn-add-detail')) {
        document.querySelector('.btn-add-detail').remove();
    }

    renderReportLinks(client);
    switchScreen('client-report');
}

function editClientDetails(client) {
    const newPosts = prompt(`Edit Post Count (Current: ${client.posts})`, client.posts);
    const newVideos = prompt(`Edit Video Count (Current: ${client.videos})`, client.videos);
    const newCycle = prompt(`Edit Date Cycle (Current: ${client.cycle})`, client.cycle);
    
    if (newPosts !== null) client.posts = parseInt(newPosts);
    if (newVideos !== null) client.videos = parseInt(newVideos);
    if (newCycle !== null) client.cycle = newCycle;
    
    syncToCloud();
    openClientReport(client.id);
    renderAllClients();
}

function renderReportLinks(client) {
    const list = document.getElementById('report-link-list');
    const isOwner = client.designOwner === currentMember || client.videoOwner === currentMember;
    list.innerHTML = client.links.map(link => `
        <div class="link-item">
            <div class="link-info"><a href="${link.url}" target="_blank">${link.url}</a><small>Added by ${link.savedBy}</small></div>
            <i class="ph ph-link"></i>
        </div>
    `).join('') + (isOwner ? `<button class="btn-sm outline" onclick="promptAddLink()">+ Add Link</button>` : '');
}

function promptAddLink() {
    const url = prompt("Enter Link URL:");
    if (url) {
        const client = allClients.find(c => c.id === window.currentReportClientId);
        client.links.push({ url, savedBy: currentMember, date: new Date().toLocaleDateString() });
        syncToCloud();
        renderReportLinks(client);
    }
}

// --- KPI & Analytics ---
function renderKPIs() {
    let total = 0; let done = 0; let pending = 0; let progress = 0;
    allClients.forEach(c => {
        [c.designStatus, c.videoStatus].forEach((s, i) => {
            if ((i === 0 && !c.designOwner) || (i === 1 && !c.videoOwner)) return;
            total++;
            if (s === 'completed') done++;
            else if (s === 'delayed') pending++;
            else progress++;
        });
    });
    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-completed').textContent = done;
    document.getElementById('kpi-pending').textContent = pending;
    if (document.getElementById('kpi-active')) document.getElementById('kpi-active').textContent = progress;
}

function initCharts() {
    const ctx = document.getElementById('progressChart')?.getContext('2d');
    if (!ctx) return;
    if (progressChart) progressChart.destroy();
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allClients.map(c => c.name),
            datasets: [{ label: 'Progress %', data: allClients.map(c => {
                let t = 0; let d = 0; if(c.designOwner){t++;if(c.designStatus==='completed')d++;}if(c.videoOwner){t++;if(c.videoStatus==='completed')d++;}
                return t > 0 ? (d/t)*100 : 0;
            }), backgroundColor: '#FF6A00', borderRadius: 8 }]
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function filterClients() { renderAllClients(); }
init();
