// System Module
const SystemModule = (function() {
    let systemCalls = [
        {
            name: 'open_file',
            description: 'Open a file for reading or writing',
            capabilities: ['READ', 'WRITE'],
            status: 'active'
        },
        {
            name: 'create_process',
            description: 'Create a new process',
            capabilities: ['EXEC'],
            status: 'active'
        },
        {
            name: 'delete_file',
            description: 'Delete a file from the filesystem',
            capabilities: ['WRITE', 'ADMIN'],
            status: 'restricted'
        },
        {
            name: 'modify_permissions',
            description: 'Change file or process permissions',
            capabilities: ['ADMIN'],
            status: 'disabled'
        }
    ];
    
    function init() {
        // Load system calls from localStorage if available
        const savedSyscalls = localStorage.getItem('systemCalls');
        if (savedSyscalls) {
            systemCalls = JSON.parse(savedSyscalls);
        }
    }
    
    function getSystemInfo() {
        return {
            cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
            memory: Math.floor(Math.random() * 40) + 30 // 30-70%
        };
    }
    
    function getAllSystemCalls() {
        return systemCalls.map(syscall => ({ ...syscall }));
    }
    
    function getSystemCall(name) {
        return systemCalls.find(s => s.name === name);
    }
    
    function addSystemCall(syscall) {
        if (systemCalls.some(s => s.name === syscall.name)) {
            return false;
        }
        
        systemCalls.push(syscall);
        saveSystemCalls();
        return true;
    }
    
    function removeSystemCall(name) {
        const index = systemCalls.findIndex(s => s.name === name);
        if (index === -1) return false;
        
        systemCalls.splice(index, 1);
        saveSystemCalls();
        return true;
    }
    
    function saveSystemCalls() {
        localStorage.setItem('systemCalls', JSON.stringify(systemCalls));
    }
    
    function getSyscallStats() {
        return {
            labels: ['open_file', 'create_process', 'delete_file', 'modify_permissions'],
            data: [
                Math.floor(Math.random() * 100) + 50,
                Math.floor(Math.random() * 80) + 30,
                Math.floor(Math.random() * 40) + 10,
                Math.floor(Math.random() * 20)
            ]
        };
    }
    
    return {
        init,
        getSystemInfo,
        getAllSystemCalls,
        getSystemCall,
        addSystemCall,
        removeSystemCall,
        getSyscallStats
    };
})();