<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessment Generator - Wireframe</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        /* Simulated A4 Paper */
        .a4-paper {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 10mm auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }

        .question-card:hover {
            border-color: #3B82F6;
            transform: translateY(-2px);
            transition: all 0.2s;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1; 
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; 
        }

        /* Toggle Switch */
        .toggle-checkbox:checked {
            right: 0;
            border-color: #68D391;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #68D391;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 h-screen flex flex-col overflow-hidden">

    <!-- TOP NAVIGATION -->
    <nav class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <div class="flex items-center gap-3">
            <div class="bg-blue-600 text-white p-2 rounded-lg">
                <i class="fa-solid fa-file-signature"></i>
            </div>
            <h1 class="font-bold text-xl tracking-tight text-slate-800">AssessmentGen <span class="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-2">v1.6 Combined</span></h1>
        </div>
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 text-sm text-slate-600">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">T</div>
                <span>Teacher Profile</span>
            </div>
        </div>
    </nav>

    <!-- MAIN CONTENT CONTAINER -->
    <div id="main-container" class="flex-1 relative overflow-hidden">
        
        <!-- VIEW 1: CONFIGURATION (START) -->
        <section id="view-config" class="absolute inset-0 flex items-center justify-center bg-slate-50 z-20 transition-all duration-300">
            <div class="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 p-8">
                <div class="text-center mb-8">
                    <h2 class="text-2xl font-bold text-slate-800">Create New Assessment</h2>
                    <p class="text-slate-500 mt-2">Configure the syllabus and structure for your new paper.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <!-- Assessment Type -->
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-slate-700">Assessment Type</label>
                        <div class="relative">
                            <select id="config-type" onchange="updatePoolSourceDisplay()" class="w-full p-3 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                                <option value="" disabled selected>Select an assessment type</option>
                                <option value="FA">Formative Assessment (FA)</option>
                                <option value="SA">Summative Assessment (SA)</option>
                                <option value="MT">Mid-Term Exam (MT)</option>
                                <option value="Term">Term Exam</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-3 top-4 text-slate-400 pointer-events-none"></i>
                        </div>
                        <div id="pool-source-container" class="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-2 hidden">
                            <i id="pool-icon" class="fa-solid fa-database mt-0.5"></i>
                            <div>
                                <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Pulls questions from:</p>
                                <p id="pool-source-text" class="text-sm font-bold text-gray-800">--</p>
                            </div>
                        </div>
                    </div>

                    <!-- Subject -->
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-slate-700">Subject</label>
                        <div class="relative">
                            <select id="config-subject" class="w-full p-3 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                                <option>Environmental Science (EVS)</option>
                                <option>Mathematics</option>
                                <option>English</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-3 top-4 text-slate-400 pointer-events-none"></i>
                        </div>
                    </div>

                    <!-- Chapters -->
                    <div class="md:col-span-2 space-y-2">
                        <label class="block text-sm font-medium text-slate-700">Select Chapters</label>
                        <div class="border border-slate-300 rounded-lg p-3 bg-white h-32 overflow-y-auto">
                            <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                <input type="checkbox" checked class="rounded text-blue-600 focus:ring-blue-500" value="Ch 1" id="ch1-checkbox">
                                <span class="text-slate-700">Ch 1: Family & Friends</span>
                            </label>
                            <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                <input type="checkbox" checked class="rounded text-blue-600 focus:ring-blue-500" value="Ch 2" id="ch2-checkbox">
                                <span class="text-slate-700">Ch 2: My Body</span>
                            </label>
                            <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                <input type="checkbox" class="rounded text-blue-600 focus:ring-blue-500" value="Ch 3" id="ch3-checkbox">
                                <span class="text-slate-700">Ch 3: Numbers (0-99)</span>
                            </label>
                            <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                <input type="checkbox" class="rounded text-blue-600 focus:ring-blue-500" value="Ch 4" id="ch4-checkbox">
                                <span class="text-slate-700">Ch 4: Animals around us</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-slate-100">
                    <button onclick="switchView('builder')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition-colors flex items-center gap-2">
                        Start Building <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </section>

        <!-- VIEW 2: BUILDER (SPLIT SCREEN) -->
        <section id="view-builder" class="absolute inset-0 flex flex-col bg-slate-100 hidden">
            
            <!-- Builder Header -->
            <div class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div class="flex items-center gap-6">
                    <div>
                        <span class="text-xs font-semibold text-slate-400 uppercase">Class 3 • EVS</span>
                        <h2 class="text-lg font-bold text-slate-800 leading-none">Assessment</h2>
                    </div>
                    <div class="h-8 w-px bg-slate-200"></div>
                    <div class="flex gap-4 text-sm">
                        <div class="flex flex-col">
                            <span class="text-xs text-slate-500">Total Marks</span>
                            <span class="font-bold text-blue-600 text-lg">
                                <span id="total-marks">0</span> 
                                <span class="text-xs text-slate-400 font-normal">/ <span id="max-marks-display">20</span></span>
                            </span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs text-slate-500">Est. Time</span>
                            <span class="font-bold text-slate-700">45 mins</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button onclick="switchView('config')" class="text-slate-500 hover:text-slate-800 font-medium text-sm px-3 py-2">Back</button>
                    <button class="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors">Save Draft</button>
                    <button onclick="switchView('preview')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow transition-colors">
                        <i class="fa-solid fa-print mr-2"></i>Generate PDF Preview
                    </button>
                </div>
            </div>

            <!-- Builder Workspace -->
            <div class="flex-1 flex overflow-hidden">
                
                <!-- LEFT PANEL: QUESTION BANK -->
                <div class="w-1/2 flex flex-col border-r border-slate-200 bg-white">
                    <!-- Filters -->
                    <div class="p-4 border-b border-slate-100">
                        <div class="flex items-center mb-3">
                            <span class="text-xs font-bold text-slate-400 flex items-center mr-3 uppercase">Chapter:</span>
                            <div class="flex gap-2 overflow-x-auto whitespace-nowrap">
                                <button data-filter-value="All" data-filter-type="chapter" class="filter-btn px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold" onclick="setFilter('chapter', 'All', this)">All</button>
                                <button data-filter-value="Ch 1" data-filter-type="chapter" class="filter-btn px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-full text-xs font-medium border border-slate-200" onclick="setFilter('chapter', 'Ch 1', this)">Ch 1: Family</button>
                                <button data-filter-value="Ch 2" data-filter-type="chapter" class="filter-btn px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-full text-xs font-medium border border-slate-200" onclick="setFilter('chapter', 'Ch 2', this)">Ch 2: Body</button>
                            </div>
                        </div>

                        <div class="flex items-center">
                            <span class="text-xs font-bold text-slate-400 flex items-center mr-3 uppercase">Difficulty:</span>
                            <div class="flex gap-2 overflow-x-auto whitespace-nowrap">
                                <button data-filter-value="All" data-filter-type="difficulty" class="filter-btn px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold" onclick="setFilter('difficulty', 'All', this)">All</button>
                                <button data-filter-value="Easy" data-filter-type="difficulty" class="filter-btn px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-full text-xs font-medium border border-slate-200" onclick="setFilter('difficulty', 'Easy', this)">Easy</button>
                                <button data-filter-value="Medium" data-filter-type="difficulty" class="filter-btn px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-full text-xs font-medium border border-slate-200" onclick="setFilter('difficulty', 'Medium', this)">Medium</button>
                                <button data-filter-value="Hard" data-filter-type="difficulty" class="filter-btn px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-full text-xs font-medium border border-slate-200" onclick="setFilter('difficulty', 'Hard', this)">Hard</button>
                            </div>
                        </div>
                    </div>

                    <!-- Questions List -->
                    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" id="question-source-list">
                        
                        <!-- Question Item 1 (Visual) - Ch 2, Medium -->
                        <div class="question-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm group" id="q1-card" data-chapter="Ch 2" data-difficulty="Medium">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex gap-2">
                                    <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">LABELING</span>
                                    <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">CH 2</span>
                                    <span class="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold">MEDIUM</span>
                                </div>
                                <span class="font-bold text-slate-400 text-sm">3 Marks</span>
                            </div>
                            <p class="text-sm font-medium text-slate-800 mb-3">Label the nose, ribcage, and lungs in the picture.</p>
                            
                            <!-- Visual Mockup -->
                            <div class="bg-slate-100 rounded-lg p-4 mb-3 flex justify-center items-center h-32 border-2 border-dashed border-slate-300">
                                <div class="text-center text-slate-400">
                                    <i class="fa-solid fa-child text-4xl mb-2"></i>
                                    <p class="text-xs">Diagram: Human Body (Girl)</p>
                                </div>
                            </div>

                            <button id="btn-q1" onclick="addQuestion('q1', 3, 'Label the nose, ribcage, and lungs...')" class="w-full py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white">
                                <i class="fa-solid fa-plus"></i> Add to Current Section
                            </button>
                        </div>

                        <!-- Question Item 2 (Matching) - Ch 1, Hard -->
                        <div class="question-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm group" id="q2-card" data-chapter="Ch 1" data-difficulty="Hard">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex gap-2">
                                    <span class="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">MATCHING</span>
                                    <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">CH 1</span>
                                    <span class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">HARD</span>
                                </div>
                                <span class="font-bold text-slate-400 text-sm">4 Marks</span>
                            </div>
                            <p class="text-sm font-medium text-slate-800 mb-3">Match the given words to their meanings.</p>
                            
                            <!-- Visual Content -->
                            <div class="grid grid-cols-2 gap-4 text-xs text-slate-600 mb-3 pl-2 border-l-2 border-slate-200">
                                <div>a. Trouble</div><div>i. Extremely happy</div>
                                <div>b. Delighted</div><div>ii. Problem</div>
                            </div>

                            <button id="btn-q2" onclick="addQuestion('q2', 4, 'Match the given words...')" class="w-full py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white">
                                <i class="fa-solid fa-plus"></i> Add to Current Section
                            </button>
                        </div>

                         <!-- Question Item 3 (Odd One Out) - Ch 1, Easy -->
                         <div class="question-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm group" id="q3-card" data-chapter="Ch 1" data-difficulty="Easy">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex gap-2">
                                    <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">CLASSIFICATION</span>
                                    <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">CH 1</span>
                                    <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">EASY</span>
                                </div>
                                <span class="font-bold text-slate-400 text-sm">2 Marks</span>
                            </div>
                            <p class="text-sm font-medium text-slate-800 mb-3">Circle the odd one out.</p>
                            <div class="bg-slate-50 p-3 rounded text-sm text-slate-700 mb-3 font-mono">
                                Uncle, Mother, Friend, Brother
                            </div>

                            <button id="btn-q3" onclick="addQuestion('q3', 2, 'Circle the odd one out...')" class="w-full py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white">
                                <i class="fa-solid fa-plus"></i> Add to Current Section
                            </button>
                        </div>
                        
                         <!-- Question Item 4 (Fill in the Blank) - Ch 2, Easy -->
                         <div class="question-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm group" id="q4-card" data-chapter="Ch 2" data-difficulty="Easy">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex gap-2">
                                    <span class="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">FILL IN</span>
                                    <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">CH 2</span>
                                    <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">EASY</span>
                                </div>
                                <span class="font-bold text-slate-400 text-sm">1 Mark</span>
                            </div>
                            <p class="text-sm font-medium text-slate-800 mb-3">The food pipe is also called the ______________.</p>
                            
                            <button id="btn-q4" onclick="addQuestion('q4', 1, 'The food pipe is also called the...')" class="w-full py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white">
                                <i class="fa-solid fa-plus"></i> Add to Current Section
                            </button>
                        </div>
                        
                    </div>
                </div>

                <!-- RIGHT PANEL: SELECTED PAPER -->
                <div class="w-1/2 flex flex-col bg-slate-50">
                    <!-- Section Tabs -->
                    <div class="flex bg-white border-b border-slate-200 px-2">
                        <button onclick="setSection('A')" id="tab-A" class="px-6 py-3 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm transition-colors">Section A</button>
                        <button onclick="setSection('B')" id="tab-B" class="px-6 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors">Section B</button>
                        <button onclick="setSection('C')" id="tab-C" class="px-6 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors">Section C</button>
                    </div>

                    <!-- Constraints Info & Skip Toggle -->
                    <div class="bg-blue-50 px-6 py-3 text-xs text-blue-800 flex justify-between items-center border-b border-blue-100">
                        <div class="flex items-center gap-2">
                            <span><i class="fa-solid fa-chart-pie mr-1"></i> Section <span id="current-section-label">A</span> Total:</span>
                            <span class="font-bold text-sm"><span id="section-marks">0</span> Marks</span>
                        </div>
                        
                        <div class="flex items-center">
                            <label for="toggle-skip" class="flex items-center cursor-pointer">
                                <div class="relative">
                                    <input type="checkbox" id="toggle-skip" class="sr-only" onchange="toggleSkipSection()">
                                    <div class="w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors duration-200 ease-in-out" id="toggle-bg"></div>
                                    <div class="dot absolute w-4 h-4 bg-white rounded-full shadow left-1 top-1 transition-transform duration-200 ease-in-out" id="toggle-dot"></div>
                                </div>
                                <div class="ml-3 text-slate-600 font-medium select-none">Skip Section</div>
                            </label>
                        </div>
                    </div>

                    <!-- Selected Questions Area -->
                    <div class="flex-1 overflow-y-auto p-6 transition-opacity duration-200" id="selected-list">
                        <!-- JS renders here -->
                    </div>
                </div>
            </div>
        </section>

        <!-- VIEW 3: PDF PREVIEW -->
        <section id="view-preview" class="absolute inset-0 bg-slate-800 z-30 flex justify-center overflow-y-auto hidden">
            
            <div class="fixed top-6 right-6 flex flex-col gap-2 z-40">
                <button onclick="switchView('builder')" class="bg-white/90 backdrop-blur text-slate-700 hover:bg-white p-3 rounded-full shadow-lg transition-transform hover:scale-105">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="bg-blue-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 hover:bg-blue-500">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>

            <div class="a4-paper relative">
                <!-- Header -->
                <div class="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 class="text-2xl font-bold uppercase tracking-wide mb-1">St. Xavier's High School</h1>
                    <div class="flex justify-between text-sm font-semibold mt-4">
                        <span>Class: 3</span>
                        <span>Subject: EVS (Revision)</span>
                        <span>Time: 45 Mins</span>
                    </div>
                    <div class="flex justify-between text-sm font-semibold mt-1">
                        <span>Name: ______________________</span>
                        <span>Marks: <span id="preview-total-marks">20</span></span>
                    </div>
                </div>

                <div id="preview-content">
                    <!-- Sections will be injected here -->
                </div>

                <div class="absolute bottom-8 left-0 w-full text-center text-xs text-gray-500">
                    Page 1 of 1 • Generated via AssessmentGen
                </div>
            </div>
        </section>

    </div>

    <!-- JAVASCRIPT LOGIC -->
    <script>
        // State Management
        let appState = {
            currentSection: 'A',
            questions: [], // Stores {id, title, marks, section}
            sectionConfig: {
                'A': { skipped: false },
                'B': { skipped: false },
                'C': { skipped: false }
            },
            filters: {
                chapter: 'All',
                difficulty: 'All'
            },
            maxMarks: 20, // Strict total target
            // Define all possible questions with their properties for filtering
            allQuestions: {
                'q1': { chapter: 'Ch 2', difficulty: 'Medium', title: 'Label the nose, ribcage, and lungs...' },
                'q2': { chapter: 'Ch 1', difficulty: 'Hard', title: 'Match the given words...' },
                'q3': { chapter: 'Ch 1', difficulty: 'Easy', title: 'Circle the odd one out...' },
                'q4': { chapter: 'Ch 2', difficulty: 'Easy', title: 'The food pipe is also called the...' },
            }
        };

        // DOM Elements
        const els = {
            totalMarks: document.getElementById('total-marks'),
            maxMarksDisplay: document.getElementById('max-marks-display'),
            sectionMarks: document.getElementById('section-marks'),
            currentSectionLabel: document.getElementById('current-section-label'),
            selectedList: document.getElementById('selected-list'),
            toggleSkip: document.getElementById('toggle-skip'),
            toggleBg: document.getElementById('toggle-bg'),
            toggleDot: document.getElementById('toggle-dot')
        };
        
        // --- VIEW & SECTION MANAGEMENT ---

        function switchView(viewId) {
            ['view-config', 'view-builder', 'view-preview'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
            });
            document.getElementById(`view-${viewId}`).classList.remove('hidden');
            if(viewId === 'builder') {
                filterQuestions(); // Ensure filters are applied when entering builder view
                els.maxMarksDisplay.innerText = appState.maxMarks;
            }
            if(viewId === 'preview') renderPreview();
        }

        function setSection(sectionId) {
            appState.currentSection = sectionId;
            els.currentSectionLabel.innerText = sectionId;
            
            // Update Tabs
            ['A', 'B', 'C'].forEach(s => {
                const tab = document.getElementById(`tab-${s}`);
                if(s === sectionId) {
                    tab.classList.add('border-blue-600', 'text-blue-600');
                    tab.classList.remove('border-transparent', 'text-slate-500');
                } else {
                    tab.classList.remove('border-blue-600', 'text-blue-600');
                    tab.classList.add('border-transparent', 'text-slate-500');
                }
            });

            // Update Skip Toggle State
            const isSkipped = appState.sectionConfig[sectionId].skipped;
            els.toggleSkip.checked = isSkipped;
            updateToggleVisuals(isSkipped);
            
            renderSelectedQuestions();
        }

        function toggleSkipSection() {
            const isSkipped = els.toggleSkip.checked;
            appState.sectionConfig[appState.currentSection].skipped = isSkipped;
            updateToggleVisuals(isSkipped);
            renderSelectedQuestions();
        }

        function updateToggleVisuals(checked) {
            if(checked) {
                els.toggleBg.classList.replace('bg-gray-300', 'bg-red-400'); // Red for skipped/excluded
                els.toggleDot.style.transform = 'translateX(100%)';
                els.selectedList.classList.add('opacity-50', 'pointer-events-none', 'grayscale');
            } else {
                els.toggleBg.classList.replace('bg-red-400', 'bg-gray-300');
                els.toggleDot.style.transform = 'translateX(0)';
                els.selectedList.classList.remove('opacity-50', 'pointer-events-none', 'grayscale');
            }
            calculateTotals();
        }

        // --- POOL SOURCE LOGIC (Combined Feature) ---
        function updatePoolSourceDisplay() {
            const select = document.getElementById('config-type');
            const sourceContainer = document.getElementById('pool-source-container');
            const sourceText = document.getElementById('pool-source-text');
            const poolIcon = document.getElementById('pool-icon');
            
            const selectedValue = select.value;
            
            if (!selectedValue) {
                sourceContainer.classList.add('hidden');
                return;
            }
            
            sourceContainer.classList.remove('hidden');

            if (selectedValue === 'FA' || selectedValue === 'SA') {
                sourceText.innerText = "PRACTICE POOL";
                sourceText.className = "text-sm font-bold text-green-700";
                sourceContainer.className = "mt-2 p-3 bg-green-50 rounded-lg border border-green-200 flex items-start gap-2";
                poolIcon.className = "fa-solid fa-person-chalkboard mt-0.5 text-green-600";
            } else {
                sourceText.innerText = "EXAM POOL";
                sourceText.className = "text-sm font-bold text-blue-700";
                sourceContainer.className = "mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-2";
                poolIcon.className = "fa-solid fa-graduation-cap mt-0.5 text-blue-600";
            }
        }
        
        // --- FILTERING LOGIC ---
        
        function setFilter(type, value, button) {
            appState.filters[type] = value;
            
            // Update button visual state
            document.querySelectorAll(`[data-filter-type="${type}"]`).forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-200');
                btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
            });
            button.classList.add('bg-blue-600', 'text-white');
            button.classList.remove('bg-white', 'text-slate-600', 'border-slate-200', 'hover:bg-slate-100');
            
            filterQuestions();
        }
        
        function filterQuestions() {
            const cards = document.querySelectorAll('#question-source-list .question-card');
            
            cards.forEach(card => {
                const cardChapter = card.getAttribute('data-chapter');
                const cardDifficulty = card.getAttribute('data-difficulty');
                
                const chapterMatch = appState.filters.chapter === 'All' || appState.filters.chapter === cardChapter;
                const difficultyMatch = appState.filters.difficulty === 'All' || appState.filters.difficulty === cardDifficulty;
                
                if (chapterMatch && difficultyMatch) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }

        // --- QUESTION CRUD & MARKS LOGIC ---

        function addQuestion(id, marks, title) {
            // Check if already added
            if(appState.questions.find(q => q.id === id)) return;

            // UI Feedback in Left Panel
            const btn = document.getElementById(`btn-${id}`);
            const card = document.getElementById(`${id}-card`);
            card.classList.add('opacity-50', 'pointer-events-none');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            btn.classList.replace('bg-white', 'bg-green-100');
            btn.classList.replace('text-blue-600', 'text-green-700');
            btn.classList.replace('border-blue-600', 'border-green-200');
            btn.disabled = true;

            // Add to State
            appState.questions.push({
                id,
                title,
                marks,
                section: appState.currentSection
            });

            renderSelectedQuestions();
        }

        function removeQuestion(id) {
            // Remove from State
            appState.questions = appState.questions.filter(q => q.id !== id);

            // Revert Left Panel UI
            const btn = document.getElementById(`btn-${id}`);
            const card = document.getElementById(`${id}-card`);
            if(btn && card) {
                card.classList.remove('opacity-50', 'pointer-events-none');
                btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Current Section';
                btn.classList.replace('bg-green-100', 'bg-white');
                btn.classList.replace('text-green-700', 'text-blue-600');
                btn.classList.replace('border-green-200', 'border-blue-600');
                btn.disabled = false;
            }

            renderSelectedQuestions();
        }

        function updateMarks(id, inputElement) {
            const newMarks = parseInt(inputElement.value);
            const q = appState.questions.find(q => q.id === id);
            
            if (!q) return;

            // Basic validation
            if (isNaN(newMarks) || newMarks < 0) {
                inputElement.value = q.marks; // Revert to previous valid mark
                return;
            }

            // --- STRICT MARKS CHECK ---
            // If the section is not skipped, we must check if adding marks exceeds the total target
            if (!appState.sectionConfig[q.section].skipped) {
                let currentTotal = 0;
                
                // Calculate total of ALL active questions (including this one's NEW marks)
                appState.questions.forEach(item => {
                    if (!appState.sectionConfig[item.section].skipped) {
                        // If it's the question being edited, use the new value
                        // Otherwise use the stored value
                        currentTotal += (item.id === id ? newMarks : item.marks);
                    }
                });

                // If projected total exceeds max marks, revert changes
                if (currentTotal > appState.maxMarks) {
                    alert(`Cannot increase marks. Total cannot exceed ${appState.maxMarks}.`);
                    inputElement.value = q.marks; // Revert input visually
                    return; // Do not update state
                }
            }

            // If check passes, update state
            q.marks = newMarks;
            calculateTotals();
        }

        function calculateTotals() {
            let grandTotal = 0;
            let sectionTotal = 0;

            appState.questions.forEach(q => {
                // Only count marks if section is NOT skipped
                if (!appState.sectionConfig[q.section].skipped) {
                    grandTotal += q.marks;
                }
                
                if (q.section === appState.currentSection) {
                    sectionTotal += q.marks;
                }
            });

            els.totalMarks.innerText = grandTotal;
            els.sectionMarks.innerText = sectionTotal;
        }

        function renderSelectedQuestions() {
            const list = els.selectedList;
            list.innerHTML = '';
            
            // Filter questions for current section
            const sectionQs = appState.questions.filter(q => q.section === appState.currentSection);

            if(sectionQs.length === 0) {
                list.innerHTML = `
                    <div class="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-xl m-4">
                        <i class="fa-solid fa-clipboard-list text-4xl mb-3 opacity-50"></i>
                        <p class="text-sm font-medium">Section ${appState.currentSection} is empty</p>
                        <p class="text-xs">Add questions from the left panel</p>
                    </div>`;
            } else {
                sectionQs.forEach((q, index) => {
                    const el = document.createElement('div');
                    el.className = "bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-3 flex justify-between items-start animate-fade-in";
                    el.innerHTML = `
                        <div class="flex-1 pr-4">
                            <span class="text-xs font-bold text-slate-400">Q${index + 1} (ID: ${q.id})</span>
                            <p class="text-sm font-medium text-slate-800 mt-1">${q.title}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="flex flex-col items-end">
                                <label class="text-[10px] text-slate-400 uppercase font-bold mb-1">Marks</label>
                                <input type="number" 
                                       value="${q.marks}" 
                                       min="0" max="20" 
                                       onchange="updateMarks('${q.id}', this)"
                                       class="w-12 h-8 text-center text-sm border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            </div>
                            <button onclick="removeQuestion('${q.id}')" class="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Remove Question">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    `;
                    list.appendChild(el);
                });
            }
            
            calculateTotals();
        }

        function renderPreview() {
            const container = document.getElementById('preview-content');
            container.innerHTML = ''; 
            const totalEl = document.getElementById('preview-total-marks');
            let grandTotal = 0;

            ['A', 'B', 'C'].forEach(section => {
                if(appState.sectionConfig[section].skipped) return;

                const qs = appState.questions.filter(q => q.section === section);
                if(qs.length === 0) return;

                const secDiv = document.createElement('div');
                secDiv.className = "mb-8";
                secDiv.innerHTML = `<h3 class="font-bold text-lg mb-4 border-b border-black pb-1">Section ${section}</h3>`;
                
                const qContainer = document.createElement('div');
                qContainer.className = "space-y-6";

                // Re-index questions in the preview for visual continuity within the section
                let previewIndex = 1; 

                qs.forEach((q) => {
                    grandTotal += q.marks;
                    
                    // Simple logic to vary preview appearance based on Q title
                    let visualHTML = '';
                    if(q.title.includes('Label')) {
                         visualHTML = `<div class="my-3 border border-gray-300 w-32 h-32 flex items-center justify-center bg-gray-50 mx-auto"><i class="fa-solid fa-image text-gray-400"></i></div>`;
                    } else if(q.title.includes('Match')) {
                        visualHTML = `<div class="text-xs my-2 grid grid-cols-2 gap-4 ml-6"><div>a. Item 1</div><div>i. Meaning 1</div><div>b. Item 2</div><div>ii. Meaning 2</div></div>`;
                    }

                    const qItem = document.createElement('div');
                    qItem.className = "flex gap-2";
                    qItem.innerHTML = `
                        <div class="font-bold w-6">${previewIndex++}.</div>
                        <div class="flex-1">
                            <div>${q.title}</div>
                            ${visualHTML}
                        </div>
                        <div class="font-bold w-10 text-right">(${q.marks})</div>
                    `;
                    qContainer.appendChild(qItem);
                });

                secDiv.appendChild(qContainer);
                container.appendChild(secDiv);
            });
            
            totalEl.innerText = grandTotal;
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            renderSelectedQuestions();
            filterQuestions(); // Initial filter to show all questions
            updatePoolSourceDisplay(); // Initialize the pool source display
        });
    </script>
</body>
</html>
