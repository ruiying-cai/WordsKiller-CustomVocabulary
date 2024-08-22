document.addEventListener('DOMContentLoaded', () => {
    const enterButton = document.getElementById('enter');
    const fileInput = document.getElementById('file-input');
    const mainDiv = document.getElementById('main');
    const studyDiv = document.getElementById('study');
    const wordsDiv = document.getElementById('words');
    const refreshButton = document.getElementById('refresh');
    const saveExitButton = document.getElementById('save-exit');
    const progressText = document.getElementById('progress');
    const studyProgressText = document.getElementById('study-progress');
    const allWordsButton = document.getElementById('all-words');
    const filterKillButton = document.getElementById('filter-kill');
    const filterUnkillButton = document.getElementById('filter-unkill');
    const allWordsPage = document.getElementById('all-words-page');
    const wordListDiv = document.getElementById('word-list');
    const backButton = document.getElementById('back');

    let words = JSON.parse(localStorage.getItem('words')) || [];
    let killList = JSON.parse(localStorage.getItem('killList')) || [];
    let totalWords = words.length;
    let killedWords = killList.length;

    if (words.length > 0) {
        updateProgress();
    }

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            words = XLSX.utils.sheet_to_json(sheet);
            totalWords = words.length;
            localStorage.setItem('words', JSON.stringify(words));
            updateProgress();
        };
        reader.readAsArrayBuffer(file);
    });

    enterButton.addEventListener('click', () => {
        mainDiv.style.display = 'none';
        studyDiv.style.display = 'block';
        displayWords();
    });

    refreshButton.addEventListener('click', displayWords);

    saveExitButton.addEventListener('click', () => {
        mainDiv.style.display = 'block';
        studyDiv.style.display = 'none';
        updateProgress();
    });

    allWordsButton.addEventListener('click', () => {
        mainDiv.style.display = 'none';
        studyDiv.style.display = 'none';
        allWordsPage.style.display = 'block';
        displayAllWords();
    });

    filterKillButton.addEventListener('click', () => {
        mainDiv.style.display = 'none';
        studyDiv.style.display = 'none';
        allWordsPage.style.display = 'block';
        displayAllWords('kill');
    });

    filterUnkillButton.addEventListener('click', () => {
        mainDiv.style.display = 'none';
        studyDiv.style.display = 'none';
        allWordsPage.style.display = 'block';
        displayAllWords('unkill');
    });

    backButton.addEventListener('click', () => {
        allWordsPage.style.display = 'none';
        mainDiv.style.display = 'block';
        mainDiv.style.display = 'flex';
        mainDiv.style.flexDirection = 'column';
        mainDiv.style.alignItems = 'center';
        mainDiv.style.justifyContent = 'center';
        mainDiv.style.height = '100vh';
    });

    function updateProgress() {
        progressText.textContent = `Progress: ${killedWords}/${totalWords}`;
        studyProgressText.textContent = `Progress: ${killedWords}/${totalWords}`;
    }

    function displayWords() {
        wordsDiv.innerHTML = '';
        const sampleWords = getRandomWords(5);
        sampleWords.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'word';
            wordDiv.innerHTML = `
                <p><strong>${word.word}</strong> <span class="part-of-speech">(${word['part of speech']})</span>
                <button class="kill-btn">${killList.includes(word.word) ? 'Withdraw' : 'Kill'}</button></p>
                <p class="definition">${word.definition}</p>
                <p class="example">${word.example}</p>
            `;
            const killButton = wordDiv.querySelector('.kill-btn');
            killButton.addEventListener('click', () => {
                if (killList.includes(word.word)) {
                    killList = killList.filter(w => w !== word.word);
                    killedWords--;
                    killButton.textContent = 'Kill';
                } else {
                    killList.push(word.word);
                    killedWords++;
                    killButton.textContent = 'Withdraw';
                }
                localStorage.setItem('killList', JSON.stringify(killList));
                updateProgress();
            });
            wordsDiv.appendChild(wordDiv);
        });
    }

    function displayAllWords(filter = 'all') {
        wordListDiv.innerHTML = '';
        let filteredWords = words;
        if (filter === 'kill') {
            filteredWords = words.filter(word => killList.includes(word.word));
            allWordsPage.querySelector('h1').textContent = 'Killed';
        } else if (filter === 'unkill') {
            filteredWords = words.filter(word => !killList.includes(word.word));
            allWordsPage.querySelector('h1').textContent = 'Unkilled';
        } else {
            allWordsPage.querySelector('h1').textContent = 'All Words';
        }
        filteredWords.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'word';
            if (killList.includes(word.word)) {
                wordDiv.classList.add('killed');
            }
            wordDiv.innerHTML = `
                <p><strong>${word.word}</strong> <span class="part-of-speech">(${word['part of speech']})</span>
                <button class="kill-btn">${killList.includes(word.word) ? 'Withdraw' : 'Kill'}</button></p>
                <p class="definition">${word.definition}</p>
                <p class="example">${word.example}</p>
            `;
            const killButton = wordDiv.querySelector('.kill-btn');
            killButton.addEventListener('click', () => {
                if (killList.includes(word.word)) {
                    killList = killList.filter(w => w !== word.word);
                    killedWords--;
                    killButton.textContent = 'Kill';
                    wordDiv.classList.remove('killed');
                } else {
                    killList.push(word.word);
                    killedWords++;
                    killButton.textContent = 'Withdraw';
                    wordDiv.classList.add('killed');
                }
                localStorage.setItem('killList', JSON.stringify(killList));
                updateProgress();
            });
            wordListDiv.appendChild(wordDiv);
        });
    }

    function getRandomWords(count) {
        const availableWords = words.filter(word => !killList.includes(word.word));
        const shuffled = availableWords.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
});
