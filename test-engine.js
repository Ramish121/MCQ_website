// 1. Apna copy kiya hua Raw Link yahan paste karo
const rawUrl = "https://raw.githubusercontent.com/Ramish121/MCQ_website/refs/heads/main/Questions/Psychology/sample.txt";

// State Variables
let questions = [];
let currentIndex = 0;
let userAnswers = {}; // Save user's selected options
let paletteStatuses = {}; // Status logic for NTA palette
let totalTimeMinutes = parseInt(localStorage.getItem('cbt_timeLimit')) || 90;
let timeInSeconds = totalTimeMinutes * 60;

// DOM Elements Connect Karna[cite: 1]
const subjectNameEl = document.getElementById('subject-name');
const currentQNoEl = document.getElementById('current-q-no');
const questionTextEl = document.getElementById('question-text');
const optionsContainerEl = document.getElementById('options-container');
const paletteContainerEl = document.getElementById('question-palette');
const timerDisplayEl = document.getElementById('timer');

// 2. Timer System
function startTimer() {
    const timerInterval = setInterval(() => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        
        // Timer format ko 00:00:00 style mein set karna
        timerDisplayEl.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeInSeconds <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Auto-submitting your test.");
            submitTest();
        } else {
            timeInSeconds--;
        }
    }, 1000);
}

// 3. GitHub Raw Link se Data Fetch aur Parse Karna
async function loadQuestions() {
    try {
        // Test ka naam update karna
        subjectNameEl.innerText = localStorage.getItem('cbt_testName') || "Practice Test";
        
        const response = await fetch(rawUrl);
        if (!response.ok) throw new Error("Data fetch fail ho gaya");
        const text = await response.text();
        
        // <Q> aur <A> tags aur '*' symbol nikalne ka logic
        const qRegex = /<Q>([\s\S]*?)<\/Q>\s*<A>([\s\S]*?)<\/A>/g;
        let match;
        let index = 0;

        while ((match = qRegex.exec(text)) !== null) {
            const qText = match[1].trim();
            const optionsBlock = match[2].trim().split('\n');
            let currentOptions = [];
            let correctAnswer = "";

            optionsBlock.forEach(line => {
                let cleanLine = line.trim();
                if (cleanLine) {
                    let isCorrect = cleanLine.startsWith('*');
                    if (isCorrect) cleanLine = cleanLine.substring(1).trim();
                    currentOptions.push(cleanLine);
                    if (isCorrect) correctAnswer = cleanLine; // Sahi answer ko yaad rakhna
                }
            });

            questions.push({ text: qText, options: currentOptions, correct: correctAnswer });
            
            // NTA format ke mutabik pehla question chhod kar sabko "Not Visited" mark karna
            paletteStatuses[index] = index === 0 ? 'not-answered' : 'not-visited';
            index++;
        }

        renderPalette();
        showQuestion(0);
        startTimer();

    } catch (error) {
        console.error(error);
        questionTextEl.innerText = "Error! Kripya check karein ki Raw URL sahi hai ya nahi aur internet chal raha hai ya nahi.";
    }
}

// 4. Screen Par Question aur Options Dikhana
function showQuestion(index) {
    if (questions.length === 0) return;
    currentIndex = index;
    currentQNoEl.innerText = currentIndex + 1;
    
    const currentQ = questions[currentIndex];
    questionTextEl.innerText = currentQ.text;
    optionsContainerEl.innerHTML = ""; // Purane options hatao

    // Agar Not Visited tha, toh Not Answered bana do
    if (paletteStatuses[currentIndex] === 'not-visited') {
        paletteStatuses[currentIndex] = 'not-answered';
        renderPalette();
    }

    currentQ.options.forEach(option => {
        const isSelected = userAnswers[currentIndex] === option;
        const optionDiv = document.createElement('div');
        
        // Option select hone par style change karna
        optionDiv.className = `flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
            isSelected ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:bg-slate-50'
        }`;
        
        optionDiv.innerHTML = `
            <input type="radio" name="mcq-option" class="w-4 h-4 accent-blue-600" ${isSelected ? 'checked' : ''}>
            <span class="text-sm font-semibold text-slate-700">${option}</span>
        `;
        
        optionDiv.addEventListener('click', () => {
            userAnswers[currentIndex] = option; // Answer save karo
            showQuestion(currentIndex); // UI reload karo
        });

        optionsContainerEl.appendChild(optionDiv);
    });
}

// 5. Right Side Wala Palette (Number Grid) Banana
function renderPalette() {
    paletteContainerEl.innerHTML = "";
    let counts = { notVisited: 0, notAnswered: 0, answered: 0, review: 0 };

    questions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.innerText = index + 1;
        btn.className = "w-10 h-10 font-bold text-sm flex items-center justify-center transition-all shadow-sm ";
        
        const status = paletteStatuses[index];

        // Status ke mutabik colors lagana
        if (status === 'not-visited') {
            btn.className += "bg-gray-100 border border-gray-300 text-slate-700 rounded";
            counts.notVisited++;
        } else if (status === 'not-answered') {
            btn.className += "bg-red-500 text-white";
            btn.style.borderBottomRightRadius = "12px";
            counts.notAnswered++;
        } else if (status === 'answered') {
            btn.className += "bg-green-500 text-white";
            btn.style.borderBottomRightRadius = "12px";
            counts.answered++;
        } else if (status === 'review') {
            btn.className += "bg-purple-600 text-white rounded-full";
            counts.review++;
        }

        btn.addEventListener('click', () => showQuestion(index));
        paletteContainerEl.appendChild(btn);
    });

    // Upar legend wale boxes mein ginti update karna
    const legends = document.querySelectorAll('aside .grid span');
    if (legends.length >= 4) {
        legends[0].innerText = counts.notVisited;
        legends[1].innerText = counts.notAnswered;
        legends[2].innerText = counts.answered;
        legends[3].innerText = counts.review;
    }
}

// 6. Action Buttons Ka Logic Set Karna
document.getElementById('btn-save-next').addEventListener('click', () => {
    paletteStatuses[currentIndex] = userAnswers[currentIndex] ? 'answered' : 'not-answered';
    renderPalette();
    if (currentIndex < questions.length - 1) showQuestion(currentIndex + 1);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    delete userAnswers[currentIndex];
    paletteStatuses[currentIndex] = 'not-answered';
    renderPalette();
    showQuestion(currentIndex);
});

document.getElementById('btn-mark-review').addEventListener('click', () => {
    paletteStatuses[currentIndex] = 'review';
    renderPalette();
    if (currentIndex < questions.length - 1) showQuestion(currentIndex + 1);
});

document.getElementById('btn-save-review').addEventListener('click', () => {
    paletteStatuses[currentIndex] = 'review';
    renderPalette();
    if (currentIndex < questions.length - 1) showQuestion(currentIndex + 1);
});

// 7. Result Calculate Karke Test Submit Karna
function submitTest() {
    let score = 0;
    let attempted = 0;

    questions.forEach((q, index) => {
        if (userAnswers[index]) {
            attempted++;
            // NTA Marking scheme check
            if (userAnswers[index] === q.correct) {
                score += 5; // Sahi par +5 marks[cite: 2]
            } else {
                score -= 1; // Galat par -1 mark[cite: 2]
            }
        }
    });

    alert(`Test Submitted Successfully!\nTotal Questions: ${questions.length}\nAttempted: ${attempted}\nYour Score: ${score}`);
    window.location.href = 'index.html'; // Submit hone par wapas home page bhejna[cite: 2]
}

document.getElementById('btn-submit-test').addEventListener('click', () => {
    if (confirm("Are you sure you want to submit the exam?")) {
        submitTest();
    }
});

// 8. Test Shuru Karna
loadQuestions();