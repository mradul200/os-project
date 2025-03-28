// Main Application Controller
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modules
    SecurityModule.init();
    SystemModule.init();
    
    // Setup UI event listeners
    setupNavigation();
    setupSystemCallManagement();
    setupPolicyManagement();
    setupActivityMonitor();
    
    // Load initial data
    updateDashboard();
    loadSystemCalls();
    loadActivityLogs();
    
    // Start system monitoring
    startSystemMonitoring();
});

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar li');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            
            // Load section-specific data
            switch(sectionId) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'syscalls':
                    loadSystemCalls();
                    break;
                case 'policies':
                    loadPolicyEditor();
                    break;
                case 'monitor':
                    loadActivityLogs();
                    break;
            }
        });
    });
}

// Dashboard Functions
function updateDashboard() {
    // Update system metrics
    const systemInfo = SystemModule.getSystemInfo();
    
    document.getElementById('cpu-usage').textContent = `${systemInfo.cpu}%`;
    document.getElementById('mem-usage').textContent = `${systemInfo.memory}%`;
    document.getElementById('security-level').textContent = SecurityModule.getSecurityLevel();
    
    // Update security status indicator
    const securityStatus = document.getElementById('security-status');
    securityStatus.className = 'security-status';
    securityStatus.classList.add(SecurityModule.getSecurityLevel().toLowerCase());
    
    // Update chart
    updateSyscallChart();
}

function updateSyscallChart() {
    const ctx = document.getElementById('syscallChart').getContext('2d');
    const syscallStats = SystemModule.getSyscallStats();
    
    if (window.syscallChart) {
        window.syscallChart.destroy();
    }
    
    window.syscallChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: syscallStats.labels,
            datasets: [{
                label: 'System Call Usage',
                data: syscallStats.data,
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// System Call Management
function setupSystemCallManagement() {
    // Search functionality
    document.getElementById('syscall-search').addEventListener('input', function() {
        filterSystemCalls(this.value);
    });
    
    // Add new system call button
    document.getElementById('add-syscall').addEventListener('click', function() {
        document.getElementById('syscall-modal').classList.add('active');
    });
    
    // System call form submission
    document.getElementById('syscall-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('syscall-name').value;
        const description = document.getElementById('syscall-desc').value;
        const status = document.getElementById('syscall-status').value;
        
        const capabilities = [];
        document.querySelectorAll('input[name="capabilities"]:checked').forEach(cb => {
            capabilities.push(cb.value);
        });
        
        const success = SystemModule.addSystemCall({
            name,
            description,
            capabilities,
            status
        });
        
        if (success) {
            SecurityModule.logActivity('SYSCALL_ADD', `Added system call: ${name}`);
            loadSystemCalls();
            closeModal('syscall-modal');
            this.reset();
        } else {
            alert('Failed to add system call. It may already exist.');
        }
    });
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
}

function loadSystemCalls() {
    const syscalls = SystemModule.getAllSystemCalls();
    const tableBody = document.getElementById('syscall-table-body');
    tableBody.innerHTML = '';
    
    syscalls.forEach((syscall, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${syscall.name}</td>
            <td>${syscall.description}</td>
            <td>${syscall.capabilities.join(', ')}</td>
            <td><span class="status-badge ${syscall.status}">${syscall.status}</span></td>
            <td>
                <button class="btn-icon" data-action="edit" data-id="${syscall.name}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon danger" data-action="delete" data-id="${syscall.name}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const syscallName = this.getAttribute('data-id');
            editSystemCall(syscallName);
        });
    });
    
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const syscallName = this.getAttribute('data-id');
            deleteSystemCall(syscallName);
        });
    });
}

function filterSystemCalls(searchTerm) {
    const rows = document.querySelectorAll('#syscall-table-body tr');
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function editSystemCall(name) {
    const syscall = SystemModule.getSystemCall(name);
    if (!syscall) return;
    
    document.getElementById('syscall-name').value = syscall.name;
    document.getElementById('syscall-desc').value = syscall.description;
    document.getElementById('syscall-status').value = syscall.status;
    
    // Clear all checkboxes first
    document.querySelectorAll('input[name="capabilities"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Check the ones that apply
    syscall.capabilities.forEach(cap => {
        const checkbox = document.querySelector(`input[name="capabilities"][value="${cap}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    document.getElementById('syscall-modal').classList.add('active');
}

function deleteSystemCall(name) {
    if (confirm(`Are you sure you want to delete the system call "${name}"?`)) {
        const success = SystemModule.removeSystemCall(name);
        if (success) {
            SecurityModule.logActivity('SYSCALL_REMOVE', `Removed system call: ${name}`);
            loadSystemCalls();
        }
    }
}

// Policy Management
function setupPolicyManagement() {
    // Policy list item clicks
    document.querySelectorAll('#policy-list li').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('#policy-list li').forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            loadPolicyContent(this.getAttribute('data-policy'));
        });
    });
    
    // New policy button
    document.getElementById('new-policy').addEventListener('click', function() {
        document.getElementById('policy-modal').classList.add('active');
    });
    
    // Policy form submission
    document.getElementById('policy-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('policy-name').value;
        const description = document.getElementById('policy-desc').value;
        const basePolicy = document.getElementById('policy-base').value;
        
        const success = SecurityModule.createPolicy(name, description, basePolicy);
        
        if (success) {
            SecurityModule.logActivity('POLICY_CREATE', `Created policy: ${name}`);
            loadPolicyEditor();
            closeModal('policy-modal');
            this.reset();
        } else {
            alert('Failed to create policy. A policy with that name may already exist.');
        }
    });
    
    // Save policy button
    document.getElementById('save-policy').addEventListener('click', function() {
        const policyName = document.getElementById('policy-select').value;
        const policyContent = document.getElementById('policy-text').value;
        
        const success = SecurityModule.savePolicy(policyName, policyContent);
        
        if (success) {
            SecurityModule.logActivity('POLICY_SAVE', `Saved policy: ${policyName}`);
            alert('Policy saved successfully!');
        } else {
            document.getElementById('policy-errors').textContent = 'Failed to save policy. Please check the syntax.';
        }
    });
    
    // Policy select change
    document.getElementById('policy-select').addEventListener('change', function() {
        loadPolicyContent(this.value);
    });
}

function loadPolicyEditor() {
    const policies = SecurityModule.getAllPolicies();
    const policyList = document.getElementById('policy-list');
    policyList.innerHTML = '';
    
    policies.forEach(policy => {
        const li = document.createElement('li');
        li.textContent = policy.name;
        li.setAttribute('data-policy', policy.id);
        policyList.appendChild(li);
    });
    
    // Add the "New Policy" button back
    const newPolicyBtn = document.createElement('button');
    newPolicyBtn.id = 'new-policy';
    newPolicyBtn.className = 'btn secondary';
    newPolicyBtn.innerHTML = '<i class="fas fa-plus"></i> New Policy';
    policyList.appendChild(newPolicyBtn);
    
    // Set up event listeners again
    setupPolicyManagement();
    
    // Load the first policy by default
    if (policies.length > 0) {
        document.querySelector('#policy-list li').click();
    }
}

function loadPolicyContent(policyId) {
    const policy = SecurityModule.getPolicy(policyId);
    if (!policy) return;
    
    document.getElementById('policy-select').value = policyId;
    document.getElementById('policy-text').value = policy.content;
    document.getElementById('policy-errors').textContent = '';
}

// Activity Monitor
function setupActivityMonitor() {
    // Filter change
    document.getElementById('log-filter').addEventListener('change', function() {
        filterActivityLogs(this.value);
    });
    
    // Clear logs button
    document.getElementById('clear-logs').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all activity logs?')) {
            SecurityModule.clearLogs();
            loadActivityLogs();
            SecurityModule.logActivity('LOGS_CLEAR', 'Activity logs cleared');
        }
    });
}

function loadActivityLogs() {
    const logs = SecurityModule.getLogs();
    const tableBody = document.getElementById('log-table-body');
    tableBody.innerHTML = '';
    
    logs.forEach(log => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.type}</td>
            <td>${log.message}</td>
            <td><span class="log-status ${log.status}">${log.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

function filterActivityLogs(filter) {
    const rows = document.querySelectorAll('#log-table-body tr');
    
    rows.forEach(row => {
        const type = row.cells[1].textContent;
        let shouldShow = true;
        
        if (filter === 'syscall' && !type.includes('SYSCALL')) {
            shouldShow = false;
        } else if (filter === 'security' && !type.includes('POLICY') && !type.includes('SECURITY')) {
            shouldShow = false;
        } else if (filter === 'warning' && !row.cells[3].textContent.includes('warning')) {
            shouldShow = false;
        }
        
        row.style.display = shouldShow ? '' : 'none';
    });
}

// System Monitoring
function startSystemMonitoring() {
    // Update system metrics every 5 seconds
    setInterval(() => {
        if (document.querySelector('.content-section.active').id === 'dashboard') {
            updateDashboard();
        }
    }, 5000);
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Global functions for inline event handlers
window.editSystemCall = editSystemCall;
window.deleteSystemCall = deleteSystemCall;