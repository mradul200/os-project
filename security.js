// Security Module
const SecurityModule = (function() {
    let securityLevel = 'high';
    let policies = [
        {
            id: 'default',
            name: 'Default Policy',
            description: 'Standard security policy with balanced restrictions',
            content: '// Default security policy\nallow: [READ, WRITE]\nrestrict: [EXEC]\nblock: [ADMIN]'
        },
        {
            id: 'restrictive',
            name: 'Restrictive Policy',
            description: 'Highly restrictive security policy',
            content: '// Restrictive security policy\nallow: [READ]\nrestrict: [WRITE]\nblock: [EXEC, ADMIN]'
        },
        {
            id: 'permissive',
            name: 'Permissive Policy',
            description: 'Lenient security policy for development',
            content: '// Permissive security policy\nallow: [READ, WRITE, EXEC]\nrestrict: [ADMIN]'
        }
    ];
    
    let activityLogs = [];
    
    function init() {
        // Load logs from localStorage if available
        const savedLogs = localStorage.getItem('securityLogs');
        if (savedLogs) {
            activityLogs = JSON.parse(savedLogs);
        }
        
        // Load policies from localStorage if available
        const savedPolicies = localStorage.getItem('securityPolicies');
        if (savedPolicies) {
            policies = JSON.parse(savedPolicies);
        }
        
        logActivity('SYSTEM_START', 'Security subsystem initialized', 'success');
    }
    
    function getSecurityLevel() {
        return securityLevel;
    }
    
    function setSecurityLevel(level) {
        if (['high', 'medium', 'low'].includes(level)) {
            securityLevel = level;
            logActivity('SECURITY_LEVEL_CHANGE', `Security level changed to ${level}`, 'success');
            return true;
        }
        return false;
    }
    
    function getAllPolicies() {
        return policies.map(policy => ({ ...policy }));
    }
    
    function getPolicy(policyId) {
        return policies.find(p => p.id === policyId);
    }
    
    function createPolicy(name, description, basePolicy = 'default') {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        
        if (policies.some(p => p.id === id)) {
            return false;
        }
        
        const base = getPolicy(basePolicy) || { content: '' };
        
        policies.push({
            id,
            name,
            description,
            content: `// ${name}\n${base.content}`
        });
        
        savePolicies();
        return true;
    }
    
    function savePolicy(policyId, content) {
        const policy = getPolicy(policyId);
        if (!policy) return false;
        
        policy.content = content;
        savePolicies();
        return true;
    }
    
    function savePolicies() {
        localStorage.setItem('securityPolicies', JSON.stringify(policies));
    }
    
    function logActivity(type, message, status = 'success') {
        activityLogs.unshift({
            timestamp: Date.now(),
            type,
            message,
            status
        });
        
        // Keep only the last 1000 logs
        if (activityLogs.length > 1000) {
            activityLogs.pop();
        }
        
        saveLogs();
    }
    
    function getLogs() {
        return [...activityLogs];
    }
    
    function clearLogs() {
        activityLogs = [];
        saveLogs();
    }
    
    function saveLogs() {
        localStorage.setItem('securityLogs', JSON.stringify(activityLogs));
    }
    
    return {
        init,
        getSecurityLevel,
        setSecurityLevel,
        getAllPolicies,
        getPolicy,
        createPolicy,
        savePolicy,
        logActivity,
        getLogs,
        clearLogs
    };
})();