let timer;
let point;
let score = 0;
let isStarted = false;
let isChecking = false;
let showAbility2;
let showAbility3;
let showAbility4;
let showImage;

function addInputEventHandler(inputTags, inputTag, i, totalTags) {
  inputTag.oninput = () => {
    if (isStarted && !isChecking) {
      inputTag.value = inputTag.value.toUpperCase();
      inputTag.setAttribute('maxlength', '1');
      if (i === totalTags - 1) {
        inputTag.blur();
      }
      else {
        inputTags[i + 1].focus();
      }
    }
  };

  inputTag.onkeydown = (event) => {
    if (!isStarted || isChecking) {
      event.preventDefault();
    }
    else {
      if (event.keyCode < 65 || event.keyCode > 90) {
        event.preventDefault();
      }

      if (event.keyCode === 37) {
        if (i === 0) {
          inputTags[totalTags - 1].focus();
        }
        else {
          inputTags[i - 1].focus();
        }
      }
      else if (event.keyCode === 39) {
        if (i === totalTags - 1) {
          inputTags[0].focus();
        }
        else {
          inputTags[i + 1].focus();
        }
      }
      else if (event.keyCode === 8) {
        inputTag.value = '';
      }
    }
  };
}

function checkAnswer(inputTags, totalTags, answer) {
  isChecking = true;
  let yourAnswer = '';
  for (let i = 0; i < totalTags; i++) {
    inputTags[i].setAttribute('maxlength', '1');
    yourAnswer += inputTags[i].value;
  }
  yourAnswer = yourAnswer.toUpperCase();

  clearInterval(timer);
  if (yourAnswer === answer) {
    changeColor(inputTags, totalTags, 'green', 'fas fa-check');
    setTimeout(() => {
      changeColor(inputTags, totalTags, 'black', '');
      isChecking = false;
      updateScore();
      endQuestion();
    }, 1000);
  }
  else {
    changeColor(inputTags, totalTags, 'red', 'fas fa-xmark');
    setTimeout(() => {
      changeColor(inputTags, totalTags, 'black', '');
      isChecking = false;
      startTimer();
    }, 1000);
  }
}

function changeColor(inputTags, totalTags, color, iconClass) {
  for (let i = 0; i < totalTags; i++) {
    inputTags[i].style.color = color;
  }
  document.querySelector('i').className = iconClass;
}

function updateScore() {
  score += point;
  document.querySelector('.score').innerText = score;
}

async function getHighScore() {
  const res = await fetch('/highscore');
  const data = await res.json();
  return data.highscore;
}

async function updateHighScore() {
  const highscore = await getHighScore();
  if (score > highscore) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ highscore: score })
    };
    await fetch('/highscore', options);
  }
  document.querySelector('.skip').innerText = 'Go To Home Page';
}

function startTimer() {
  timer = setInterval(() => {
    if (Number(document.querySelector('.time').innerText) > 0) {
      document.querySelector('.time').innerText = Number(document.querySelector('.time').innerText) - 1;
    }
    else {
      endQuestion(true);
      updateHighScore();
    }
  }, 1000);
}

function setAllTimeouts(heroData) {
  showAbility2 = setTimeout(() => {
    document.querySelector('.ability:nth-of-type(2) .img').style.backgroundImage = `url(${heroData.abilities[1].img})`;
    document.querySelector('.ability:nth-of-type(2) h3').innerText = heroData.abilities[1].name;
  }, 3000);
  showAbility3 = setTimeout(() => {
    point = 5;
    document.querySelector('.ability:nth-of-type(3) .img').style.backgroundImage = `url(${heroData.abilities[2].img})`;
    document.querySelector('.ability:nth-of-type(3) h3').innerText = heroData.abilities[2].name;
  }, 6000);
  showAbility4 = setTimeout(() => {
    document.querySelector('.ability:last-of-type .img').style.backgroundImage = `url(${heroData.abilities[3].img})`;
    document.querySelector('.ability:last-of-type h3').innerText = heroData.abilities[3].name;
  }, 9000);
  showImage = setTimeout(() => {
    point = 3;
    document.querySelector('.hero-img').style.backgroundImage = `url(${heroData.hero_img})`;
  }, 12000);
}

function clearAllTimeouts() {
  clearTimeout(showAbility2);
  clearTimeout(showAbility3);
  clearTimeout(showAbility4);
  clearTimeout(showImage);
}

function removeInputTags() {
  const wrapper = document.querySelector('.wrapper');
  while (wrapper.hasChildNodes()) {
    wrapper.removeChild(wrapper.firstChild);
  }
}

function createInputTags(name) {
  removeInputTags();
  const arrayOfNames = name.split(' ');

  for (let i = 0; i < arrayOfNames.length; i++) {
    const row = document.createElement('div');
    row.className = 'row';

    for (let j = 0; j < arrayOfNames[i].length; j++) {
      const inputTag = document.createElement('input');
      inputTag.setAttribute('type', 'text');
      inputTag.setAttribute('maxlength', '1');
      row.appendChild(inputTag);
    }

    document.querySelector('.wrapper').appendChild(row);
  }

  const inputTags = document.querySelectorAll('input');
  const totalTags = inputTags.length;
  inputTags.forEach((inputTag, i) => {
    inputTag.onfocus = () => {
      inputTag.setSelectionRange(0, inputTag.value.length);
    };
    addInputEventHandler(inputTags, inputTag, i, totalTags);
  });

  document.onkeydown = null;
  document.onkeydown = (event) => {
    if (event.key === 'Enter' && isStarted && !isChecking) {
      checkAnswer(inputTags, totalTags, name.replace(' ', ''));
    }
  };
}

async function startQuestion() {
  const randomNum = Math.floor(Math.random() * 123) + 1;
  const res = await fetch(`/heroes/${randomNum}`);
  const heroData = await res.json();

  createInputTags(heroData.name);
  isStarted = true;
  point = 8;

  document.querySelector('.attribute .img').style.backgroundImage = `url(${heroData.attribute_img})`;
  document.querySelector('.attribute h3:last-of-type').innerText = heroData.attribute;
  document.querySelector('.ability:first-of-type .img').style.backgroundImage = `url(${heroData.abilities[0].img})`;
  document.querySelector('.ability:first-of-type h3').innerText = heroData.abilities[0].name;

  startTimer();
  setAllTimeouts(heroData);
}

function endQuestion(gameOver = false) {
  clearAllTimeouts()
  clearInterval(timer);
  isStarted = false;
  if (!gameOver) {
    document.querySelector('.attribute .img').style.backgroundImage = '';
    document.querySelector('.attribute h3:last-of-type').innerText = '?';

    document.querySelector('.ability:first-of-type .img').style.backgroundImage = '';
    document.querySelector('.ability:first-of-type h3').innerText = '?';

    document.querySelector('.ability:nth-of-type(2) .img').style.backgroundImage = '';
    document.querySelector('.ability:nth-of-type(2) h3').innerText = '?';

    document.querySelector('.ability:nth-of-type(3) .img').style.backgroundImage = '';
    document.querySelector('.ability:nth-of-type(3) h3').innerText = '?';

    document.querySelector('.ability:last-of-type .img').style.backgroundImage = '';
    document.querySelector('.ability:last-of-type h3').innerText = '?';

    document.querySelector('.hero-img').style.backgroundImage = '';
    startQuestion();
  }
}

window.onload = () => {
  const skipButton = document.querySelector('.skip');
  skipButton.onclick = () => {
    if (isStarted && !isChecking) {
      endQuestion();
    }
    else if (skipButton.innerText === 'Go To Home Page') {
      window.location.replace('/');
    }
  };

  startQuestion();
};