// DOM Elements
const libraryFolders = document.querySelectorAll('.folder-card');
const selectedTestName = document.getElementById('selected-test-name');
const selectedTestCount = document.getElementById('selected-test-count');
const testSettings = document.getElementById('test-settings');
const startBtn = document.getElementById('start-btn');

// Logic: Selecting a test from the library
libraryFolders.forEach(folder => {
    folder.addEventListener('click', () => {
        // Remove active state from all
        libraryFolders.forEach(f => f.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50'));
        
        // Add active state to clicked folder
        folder.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');

        // Update Right Panel UI
        const folderName = folder.querySelector('p.font-bold').innerText;
        selectedTestName.innerText = folderName;
        selectedTestCount.innerText = "Ready to start"; 
        
        // Enable Settings & Button
        testSettings.classList.remove('opacity-50', 'pointer-events-none');
        
        // Activate Button
        startBtn.disabled = false;
        startBtn.innerText = "🚀 BISMILLAH";
        startBtn.classList.remove('bg-slate-200', 'text-slate-400', 'cursor-not-allowed');
        startBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700', 'hover:shadow-lg', 'active:scale-[0.98]');
    });
});

// Logic: Clicking Bismillah button[cite: 2]
startBtn.addEventListener('click', () => {
    // 1. Data collect karo[cite: 2]
    const timerValue = document.getElementById('timer-input').value;
    const isShuffle = document.getElementById('shuffle-toggle').checked;
    const testName = selectedTestName.innerText;
    
    // 2. Data ko browser memory mein save karo
    localStorage.setItem('cbt_testName', testName);
    localStorage.setItem('cbt_timeLimit', timerValue);
    localStorage.setItem('cbt_shuffle', isShuffle);
    
    // 3. User ko test.html par bhej do
    window.location.href = 'test.html';
});