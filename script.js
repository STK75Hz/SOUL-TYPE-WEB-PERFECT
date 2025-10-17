const words = 'ไป มา ดู นั่ง เดิน รัก ฝัน ใจ ดี มาก น้อย ฟ้า ดิน น้ำ ลม ไฟ บ้าน เมือง ถนน ทะเล ภูเขา ดาว พระจันทร์ เช้า เย็น คืน วัน หัวใจ เวลา สุข เศร้า เหงา ยิ้ม ร้องไห้ ความฝัน ความรัก ความหวัง ความเชื่อ มิตรภาพ กำลังใจ อนาคต ปัจจุบัน ความสุข ความทุกข์ ชีวิต จิตใจ ความดี ความงาม ความสงบ ธรรมชาติ ดอกไม้ สายลม แสงแดด เสียงเพลง รอยยิ้ม แรงบันดาลใจ ความจริง เส้นทาง การเดินทาง การเริ่มต้น ความพยายาม ความสำเร็จ แรงศรัทธา ความกล้า ความอดทน ความเข้าใจ การให้อภัย ความเมตตา การเรียนรู้ การเติบโต การเปลี่ยนแปลง ความมั่นคง ความสดใส ความบริสุทธิ์ ความอบอุ่น ความคิดถึง ความทรงจำ ความตั้งใจ ความหมาย ความงดงาม การสร้างสรรค์ ความดีงาม ความเรียบง่าย ความสุขใจ ความเพียร ความสง่า การผ่อนคลาย ความมีสติ ความสงบสุข ความกล้าหาญ ความฝันใหม่'.split(' ');

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

// เริ่มเกมใหม่
function newGame() {
    const wordsEl = document.getElementById('words');
    wordsEl.innerHTML = '';

    // สร้างคำจำนวนน้อยลงเพื่อให้พอดีกับ 3 บรรทัด
    for (let i = 0; i < 50; i++) {
        wordsEl.innerHTML += formatWord(randomWord());
    }

    // รีเซ็ตการเลื่อนกลับบรรทัดแรก
    wordsEl.style.marginTop = '0px';

    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.word .letter'), 'current');

    document.getElementById('info').innerHTML = (gameTime / 1000) + '';
    window.timer = null;
    window.gameStart = null;

    removeClass(document.getElementById('game'), 'over');

    // เซ็ตเคอร์เซอร์ตรงตัวแรก
    setTimeout(() => {
        const cursor = document.getElementById('cursor');
        const firstLetter = document.querySelector('.letter.current');
        if (cursor && firstLetter) {
            const rect = firstLetter.getBoundingClientRect();
            cursor.style.top = rect.top + 2 + 'px';
            cursor.style.left = rect.left + 'px';
        }
    }, 100);

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
    document.getElementById('info').innerHTML = `WPM: ${Math.round(getWpm())}`;
}

// ระบบพิมพ์
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

    // เริ่มจับเวลาเมื่อเริ่มพิมพ์ตัวแรก
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

    // พิมพ์ตัวอักษร
    if (isLetter) {
        if (currentLetter) {
            addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
            removeClass(currentLetter, 'current');
            if (currentLetter.nextSibling) addClass(currentLetter.nextSibling, 'current');
        } else return;
    }

    // เว้นวรรค
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

    // ลบ
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

    // เลื่อนคำขึ้นเมื่อบรรทัดเต็ม (ปรับให้เลื่อนเมื่อถึงบรรทัดที่ 3)
    if (currentWord.getBoundingClientRect().top > 270) {
        const words = document.getElementById('words');
        const firstWord = document.querySelector('.word');
        const lineHeight = firstWord ? firstWord.offsetHeight + 6 : 37;
        const margin = parseInt(words.style.marginTop || '0px');
        words.style.marginTop = (margin - lineHeight) + 'px';
    }

    // อัปเดตตำแหน่งเคอร์เซอร์ให้ตรง
    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    if (nextLetter || nextWord) {
        const rect = (nextLetter || nextWord).getBoundingClientRect();
        cursor.style.top = rect.top + 2 + 'px';
        cursor.style.left = rect[nextLetter ? 'left' : 'right'] + 'px';
    }
});

// ปุ่ม New Game
document.getElementById('newGameBtn').addEventListener('click', () => {
    clearInterval(window.timer);
    window.timer = null;
    window.gameStart = null;
    newGame();
});

// เริ่มเกมครั้งแรก
newGame();