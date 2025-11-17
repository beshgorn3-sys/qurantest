document.addEventListener('DOMContentLoaded', () => {
    // --- *** الكود الخاص بشاشة الشرح *** ---
    const helpModal = document.getElementById('helpModal');
    const showHelpBtn = document.getElementById('showHelpBtn');
    const closeBtn = document.querySelector('.close-btn');

    showHelpBtn.onclick = () => { helpModal.style.display = "block"; }
    closeBtn.onclick = () => { helpModal.style.display = "none"; }
    window.onclick = (event) => {
        if (event.target == helpModal) {
            helpModal.style.display = "none";
        }
    }
    // --- نهاية الإضافة ---

    // --- *** الكود الخاص بتسجيل الدخول وحفظ النتائج (باستخدام Apps Script) *** ---
    const loginSection = document.getElementById('loginSection');
    const settingsDiv = document.getElementById('settings');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const loginStatus = document.getElementById('loginStatus');
    const loggedInUser = document.getElementById('loggedInUser');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // *** هام: ضع رابط Google Apps Script هنا ***
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwf5EC0aM61tONiwzPIZOoysJAi2hCrqYZp_l4sotiRRM59LUenZHluhmc4qGvsEGzC4g/exec';

    let currentUser = null;
    
    loginBtn.addEventListener('click', async () => {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();
        
        if (!username || !password) {
            loginStatus.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور';
            loginStatus.style.color = 'var(--incorrect-text)';
            return;
        }
        
        loginStatus.textContent = 'جاري التحقق من البيانات...';
        
        try {
            const response = await fetch(`${SCRIPT_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
            const result = await response.json();
            
            if (result.success) {
                currentUser = username;
                loggedInUser.textContent = username;
                loginSection.classList.add('hidden');
                settingsDiv.classList.remove('hidden');
                loginStatus.textContent = '';
            } else {
                loginStatus.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
                loginStatus.style.color = 'var(--incorrect-text)';
            }
        } catch (error) {
            console.error('Error:', error);
            loginStatus.textContent = 'حدث خطأ في الاتصال بالخادم';
            loginStatus.style.color = 'var(--incorrect-text)';
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        loginUsername.value = '';
        loginPassword.value = '';
        settingsDiv.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });
    // --- نهاية كود تسجيل الدخول ---

    // --- DOM Elements ---
    const quizAreaDiv = document.getElementById('quizArea');
    const resultsDiv = document.getElementById('results');
    const startBtn = document.getElementById('startBtn');
    const finalScoreP = document.getElementById('finalScore');
    const googleStatusP = document.getElementById('google-status');
    const telegramStatusP = document.getElementById('telegram-status');
    const quizUserName = document.getElementById('quizUserName');
    const loader = document.getElementById('loader');
    const quizContent = document.getElementById('quizContent');
    const questionContainer = document.getElementById('questionContainer');
    const byPageRadio = document.getElementById('byPage');
    const byRangeRadio = document.getElementById('byRange');
    const pageInputDiv = document.getElementById('pageInput');
    const rangeInputDiv = document.getElementById('rangeInput');
    const audioPlayer = document.getElementById('audioPlayer');
    const answerContainer = document.getElementById('answer-container');
    const resultMessage = document.getElementById('resultMessage');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const reciterSelect = document.getElementById('reciter');

    const reciters = {
        "ar.alafasy": "مشاري راشد العفاسي", "ar.abdulsamad": "عبد الباسط عبد الصمد (مرتل)", "ar.sudais": "عبد الرحمن السديس", "ar.mahermuaiqly": "ماهر المعيقلي", "ar.minshawi": "محمد صديق المنشاوي (مرتل)", "ar.husary": "محمود خليل الحصري", "ar.saoodshuraym": "سعود الشريم", "ar.ahmedajamy": "أحمد بن علي العجمي", "ar.abdulbasitmurattal": "عبد الباسط عبد الصمد (المصحف المجود)", "ar.husarymujawwad": "محمود خليل الحصري (مجود)", "ar.minshawimujawwad": "محمد صديق المنشاوي (مجود)", "ar.rifai": "هاني الرفاعي", "ar.tablawy": "محمد محمود الطبلاوي"
    };

    // --- State Variables ---
    let allAyahs = [];
    let questionPool = [];
    let currentQuestionType = '';
    let correctAnswer = null;
    let score = 0;
    let questionsAsked = 0;
    let totalQuestions = 10;
    let mistakes = [];
    let audioQueue = [];
    let currentAudioIndex = 0;

    function populateReciters() {
        for (const [id, name] of Object.entries(reciters)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            reciterSelect.appendChild(option);
        }
    }

    function updateSelectionUI() {
        pageInputDiv.classList.toggle('hidden', !byPageRadio.checked);
        rangeInputDiv.classList.toggle('hidden', byPageRadio.checked);
    }
    byPageRadio.addEventListener('change', updateSelectionUI);
    byRangeRadio.addEventListener('change', updateSelectionUI);
    startBtn.addEventListener('click', startTest);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    audioPlayer.addEventListener('ended', playNextInQueue);

    async function startTest() {
        totalQuestions = parseInt(document.getElementById('numQuestions').value) || 10;
        settingsDiv.classList.add('hidden');
        quizAreaDiv.classList.remove('hidden');
        quizUserName.textContent = currentUser;
        
        try {
            loader.classList.remove('hidden');
            quizContent.classList.add('hidden');
            loader.textContent = 'جاري تحميل بيانات الآيات...';
            
            const testScope = byPageRadio.checked ? 'page' : 'range';
            const selectedReciter = reciterSelect.value;

            if (testScope === 'page') {
                await fetchAyahsForPage(document.getElementById('pageNumber').value, selectedReciter);
            } else {
                await fetchAyahsForRange(document.getElementById('startPage').value, document.getElementById('endPage').value, selectedReciter);
            }

            if (allAyahs.length < 5) {
                 throw new Error('لا يوجد عدد كافٍ من الآيات في هذا النطاق. الرجاء اختيار مجال أوسع.');
            }

            questionsAsked = 0;
            score = 0;
            mistakes = [];
            questionPool = Array.from({length: allAyahs.length}, (_, i) => i);
            nextQuestion();

        } catch (error) {
            loader.textContent = `خطأ: ${error.message}`;
            quizAreaDiv.innerHTML += `<button class="main-btn" onclick="location.reload()">العودة</button>`;
        }
    }

    async function fetchAyahsForPage(page, reciter) {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${page}/${reciter}` );
        if (!response.ok) throw new Error('فشل الاتصال بالشبكة.');
        const data = await response.json();
        allAyahs = data.data.ayahs;
    }

    async function fetchAyahsForRange(start, end, reciter) {
        allAyahs = [];
        for (let i = parseInt(start); i <= parseInt(end); i++) {
            const response = await fetch(`https://api.alquran.cloud/v1/page/${i}/${reciter}` );
            if (!response.ok) throw new Error(`فشل في جلب بيانات صفحة ${i}`);
            const data = await response.json();
            allAyahs.push(...data.data.ayahs);
        }
    }
    
    function nextQuestion() {
        if (questionsAsked >= totalQuestions || questionPool.length < 4) {
            showFinalResults();
            return;
        }
        questionsAsked++;
        resetUIForNewQuestion();

        // اختيار نوع السؤال عشوائياً من الكتالوج الموجود في ملف question.js
        const questionTypes = Object.keys(allQuestionGenerators);
        currentQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        // الحصول على دالة توليد السؤال
        const questionGenerator = allQuestionGenerators[currentQuestionType];
        
        // التحقق من وجود دالة توليد السؤال
        if (!questionGenerator) {
            nextQuestion();
            return;
        }
        
        // توليد السؤال
        const questionData = questionGenerator(
            allAyahs, 
            [], // intruderAyahs - يمكن تطويرها لاحقاً
            reciterSelect.value, 
            handleResult
        );
        
        // التحقق من وجود بيانات السؤال
        if (!questionData) {
            nextQuestion();
            return;
        }
        
        // عرض السؤال
        questionContainer.innerHTML = questionData.questionHTML;
        
        // إعداد مستمعي الأحداث
        if (questionData.setupListeners) {
            questionData.setupListeners(questionContainer);
        }
    }

    function handleResult(isCorrect, correctAnswerText, selectedElement, questionType) {
        if (isCorrect) {
            score++;
            resultMessage.textContent = 'إجابة صحيحة! أحسنت.';
            resultMessage.className = 'resultMessage correct-msg';
            if (selectedElement) {
                selectedElement.classList.add('correct');
            }
        } else {
            resultMessage.innerHTML = `إجابة خاطئة. الإجابة الصحيحة: ${correctAnswerText}`;
            resultMessage.className = 'resultMessage incorrect-msg';
            if (selectedElement) {
                selectedElement.classList.add('incorrect');
            }
            
            // تسجيل الخطأ
            const questionPrompt = document.querySelector('#questionContainer h3').innerText;
            mistakes.push({
                question: questionPrompt,
                correction: correctAnswerText
            });
        }
        
        resultMessage.classList.remove('hidden');
        nextQuestionBtn.classList.remove('hidden');
    }

    async function showFinalResults() {
        const finalPercentage = (questionsAsked > 0) ? (score / questionsAsked) * 100 : 0;
        
        quizAreaDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        
        finalScoreP.innerHTML = `${currentUser}، نتيجتك النهائية هي: ${score} من ${questionsAsked}<br>الدرجة: ${finalPercentage.toFixed(1)}%`;

        // حفظ النتائج في ورقة الغوغل شيت
        googleStatusP.textContent = 'جاري حفظ النتائج...';
        
        try {
            const testScope = byPageRadio.checked 
                ? `صفحة ${document.getElementById('pageNumber').value}` 
                : `من صفحة ${document.getElementById('startPage').value} إلى ${document.getElementById('endPage').value}`;
            
            const resultData = {
                action: 'saveResult',
                userName: currentUser,
                scope: testScope,
                reciterName: reciters[reciterSelect.value],
                totalQuestions: totalQuestions,
                correctAnswers: score,
                wrongAnswers: questionsAsked - score,
                percentage: `${finalPercentage.toFixed(1)}%`
            };
            
            // تحويل البيانات إلى نموذج URL-encoded
            const formData = new URLSearchParams();
            for (const key in resultData) {
                formData.append(key, resultData[key]);
            }
            
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                googleStatusP.textContent = 'تم حفظ النتائج بنجاح في ورقة الغوغل شيت!';
                googleStatusP.style.color = 'green';
            } else {
                throw new Error('فشل في حفظ النتائج');
            }
        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            googleStatusP.textContent = 'حدث خطأ أثناء حفظ النتائج في ورقة الغوغل شيت.';
            googleStatusP.style.color = 'red';
        }
        
        // إرسال النتائج إلى تيليجرام
        telegramStatusP.textContent = 'جاري إرسال التقرير...';

        const BOT_TOKEN = '';
        const CHANNEL_ID = '';

        const reportData = generateReport();

        const message = `
📊 <b>تقرير اختبار قرآن جديد</b> 📊

📖 <b>المجال:</b> ${reportData.scope}
👳‍♂️ <b>الشيخ المختار:</b> ${reportData.reciterName}

📝 <b>الأسئلة:</b> ${reportData.totalQuestions}
✅ <b>إجابات صحيحة:</b> ${reportData.correctAnswers}
❌ <b>إجابات خاطئة:</b> ${reportData.wrongAnswers}

🏆 <b>النتيجة النهائية: ${reportData.finalResult}</b>

➖➖➖➖➖➖➖➖➖➖

 ${reportData.mistakes}
    `;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHANNEL_ID,
                    text: message,
                    parse_mode: 'HTML'
                }    ),
            });

            const result = await response.json();
            if (result.ok) {
                telegramStatusP.textContent = 'تم إرسال التقرير بنجاح!';
                telegramStatusP.style.color = 'green';
            } else {
                throw new Error(`فشل الإرسال: ${result.description}`);
            }
        } catch (error) {
            telegramStatusP.textContent = 'حدث خطأ أثناء إرسال التقرير.';
            telegramStatusP.style.color = 'red';
            console.error('Telegram send error:', error);
        }
    }

    function generateReport() {
        const byPage = document.getElementById('byPage').checked;
        let scope;
        if (byPage) {
            scope = `صفحة ${document.getElementById('pageNumber').value}`;
        } else {
            scope = `من صفحة ${document.getElementById('startPage').value} إلى ${document.getElementById('endPage').value}`;
        }

        const finalPercentage = (questionsAsked > 0) ? (score / questionsAsked) * 100 : 0;

        let mistakesText = mistakes.length > 0 ? '<b>تصحيح الأخطاء:</b>\n' : 'لا توجد أخطاء، أحسنت!';
        mistakes.forEach((mistake, index) => {
            mistakesText += `\n<b>${index + 1}. السؤال:</b> ${mistake.question}\n   <b>الصواب:</b> ${mistake.correction}\n`;
        });

        return {
            userName: currentUser,
            scope: scope,
            reciterName: reciters[document.getElementById('reciter').value],
            totalQuestions: questionsAsked,
            correctAnswers: score,
            wrongAnswers: questionsAsked - score,
            finalResult: `${finalPercentage.toFixed(1)}%`,
            mistakes: mistakesText
        };
    }

    function resetUIForNewQuestion() {
        loader.classList.add('hidden');
        quizContent.classList.remove('hidden');
        resultMessage.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
        answerContainer.innerHTML = '';
        questionContainer.innerHTML = '';
        audioPlayer.classList.remove('hidden');
        audioPlayer.pause();
        audioPlayer.src = '';
        audioQueue = [];
        currentAudioIndex = 0;
    }

    function playNextInQueue() {
        const isAudioQuestion = (currentQuestionType && currentQuestionType.includes('audio'));
        if (isAudioQuestion && currentAudioIndex < audioQueue.length) {
            audioPlayer.classList.remove('hidden');
            audioPlayer.src = audioQueue[currentAudioIndex];
            audioPlayer.play();
            currentAudioIndex++;
        } else if (isAudioQuestion) {
            audioPlayer.classList.add('hidden');
        }
    }

    // --- تهيئة التطبيق عند التحميل ---
    populateReciters();
    updateSelectionUI();
});