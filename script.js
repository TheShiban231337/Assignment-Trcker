// State Management
const savedAssignments = localStorage.getItem('tracker_assignments');
let assignments = savedAssignments ? JSON.parse(savedAssignments) : [];
let currentTab = 'dashboard';

// Initialize App on Load
window.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    
    if (savedAssignments === null) {
        loadSampleData(true);
    } else {
        refreshAppData();
    }
});

// Live Clock in Header
function updateClock() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('live-clock').innerText = now.toLocaleDateString('en-US', options);
}

// Tab Switching Logic
function switchTab(tabId) {
    currentTab = tabId;
    const tabs = ['dashboard', 'add-assignment', 'all-assignments', 'completed'];
    
    tabs.forEach(t => {
        const section = document.getElementById(`tab-${t}`);
        const navBtn = document.getElementById(`nav-${t}`);
        if (t === tabId) {
            section.classList.remove('hidden');
            navBtn.classList.add('bg-slate-800', 'text-white', 'shadow-inner');
            navBtn.classList.remove('text-slate-300');
        } else {
            section.classList.add('hidden');
            navBtn.classList.remove('bg-slate-800', 'text-white', 'shadow-inner');
            navBtn.classList.add('text-slate-300');
        }
    });

    // Update Header Title
    const titles = {
        'dashboard': 'Dashboard Overview',
        'add-assignment': 'Assignment Form',
        'all-assignments': 'All Assignments Management',
        'completed': 'Completed Assignments'
    };
    document.getElementById('current-page-title').innerText = titles[tabId];

    // Refresh UI for specific tabs
    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'all-assignments') {
        populateSubjectFilter();
        renderAssignmentsList();
    }
    if (tabId === 'completed') renderCompletedList();
    
    // Reset form if navigating away from add-assignment without editing
    if (tabId !== 'add-assignment' && !document.getElementById('edit-id').value) {
        resetAssignmentForm();
    }
}

// Save to LocalStorage & Refresh
function saveData() {
    localStorage.setItem('tracker_assignments', JSON.stringify(assignments));
    refreshAppData();
}

function refreshAppData() {
    updateBadges();
    updateSidebarReminder();
    if (currentTab === 'dashboard') renderDashboard();
    if (currentTab === 'all-assignments') renderAssignmentsList();
    if (currentTab === 'completed') renderCompletedList();
}

// Badges Count
function updateBadges() {
    const total = assignments.length;
    const completedCount = assignments.filter(a => a.completed).length;
    document.getElementById('badge-all').innerText = total;
    document.getElementById('badge-completed').innerText = completedCount;
}

// Sidebar Reminder
function updateSidebarReminder() {
    const now = new Date();
    const upcomingUrgent = assignments.filter(a => {
        if (a.completed) return false;
        const due = new Date(a.dueDate);
        const diffHours = (due - now) / (1000 * 60 * 60);
        return diffHours >= 0 && diffHours <= 48;
    });

    const reminderEl = document.getElementById('sidebar-reminder-text');
    if (upcomingUrgent.length > 0) {
        reminderEl.innerHTML = `<span class="text-amber-400 font-semibold">${upcomingUrgent.length} task(s)</span> due within the next 48 hours!`;
    } else {
        reminderEl.innerText = "All caught up! No urgent deadlines in the next 48 hours.";
    }
}

// Demo Sample Data Loader
function loadSampleData(silent = false) {
    const now = new Date();
    const sample = [
        {
            id: 'demo-1',
            title: 'Calculus Problem Set 4',
            subject: 'Mathematics 101',
            dueDate: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString().slice(0, 16), // Overdue
            priority: 'High',
            description: 'Complete problems 1 through 25 on differential equations.',
            completed: false
        },
        {
            id: 'demo-2',
            title: 'Physics Lab Report: Pendulum Oscillation',
            subject: 'Physics 202',
            dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 10).toISOString().slice(0, 16), // Due today
            priority: 'High',
            description: 'Include uncertainty calculations and graphs in Appendix B.',
            completed: false
        },
        {
            id: 'demo-3',
            title: 'History Essay Draft',
            subject: 'World History',
            dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 72).toISOString().slice(0, 16), // Due in 3 days
            priority: 'Medium',
            description: 'Minimum 1,500 words on the Industrial Revolution impact.',
            completed: false
        },
        {
            id: 'demo-4',
            title: 'Data Structures Quiz Prep',
            subject: 'Computer Science',
            dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 120).toISOString().slice(0, 16), // Due in 5 days
            priority: 'Low',
            description: 'Review Binary Search Trees and Graph traversal algorithms.',
            completed: true
        }
    ];
    assignments = sample;
    saveData();
    if (!silent) showToast('Loaded sample demo assignments successfully!', 'success');
}

function openSampleDataModal() {
    if (confirm('Load sample demo data? This will reset your current assignments.')) {
        loadSampleData(false);
    }
}

// Render Dashboard
function renderDashboard() {
    const now = new Date();
    let total = assignments.length;
    let completed = assignments.filter(a => a.completed).length;
    let overdue = assignments.filter(a => !a.completed && new Date(a.dueDate) < now).length;
    let pending = total - completed;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pending').innerText = pending;
    document.getElementById('stat-completed').innerText = completed;
    document.getElementById('stat-overdue').innerText = overdue;

    // Urgent / Overdue List
    const urgentContainer = document.getElementById('urgent-container');
    const urgentList = document.getElementById('urgent-list');
    const urgentTasks = assignments.filter(a => {
        if (a.completed) return false;
        const due = new Date(a.dueDate);
        return due < now || (due - now) / (1000 * 60 * 60) <= 24;
    });

    if (urgentTasks.length > 0) {
        urgentContainer.classList.remove('hidden');
        urgentList.innerHTML = urgentTasks.map(a => createAssignmentCardHTML(a, true)).join('');
    } else {
        urgentContainer.classList.add('hidden');
    }

    // Upcoming List (next 7 days)
    const upcomingList = document.getElementById('dashboard-upcoming-list');
    const upcomingTasks = assignments.filter(a => {
        if (a.completed) return false;
        const due = new Date(a.dueDate);
        const diffHours = (due - now) / (1000 * 60 * 60);
        return diffHours > 24 && diffHours <= 168; // 24h to 7 days
    }).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (upcomingTasks.length > 0) {
        upcomingList.innerHTML = upcomingTasks.map(a => createAssignmentCardHTML(a, false)).join('');
    } else {
        upcomingList.innerHTML = `<div class="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-sm">No upcoming assignments scheduled for the next 7 days. Excellent!</div>`;
    }
}

// Render All Assignments List
function renderAssignmentsList() {
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const subjectFilter = document.getElementById('filter-subject').value;
    const sortBy = document.getElementById('sort-by').value;
    const now = new Date();

    let filtered = assignments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchVal) || 
                              a.subject.toLowerCase().includes(searchVal) || 
                              (a.description && a.description.toLowerCase().includes(searchVal));
        
        if (!matchesSearch) return false;

        const isOverdue = !a.completed && new Date(a.dueDate) < now;

        if (statusFilter === 'pending' && (a.completed || isOverdue)) return false;
        if (statusFilter === 'completed' && !a.completed) return false;
        if (statusFilter === 'overdue' && !isOverdue) return false;

        if (subjectFilter !== 'all' && a.subject !== subjectFilter) return false;

        return true;
    });

    // Sorting
    filtered.sort((a, b) => {
        if (sortBy === 'dueDateAsc') return new Date(a.dueDate) - new Date(b.dueDate);
        if (sortBy === 'dueDateDesc') return new Date(b.dueDate) - new Date(a.dueDate);
        if (sortBy === 'priority') {
            const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === 'title') return a.title.localeCompare(b.title);
    });

    const grid = document.getElementById('assignments-grid');
    if (filtered.length > 0) {
        grid.innerHTML = filtered.map(a => createAssignmentCardHTML(a, false)).join('');
    } else {
        grid.innerHTML = `<div class="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">No assignments found matching your filter criteria.</div>`;
    }
}

// Render Completed List
function renderCompletedList() {
    const grid = document.getElementById('completed-grid');
    const completedTasks = assignments.filter(a => a.completed);

    if (completedTasks.length > 0) {
        grid.innerHTML = completedTasks.map(a => createAssignmentCardHTML(a, false)).join('');
    } else {
        grid.innerHTML = `<div class="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">No completed assignments yet. Keep working!</div>`;
    }
}

// Populate Subject Filter Dropdown
function populateSubjectFilter() {
    const select = document.getElementById('filter-subject');
    const subjects = [...new Set(assignments.map(a => a.subject))];
    const currentVal = select.value;

    select.replaceChildren(new Option('All Subjects', 'all'));
    subjects.forEach(subject => select.add(new Option(subject, subject)));

    if (subjects.includes(currentVal)) {
        select.value = currentVal;
    }
}

// Helper: Create HTML card for assignment
function createAssignmentCardHTML(a, isUrgentHighlight) {
    const now = new Date();
    const dueDate = new Date(a.dueDate);
    const isOverdue = !a.completed && dueDate < now;
    
    // Status & badge styles
    let statusBadge = '';
    let borderStyle = 'border-slate-800 bg-slate-900';
    
    if (a.completed) {
        statusBadge = `<span class="bg-teal-500/10 text-teal-400 text-xs px-2.5 py-1 rounded-lg font-medium border border-teal-500/20"><i class="fa-solid fa-check mr-1"></i> Completed</span>`;
        borderStyle = 'border-slate-800/80 bg-slate-900/60 opacity-80';
    } else if (isOverdue) {
        statusBadge = `<span class="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded-lg font-medium border border-rose-500/20 animate-pulse"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Overdue</span>`;
        borderStyle = 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-900';
    } else {
        statusBadge = `<span class="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-lg font-medium border border-indigo-500/20"><i class="fa-solid fa-clock mr-1"></i> Pending</span>`;
    }

    // Priority badge
    const priorityColors = {
        'High': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        'Medium': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Low': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };

    const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return `
        <div class="border ${borderStyle} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all hover:border-slate-700">
            <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">${escapeHTML(a.subject)}</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-0.5 rounded border font-medium ${priorityColors[a.priority] || ''}">${a.priority}</span>
                        ${statusBadge}
                    </div>
                </div>

                <div>
                    <h4 class="text-base font-bold text-white leading-snug">${escapeHTML(a.title)}</h4>
                    <p class="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
                        <i class="fa-regular fa-calendar-days text-indigo-400"></i>
                        <span>Due: ${formattedDate}</span>
                    </p>
                </div>

                ${a.description ? `<p class="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 line-clamp-2">${escapeHTML(a.description)}</p>` : ''}
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <button onclick="toggleComplete('${a.id}')" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${a.completed ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30'}">
                    <i class="fa-solid ${a.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                    <span>${a.completed ? 'Mark Pending' : 'Mark Completed'}</span>
                </button>
                
                <div class="flex items-center space-x-1">
                    <button onclick="editAssignment('${a.id}')" title="Edit Assignment" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="deleteAssignment('${a.id}')" title="Delete Assignment" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Form Submit Handler (Add / Update)
function handleFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-id').value;
    const title = document.getElementById('input-title').value.trim();
    const subject = document.getElementById('input-subject').value.trim();
    const dueDate = document.getElementById('input-duedate').value;
    const priority = document.getElementById('input-priority').value;
    const description = document.getElementById('input-description').value.trim();

    if (!title || !subject || !dueDate) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (editId) {
        // Update existing
        const index = assignments.findIndex(a => a.id === editId);
        if (index !== -1) {
            assignments[index] = {
                ...assignments[index],
                title, subject, dueDate, priority, description
            };
            showToast('Assignment updated successfully!', 'success');
        }
    } else {
        // Create new
        const newAssignment = {
            id: 'asn-' + Date.now(),
            title, subject, dueDate, priority, description,
            completed: false
        };
        assignments.unshift(newAssignment);
        showToast('Assignment added successfully!', 'success');
    }

    saveData();
    resetAssignmentForm();
    switchTab('dashboard');
}

// Edit Assignment prep
function editAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;

    document.getElementById('edit-id').value = assignment.id;
    document.getElementById('input-title').value = assignment.title;
    document.getElementById('input-subject').value = assignment.subject;
    document.getElementById('input-duedate').value = assignment.dueDate;
    document.getElementById('input-priority').value = assignment.priority;
    document.getElementById('input-description').value = assignment.description || '';

    document.getElementById('form-heading').innerText = 'Edit Assignment';
    document.getElementById('form-submit-btn').innerText = 'Update Assignment';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

    switchTab('add-assignment');
}

// Reset Form
function resetAssignmentForm() {
    document.getElementById('assignment-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('form-heading').innerText = 'Add New Assignment';
    document.getElementById('form-submit-btn').innerText = 'Save Assignment';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

// Toggle Complete
function toggleComplete(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        assignment.completed = !assignment.completed;
        saveData();
        showToast(assignment.completed ? 'Marked as completed! Great job 🎉' : 'Marked as pending.', 'success');
    }
}

// Delete Assignment
function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        assignments = assignments.filter(a => a.id !== id);
        saveData();
        showToast('Assignment deleted.', 'info');
    }
}

// Custom Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const bgColors = {
        'success': 'bg-emerald-600 text-white border-emerald-500',
        'error': 'bg-rose-600 text-white border-rose-500',
        'info': 'bg-slate-800 text-slate-200 border-slate-700'
    };

    const icons = {
        'success': 'fa-circle-check',
        'error': 'fa-circle-exclamation',
        'info': 'fa-circle-info'
    };

    toast.className = `pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all transform translate-y-2 opacity-0 ${bgColors[type] || bgColors['info']}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons['info']} text-base"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Security Escape Helper
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
