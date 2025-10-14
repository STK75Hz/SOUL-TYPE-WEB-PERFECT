const words = 'i you me we us the to be go do my in on up at by of so no yes run fly win joy sun sky red big new old try eat fix aim see love hope grow life time calm kind true vibe plan work rest play read sing make code team soul stay rise push feel give take find care heal learn dream peace trust focus power smile brave strong change light sound world heart faith build start energy moment future simple steady shine gentle motion adapt purpose spark harmony patience courage fearless inspire progress belief freedom create vision clarity journey balance growth passion evolve achieve success mindful steadyflow positivity reflection unity gratitude challenge discover potential explore limitless endurance mindset discipline perspective improvement happiness motivation connection adventure foundation resilience determination persistence transformation serenity unstoppable'.split(' ');

const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;

function addClass(el, name) {
    el.className += ' ' + name;
}

function removeClass(el, name) {
    el.classList.remove(name);
}

function randomWord() {
    const randomIndex = Math.floor(Math.random() * wordsCount);
    return words[randomIndex];
}

function formatWord(word) {
    return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

// 🧠 เริ่มเกมใหม่
function newGame() {
    const wordsEl = document.getElementById('words');
    wordsEl.innerHTML = '';

    for (let i = 0; i < 200; i++) {
        wordsEl.innerHTML += formatWord(randomWord());
    }

    // ✅ รีเซ็ตการเลื่อนกลับบรรทัดแรก
    wordsEl.style.marginTop = '0px';

    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.word .letter'), 'current');

    document.getElementById('info').innerHTML = (gameTime / 1000) + '';
    window.timer = null;
    window.gameStart = null;

    removeClass(document.getElementById('game'), 'over');

    // ✅ เซ็ตเคอร์เซอร์ตรงตัวแรก (รอ DOM เสร็จ)
    setTimeout(() => {
        const cursor = document.getElementById('cursor');
        const firstLetter = document.querySelector('.letter.current');
        if (cursor && firstLetter) {
            const rect = firstLetter.getBoundingClientRect();
            cursor.style.top = rect.top + 2 + 'px';
            cursor.style.left = rect.left + 'px';
        }
    }, 100);

    // ✅ เมื่อ focus อีกครั้ง เคอร์เซอร์จะกลับไปตำแหน่งถูกต้อง
    const game = document.getElementById('game');
    game.addEventListener('focus', () => {
        const cursor = document.getElementById('cursor');
        const firstLetter = document.querySelector('.letter.current');
        if (cursor && firstLetter) {
            const rect = firstLetter.getBoundingClientRect();
            cursor.style.top = rect.top + 2 + 'px';
            cursor.style.left = rect.left + 'px';
        }
    }, { once: true });

    // ให้เบลอก่อน ต้องคลิกเพื่อเริ่ม
    document.getElementById('game').blur();
}

function getWpm() {
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord);
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children];
        const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
        const correctLetters = letters.filter(letter => letter.className.includes('correct'));
        return incorrectLetters.length === 0 && correctLetters.length === letters.length;
    });
    return correctWords.length / gameTime * 60000;
}

function gameOver() {
    clearInterval(window.timer);
    addClass(document.getElementById('game'), 'over');
    document.getElementById('info').innerHTML = `WPM: ${getWpm()}`;
}

// 🎯 ระบบพิมพ์
document.getElementById('game').addEventListener('keyup', ev => {
    const key = ev.key;
    const currentWord = document.querySelector('.word.current');
    const currentLetter = document.querySelector('.letter.current');
    const expected = currentLetter?.innerHTML || ' ';
    const isLetter = key.length === 1 && key !== ' ';
    const isSpace = key === ' ';
    const isBackspace = key === 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;

    if (document.querySelector('#game.over')) return;

    // ⏱ เริ่มจับเวลาเมื่อเริ่มพิมพ์ตัวแรก
    if (!window.timer && isLetter) {
        window.timer = setInterval(() => {
            if (!window.gameStart) window.gameStart = (new Date()).getTime();
            const currentTime = (new Date()).getTime();
            const msPassed = currentTime - window.gameStart;
            const sPassed = Math.round(msPassed / 1000);
            const sLeft = (gameTime / 1000) - sPassed;
            if (sLeft <= 0) {
                gameOver();
                return;
            }
            document.getElementById('info').innerHTML = sLeft + ' ';
        }, 1000);
    }

    // 🔤 พิมพ์ตัวอักษร
    if (isLetter) {
        if (currentLetter) {
            addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
            removeClass(currentLetter, 'current');
            if (currentLetter.nextSibling) addClass(currentLetter.nextSibling, 'current');
        } else return;
    }

    // ␣ เว้นวรรค
    if (isSpace) {
        if (expected !== ' ') {
            const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
            lettersToInvalidate.forEach(letter => addClass(letter, 'incorrect'));
        }
        removeClass(currentWord, 'current');
        addClass(currentWord.nextSibling, 'current');
        if (currentLetter) removeClass(currentLetter, 'current');
        addClass(currentWord.nextSibling.firstChild, 'current');
    }

    // ⌫ ลบ
    if (isBackspace) {
        if (currentLetter && isFirstLetter) {
            removeClass(currentWord, 'current');
            addClass(currentWord.previousElementSibling, 'current');
            removeClass(currentLetter, 'current');
            addClass(currentWord.previousElementSibling.lastChild, 'current');
            removeClass(currentWord.previousElementSibling.lastChild, 'incorrect');
            removeClass(currentWord.previousElementSibling.lastChild, 'correct');
        }
        if (currentLetter && !isFirstLetter) {
            removeClass(currentLetter, 'current');
            addClass(currentLetter.previousElementSibling, 'current');
            removeClass(currentLetter.previousElementSibling, 'incorrect');
            removeClass(currentLetter.previousElementSibling, 'correct');
        }
        if (!currentLetter) {
            addClass(currentWord.lastChild, 'current');
            removeClass(currentWord.lastChild, 'incorrect');
            removeClass(currentWord.lastChild, 'correct');
        }
    }

    // 📏 เลื่อนคำขึ้นเมื่อบรรทัดเต็ม
    if (currentWord.getBoundingClientRect().top > 250) {
        const words = document.getElementById('words');
        const firstWord = document.querySelector('.word');
        const lineHeight = firstWord ? firstWord.offsetHeight + 5 : 35;
        const margin = parseInt(words.style.marginTop || '0px');
        words.style.marginTop = (margin - lineHeight) + 'px';
    }

    // 🟡 อัปเดตตำแหน่งเคอร์เซอร์ให้ตรง
    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    if (nextLetter || nextWord) {
        const rect = (nextLetter || nextWord).getBoundingClientRect();
        cursor.style.top = rect.top + 2 + 'px';
        cursor.style.left = rect[nextLetter ? 'left' : 'right'] + 'px';
    }
});

// 🔁 ปุ่ม New Game
document.getElementById('newGameBtn').addEventListener('click', () => {
    clearInterval(window.timer);
    window.timer = null;
    window.gameStart = null;
    newGame();
});

// 🚀 เริ่มเกมครั้งแรก
newGame();
