function sleep(ms) {
  return new Promise(resolve => setInterval(resolve, ms));
}

async function countDown(secs) {
  for (let i = 3; i > 0; i--) {
    await sleep(1000);
    secs.innerText = Number(secs.innerText) - 1;
  }
  document.querySelector('form').submit();
}

async function getHighScore() {
  const res = await fetch('/highscore');
  const data = await res.json();
  document.querySelector('.highscore').innerText = data.highscore;
}

window.onload = () => {
  const button = document.querySelector('button');
  const secs = document.querySelector('#secs');
  const h2 = document.querySelectorAll('h2')[2];
  let clicked = false;
  getHighScore();

  button.onclick = (e) => {
    if (!clicked) {
      e.preventDefault();
      clicked = true;
      button.style.display = 'none';
      h2.style.display = 'block';
      h2.style.animation = 'count-down 1s ease-in-out infinite';
      countDown(secs);
    }
  }
};