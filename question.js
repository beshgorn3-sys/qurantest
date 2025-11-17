// ====================================================================
// == وحدة مصنع الأسئلة (questions.js) - النسخة المصححة النهائية
// ====================================================================

// --- دالة عامة لخلط المصفوفات ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- 1. دالة عامة لأسئلة "اختر التالي" ---
function generateChooseNext(pageAyahs, qari, handleResultCallback, optionsCount, isAudio) {
    // *** إصلاح: التأكد من أن الآيات فريدة ***
    const uniqueAyahs = pageAyahs.filter((ayah, index, self) => index === self.findIndex((t) => t.number === ayah.number));
    if (uniqueAyahs.length < optionsCount + 1) return null;
    const startIndex = Math.floor(Math.random() * (uniqueAyahs.length - 1));
    const questionAyah = uniqueAyahs[startIndex];
    const correctNextAyah = uniqueAyahs[startIndex + 1];
    const wrongOptions = shuffleArray(uniqueAyahs.filter(a => a.number !== correctNextAyah.number && a.number !== questionAyah.number)).slice(0, optionsCount - 1);
    if (wrongOptions.length < optionsCount - 1) return null;
    const options = shuffleArray([correctNextAyah, ...wrongOptions]);
    
    const questionHTML = `
        <h3>السؤال: ${isAudio ? 'استمع واختر الآية التالية' : 'ما هي الآية التالية لهذه الآية؟'}</h3>
        ${isAudio ? `<audio controls src="https://cdn.islamic.network/quran/audio/128/${qari}/${questionAyah.number}.mp3"></audio>` : `<p class="question-text ayah-text">${questionAyah.text}</p>`}
        <hr>
        ${options.map(opt => `<div class="option-div" data-number="${opt.number}">${opt.text}</div>`).join('')}
    `;
    const setupListeners = (area) => area.querySelectorAll('.option-div').forEach(el => 
        el.addEventListener('click', () => handleResultCallback(parseInt(el.dataset.number) === correctNextAyah.number, correctNextAyah.text, el, `choose_next_${isAudio ? 'audio_text' : 'text'}`))
    );
    return { questionHTML, setupListeners };
}

// --- 2. دالة عامة لأسئلة "اختر السابق" ---
function generateChoosePrevious(pageAyahs, qari, handleResultCallback, optionsCount, isAudio) {
    // *** إصلاح: التأكد من أن الآيات فريدة ***
    const uniqueAyahs = pageAyahs.filter((ayah, index, self) => index === self.findIndex((t) => t.number === ayah.number));
    if (uniqueAyahs.length < optionsCount + 1) return null;
    const startIndex = Math.floor(Math.random() * (uniqueAyahs.length - 1)) + 1;
    const questionAyah = uniqueAyahs[startIndex];
    const correctPreviousAyah = uniqueAyahs[startIndex - 1];
    const wrongOptions = shuffleArray(uniqueAyahs.filter(a => a.number !== correctPreviousAyah.number && a.number !== questionAyah.number)).slice(0, optionsCount - 1);
    if (wrongOptions.length < optionsCount - 1) return null;
    const options = shuffleArray([correctPreviousAyah, ...wrongOptions]);

    const questionHTML = `
        <h3>السؤال: ${isAudio ? 'استمع واختر الآية السابقة' : 'ما هي الآية السابقة لهذه الآية؟'}</h3>
        ${isAudio ? `<audio controls src="https://cdn.islamic.network/quran/audio/128/${qari}/${questionAyah.number}.mp3"></audio>` : `<p class="question-text ayah-text">${questionAyah.text}</p>`}
        <hr>
        ${options.map(opt => `<div class="option-div" data-number="${opt.number}">${opt.text}</div>`).join('')}
    `;
    const setupListeners = (area) => area.querySelectorAll('.option-div').forEach(el => 
        el.addEventListener('click', () => handleResultCallback(parseInt(el.dataset.number) === correctPreviousAyah.number, correctPreviousAyah.text, el, `choose_prev_${isAudio ? 'audio_text' : 'text'}`))
    );
    return { questionHTML, setupListeners };
}

// --- 3. دالة عامة لأسئلة "الآية الدخيلة" ---
function generateFindIntruder(pageAyahs, intruderAyahs, qari, handleResultCallback, optionsCount, isAudio) {
    // *** إصلاح: التأكد من أن الآيات فريدة ***
    const uniqueAyahs = pageAyahs.filter((ayah, index, self) => index === self.findIndex((t) => t.number === ayah.number));
    if (uniqueAyahs.length < optionsCount - 1 || !intruderAyahs || intruderAyahs.length < 1) return null;
    const intruderAyah = shuffleArray(intruderAyahs)[0];
    const correctOptions = shuffleArray(uniqueAyahs).slice(0, optionsCount - 1);
    if (correctOptions.length < optionsCount - 1) return null;
    const options = shuffleArray([...correctOptions, intruderAyah]);

    const questionHTML = `
        <h3>السؤال: ${isAudio ? 'استمع للآيات. إحداها ليست من هذه الصفحة. أيها هي؟' : 'إحدى الآيات التالية ليست من هذه الصفحة. أيها هي؟'}</h3>
        ${isAudio 
            ? options.map(opt => `<div class="option-div-audio"><audio controls src="https://cdn.islamic.network/quran/audio/128/${qari}/${opt.number}.mp3"></audio><button class="audio-choice-btn" data-is-intruder="${opt.number === intruderAyah.number}">اختر</button></div>`).join('')
            : options.map(opt => `<div class="option-div" data-is-intruder="${opt.number === intruderAyah.number}">${opt.text}</div>`).join('')
        }
    `;
    const setupListeners = (area) => area.querySelectorAll(isAudio ? '.audio-choice-btn' : '.option-div').forEach(el => 
        el.addEventListener('click', () => handleResultCallback(el.dataset.isIntruder === 'true', intruderAyah.text, el, `find_intruder_${isAudio ? 'audio' : 'text'}`))
    );
    return { questionHTML, setupListeners };
}

// --- 4. دالة عامة لأسئلة "أكمل الآية" ---
function generateCompleteAyah(pageAyahs, intruderAyahs, qari, handleResultCallback, wordCount, optionsCount) {
    // *** إصلاح: التأكد من أن الآيات فريدة ***
    const uniqueAyahs = pageAyahs.filter((ayah, index, self) => index === self.findIndex((t) => t.number === ayah.number));
    const validAyahs = uniqueAyahs.filter(a => a.text.split(' ').length > wordCount);
    if (validAyahs.length === 0) return null;
    const questionAyah = shuffleArray(validAyahs)[0];
    const words = questionAyah.text.split(' ');
    const partialText = words.slice(0, words.length - wordCount).join(' ');
    const correctEnding = words.slice(words.length - wordCount).join(' ');
    const wrongOptions = shuffleArray(uniqueAyahs.filter(a => a.number !== questionAyah.number)).slice(0, optionsCount - 1).map(a => a.text.split(' ').slice(-wordCount).join(' '));
    if (wrongOptions.length < optionsCount - 1) return null;
    const options = shuffleArray([correctEnding, ...wrongOptions]);

    const questionHTML = `
        <h3>السؤال: أكمل الآية التالية:</h3>
        <p class="question-text ayah-text">${partialText} ...</p>
        <hr>
        ${options.map(opt => `<div class="option-div" data-answer="${opt === correctEnding}">${opt}</div>`).join('')}
    `;
    const setupListeners = (area) => area.querySelectorAll('.option-div').forEach(el => 
        el.addEventListener('click', () => handleResultCallback(el.dataset.answer === 'true', correctEnding, el, 'complete_ayah'))
    );
    return { questionHTML, setupListeners };
}

// --- 5. دالة عامة لأسئلة "ترتيب الكلمات" ---
function generateScrambledWords(pageAyahs, qari, handleResultCallback, difficulty) {
    // *** إصلاح: التأكد من أن الآيات فريدة ***
    const uniqueAyahs = pageAyahs.filter((ayah, index, self) => index === self.findIndex((t) => t.number === ayah.number));
    let validAyahs;
    if (difficulty === 'easy') validAyahs = uniqueAyahs.filter(a => a.text.split(' ').length >= 4 && a.text.split(' ').length <= 7);
    else if (difficulty === 'medium') validAyahs = uniqueAyahs.filter(a => a.text.split(' ').length >= 8 && a.text.split(' ').length <= 12);
    else validAyahs = uniqueAyahs.filter(a => a.text.split(' ').length > 12);
    if (validAyahs.length === 0) return null;
    
    const questionAyah = shuffleArray(validAyahs)[0];
    const correctWords = questionAyah.text.split(' ').map(word => word.trim());
    const scrambledWords = shuffleArray(correctWords);
    let selectedWords = [];

    const questionHTML = `
        <h3>السؤال: رتب الكلمات التالية لتكوين آية صحيحة:</h3>
        <div id="scrambled-answer-area" class="scrambled-answer"></div>
        <hr>
        <div id="scrambled-options-area" class="scrambled-options">
            ${scrambledWords.map((word, index) => `<button class="scrambled-word" data-index="${index}">${word}</button>`).join('')}
        </div>
        <button id="scrambled-submit-btn" class="hidden main-btn">تحقق من الإجابة</button>
    `;

    const setupListeners = (area) => {
        const optionsArea = area.querySelector('#scrambled-options-area');
        const answerArea = area.querySelector('#scrambled-answer-area');
        const submitBtn = area.querySelector('#scrambled-submit-btn');

        optionsArea.addEventListener('click', e => {
            if (e.target.classList.contains('scrambled-word')) {
                const word = e.target.textContent;
                selectedWords.push(word);
                answerArea.textContent = selectedWords.join(' ');
                e.target.disabled = true;
                if (selectedWords.length === correctWords.length) {
                    submitBtn.classList.remove('hidden');
                }
            }
        });

        submitBtn.addEventListener('click', () => {
            const userAnswer = selectedWords.join(' ').trim();
            const correctAnswer = correctWords.join(' ').trim();
            const isCorrect = userAnswer === correctAnswer;
            handleResultCallback(isCorrect, correctAnswer, answerArea, 'scrambled_words');
        });
    };
    return { questionHTML, setupListeners };
}

// --- 6. دالة عامة لأسئلة "ترتيب تسلسل الآيات" ---
function generateOrderSequence(pageAyahs, qari, handleResultCallback, optionsCount, isAudio) {
    // *** إصلاح: التأكد من أن الآيات فريدة - هذا هو إصلاح المشكلة الرئيسية ***
    const uniqueAyahs = pageAyahs.filter((ayah, index, self) => index === self.findIndex((t) => t.number === ayah.number));
    if (uniqueAyahs.length < optionsCount) return null;
    const startIndex = Math.floor(Math.random() * (uniqueAyahs.length - optionsCount + 1));
    const correctSequence = uniqueAyahs.slice(startIndex, startIndex + optionsCount);
    const scrambledSequence = shuffleArray(correctSequence);
    let selectedOrder = [];

    const questionHTML = `
        <h3>السؤال: ${isAudio ? 'استمع للآيات ثم رتبها حسب تسلسلها الصحيح في المصحف.' : 'رتب الآيات التالية حسب تسلسلها الصحيح في المصحف.'}</h3>
        ${isAudio ? `<audio controls src="https://cdn.islamic.network/quran/audio/128/${correctSequence.map(a => a.number).join(',')}.mp3"></audio>` : ''}
        <div id="sequence-answer-area" class="sequence-answer"></div>
        <hr>
        <div id="sequence-options-area" class="sequence-options">
            ${scrambledSequence.map(ayah => `<button class="sequence-option" data-number="${ayah.number}">${isAudio ? `الآية ${scrambledSequence.indexOf(ayah) + 1}` : ayah.text}</button>`).join('')}
        </div>
    `;

    const setupListeners = (area) => {
        const optionsArea = area.querySelector('#sequence-options-area');
        const answerArea = area.querySelector('#sequence-answer-area');

        optionsArea.addEventListener('click', e => {
            if (e.target.classList.contains('sequence-option') && !e.target.disabled) {
                selectedOrder.push(e.target.dataset.number);
                answerArea.innerHTML += `<div class="sequence-answer-item">${e.target.innerHTML}</div>`;
                e.target.disabled = true;

                if (selectedOrder.length === optionsCount) {
                    const userOrderString = selectedOrder.join(',');
                    const correctOrderString = correctSequence.map(a => a.number).join(',');
                    const isCorrect = userOrderString === correctOrderString;
                    handleResultCallback(isCorrect, "الترتيب الصحيح هو ما تم عرضه.", answerArea, 'order_sequence');
                }
            }
        });
    };
    return { questionHTML, setupListeners };
}

// --- 7. دالة عامة لأسئلة "حدود الصفحة" ---
function generateFindBoundary(pageAyahs, qari, handleResultCallback, optionsCount, isFirst, isAudio) {
    // *** إصلاح: التأكد من أن الآيات فريدة ***
    const uniqueAyahs = pageAyahs.filter((ayah, index, self) => index === self.findIndex((t) => t.number === ayah.number));
    if (uniqueAyahs.length < optionsCount) return null;
    const correctAnswer = isFirst ? uniqueAyahs[0] : uniqueAyahs[uniqueAyahs.length - 1];
    const wrongOptions = shuffleArray(uniqueAyahs.filter(a => a.number !== correctAnswer.number)).slice(0, optionsCount - 1);
    if (wrongOptions.length < optionsCount - 1) return null;
    const options = shuffleArray([correctAnswer, ...wrongOptions]);

    const questionHTML = `
        <h3>السؤال: ما هي ${isFirst ? 'أول' : 'آخر'} آية في هذه الصفحة؟</h3>
        ${isAudio 
            ? options.map(opt => `<div class="option-div-audio"><audio controls src="https://cdn.islamic.network/quran/audio/128/${qari}/${opt.number}.mp3"></audio><button class="audio-choice-btn" data-number="${opt.number}">اختر</button></div>`).join('')
            : options.map(opt => `<div class="option-div" data-number="${opt.number}">${opt.text}</div>`).join('')
        }
    `;
    const setupListeners = (area) => area.querySelectorAll(isAudio ? '.audio-choice-btn' : '.option-div').forEach(el => 
        el.addEventListener('click', () => handleResultCallback(parseInt(el.dataset.number) === correctAnswer.number, correctAnswer.text, el, `find_boundary_${isFirst ? 'first' : 'last'}`))
    );
    return { questionHTML, setupListeners };
}

// --- 8. دالة عامة لأسئلة "تحديد موقع الآية" ---
function generateLocatePosition(pageAyahs, qari, handleResultCallback, optionsCount, isAudio) {
    // *** إصلاح: التأكد من أن الآيات فريدة - هذا هو إصلاح المشكلة التي أبلغت عنها ***
    const uniqueAyahs = pageAyahs.filter((ayah, index, self) => index === self.findIndex((t) => t.number === ayah.number));
    if (uniqueAyahs.length < 1) return null;
    const questionAyah = shuffleArray(uniqueAyahs)[0];
    const correctPosition = uniqueAyahs.findIndex(a => a.number === questionAyah.number) + 1;
    const wrongPositions = [];
    while (wrongPositions.length < optionsCount - 1) {
        const randomPos = Math.floor(Math.random() * uniqueAyahs.length) + 1;
        if (randomPos !== correctPosition && !wrongPositions.includes(randomPos)) {
            wrongPositions.push(randomPos);
        }
    }
    if (wrongPositions.length < optionsCount - 1) return null;
    const options = shuffleArray([correctPosition, ...wrongPositions]);

    const questionHTML = `
        <h3>السؤال: ما هو الترتيب الرقمي ${isAudio ? 'للآية التي ستستمع إليها' : 'لهذه الآية'} في الصفحة؟</h3>
        ${isAudio ? `<audio controls src="https://cdn.islamic.network/quran/audio/128/${qari}/${questionAyah.number}.mp3"></audio>` : `<p class="question-text ayah-text">${questionAyah.text}</p>`}
        <hr>
        <div class="options-grid">
            ${options.map(opt => `<button class="option-button" data-answer="${opt}">${opt}</button>`).join('')}
        </div>
    `;
    const setupListeners = (area) => area.querySelectorAll('.option-button').forEach(el => 
        el.addEventListener('click', () => handleResultCallback(parseInt(el.dataset.answer) === correctPosition, `الترتيب الصحيح هو ${correctPosition}`, el, 'locate_position'))
    );
    return { questionHTML, setupListeners };
}

// =============================================================
// == ▼▼▼ الكتالوج النهائي الشامل لـ 65 مولدًا ▼▼▼
// =============================================================
const allQuestionGenerators = {
    // 1. اختر التالي (8)
    'choose_next_text_3': (p, i, q, h) => generateChooseNext(p, q, h, 3, false),
    'choose_next_text_4': (p, i, q, h) => generateChooseNext(p, q, h, 4, false),
    'choose_next_text_5': (p, i, q, h) => generateChooseNext(p, q, h, 5, false),
    'choose_next_text_6': (p, i, q, h) => generateChooseNext(p, q, h, 6, false),
    'choose_next_audio_text_3': (p, i, q, h) => generateChooseNext(p, q, h, 3, true),
    'choose_next_audio_text_4': (p, i, q, h) => generateChooseNext(p, q, h, 4, true),
    'choose_next_audio_text_5': (p, i, q, h) => generateChooseNext(p, q, h, 5, true),
    'choose_next_audio_text_6': (p, i, q, h) => generateChooseNext(p, q, h, 6, true),

    // 2. اختر السابق (8)
    'choose_prev_text_3': (p, i, q, h) => generateChoosePrevious(p, q, h, 3, false),
    'choose_prev_text_4': (p, i, q, h) => generateChoosePrevious(p, q, h, 4, false),
    'choose_prev_text_5': (p, i, q, h) => generateChoosePrevious(p, q, h, 5, false),
    'choose_prev_text_6': (p, i, q, h) => generateChoosePrevious(p, q, h, 6, false),
    'choose_prev_audio_text_3': (p, i, q, h) => generateChoosePrevious(p, q, h, 3, true),
    'choose_prev_audio_text_4': (p, i, q, h) => generateChoosePrevious(p, q, h, 4, true),
    'choose_prev_audio_text_5': (p, i, q, h) => generateChoosePrevious(p, q, h, 5, true),
    'choose_prev_audio_text_6': (p, i, q, h) => generateChoosePrevious(p, q, h, 6, true),

    // 3. الآية الدخيلة (8)
    'find_intruder_text_3': (p, i, q, h) => generateFindIntruder(p, i, q, h, 3, false),
    'find_intruder_text_4': (p, i, q, h) => generateFindIntruder(p, i, q, h, 4, false),
    'find_intruder_text_5': (p, i, q, h) => generateFindIntruder(p, i, q, h, 5, false),
    'find_intruder_text_6': (p, i, q, h) => generateFindIntruder(p, i, q, h, 6, false),
    'find_intruder_audio_3': (p, i, q, h) => generateFindIntruder(p, i, q, h, 3, true),
    'find_intruder_audio_4': (p, i, q, h) => generateFindIntruder(p, i, q, h, 4, true),
    'find_intruder_audio_5': (p, i, q, h) => generateFindIntruder(p, i, q, h, 5, true),
    'find_intruder_audio_6': (p, i, q, h) => generateFindIntruder(p, i, q, h, 6, true),

    // 4. أكمل الآية (6)
    'complete_ayah_two_words_4': (p, i, q, h) => generateCompleteAyah(p, i, q, h, 2, 4),
    'complete_ayah_two_words_5': (p, i, q, h) => generateCompleteAyah(p, i, q, h, 2, 5),
    'complete_ayah_two_words_6': (p, i, q, h) => generateCompleteAyah(p, i, q, h, 2, 6),
    'complete_ayah_three_words_4': (p, i, q, h) => generateCompleteAyah(p, i, q, h, 3, 4),
    'complete_ayah_three_words_5': (p, i, q, h) => generateCompleteAyah(p, i, q, h, 3, 5),
    'complete_ayah_three_words_6': (p, i, q, h) => generateCompleteAyah(p, i, q, h, 3, 6),

    // 5. ترتيب كلمات الآية (3)
    'scrambled_words_easy': (p, i, q, h) => generateScrambledWords(p, q, h, 'easy'),
    'scrambled_words_medium': (p, i, q, h) => generateScrambledWords(p, q, h, 'medium'),
    'scrambled_words_hard': (p, i, q, h) => generateScrambledWords(p, q, h, 'hard'),

    // 6. ترتيب تسلسل الآيات (8)
    'order_sequence_text_3': (p, i, q, h) => generateOrderSequence(p, q, h, 3, false),
    'order_sequence_text_4': (p, i, q, h) => generateOrderSequence(p, q, h, 4, false),
    'order_sequence_text_5': (p, i, q, h) => generateOrderSequence(p, q, h, 5, false),
    'order_sequence_text_6': (p, i, q, h) => generateOrderSequence(p, q, h, 6, false),
    'order_sequence_audio_3': (p, i, q, h) => generateOrderSequence(p, q, h, 3, true),
    'order_sequence_audio_4': (p, i, q, h) => generateOrderSequence(p, q, h, 4, true),
    'order_sequence_audio_5': (p, i, q, h) => generateOrderSequence(p, q, h, 5, true),
    'order_sequence_audio_6': (p, i, q, h) => generateOrderSequence(p, q, h, 6, true),

    // 7. حدود الصفحة (16)
    'find_boundary_first_text_3': (p, i, q, h) => generateFindBoundary(p, q, h, 3, true, false),
    'find_boundary_first_text_4': (p, i, q, h) => generateFindBoundary(p, q, h, 4, true, false),
    'find_boundary_first_text_5': (p, i, q, h) => generateFindBoundary(p, q, h, 5, true, false),
    'find_boundary_first_text_6': (p, i, q, h) => generateFindBoundary(p, q, h, 6, true, false),
    'find_boundary_last_text_3': (p, i, q, h) => generateFindBoundary(p, q, h, 3, false, false),
    'find_boundary_last_text_4': (p, i, q, h) => generateFindBoundary(p, q, h, 4, false, false),
    'find_boundary_last_text_5': (p, i, q, h) => generateFindBoundary(p, q, h, 5, false, false),
    'find_boundary_last_text_6': (p, i, q, h) => generateFindBoundary(p, q, h, 6, false, false),
    'find_boundary_first_audio_3': (p, i, q, h) => generateFindBoundary(p, q, h, 3, true, true),
    'find_boundary_first_audio_4': (p, i, q, h) => generateFindBoundary(p, q, h, 4, true, true),
    'find_boundary_first_audio_5': (p, i, q, h) => generateFindBoundary(p, q, h, 5, true, true),
    'find_boundary_first_audio_6': (p, i, q, h) => generateFindBoundary(p, q, h, 6, true, true),
    'find_boundary_last_audio_3': (p, i, q, h) => generateFindBoundary(p, q, h, 3, false, true),
    'find_boundary_last_audio_4': (p, i, q, h) => generateFindBoundary(p, q, h, 4, false, true),
    'find_boundary_last_audio_5': (p, i, q, h) => generateFindBoundary(p, q, h, 5, false, true),
    'find_boundary_last_audio_6': (p, i, q, h) => generateFindBoundary(p, q, h, 6, false, true),

    // 8. تحديد موقع الآية (8)
    'locate_position_text_3': (p, i, q, h) => generateLocatePosition(p, q, h, 3, false),
    'locate_position_text_4': (p, i, q, h) => generateLocatePosition(p, q, h, 4, false),
    'locate_position_text_5': (p, i, q, h) => generateLocatePosition(p, q, h, 5, false),
    'locate_position_text_6': (p, i, q, h) => generateLocatePosition(p, q, h, 6, false),
    'locate_position_audio_3': (p, i, q, h) => generateLocatePosition(p, q, h, 3, true),
    'locate_position_audio_4': (p, i, q, h) => generateLocatePosition(p, q, h, 4, true),
    'locate_position_audio_5': (p, i, q, h) => generateLocatePosition(p, q, h, 5, true),
    'locate_position_audio_6': (p, i, q, h) => generateLocatePosition(p, q, h, 6, true),
};