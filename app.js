(()=> {
  const $ = id => document.getElementById(id);
  const KEY = "studyStarHomeV12";
  const EXAM = new Date("2027-02-03T00:00:00");
  const categories = ["理系宿題","文系宿題","塾での学習","過去問","模試解き直し","苦手克服","自由学習"];

  let state = JSON.parse(localStorage.getItem(KEY) || "{}");
  const now = new Date();
  const today = now.toISOString().slice(0,10);

  if (state.date !== today) {
    state.date = today;
    state.dailyChallenges = 0;
    state.openCount = 0;
    state.missions = {};
  }

  state.openCount = (state.openCount || 0) + 1;
  state.points = Number(state.points || 0);
  state.dailyChallenges = Number(state.dailyChallenges || 0);
  state.missions = state.missions || {};
  save();

  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

  function render(){
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const exam = new Date(EXAM.getFullYear(), EXAM.getMonth(), EXAM.getDate());
    $("days").textContent = "あと" + Math.max(0, Math.ceil((exam-start)/86400000)) + "日";
    $("points").textContent = state.points + " pt";
    const filled = Math.min(5, state.dailyChallenges);
    $("stars").textContent = "★ ".repeat(filled) + "☆ ".repeat(5-filled);
    $("jumpBar").style.width = (filled * 20) + "%";
    $("pointBar").style.width = Math.min(100, state.points / 800 * 100) + "%";
  }

  const messageDialog = $("messageDialog");
  function show(title,text){
    $("dialogTitle").textContent = title;
    $("dialogText").textContent = text;
    messageDialog.showModal();
  }
  $("closeDialog").onclick = () => messageDialog.close();

  let selectedCategory = "";

  categories.forEach(cat => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = cat;
    button.addEventListener("click", () => {
      selectedCategory = cat;
      $("readyCategory").textContent = cat;
      $("categoryDialog").close();
      window.setTimeout(() => $("readyDialog").showModal(), 50);
    });
    $("categoryList").appendChild(button);

    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    $("recordCategory").appendChild(option);
  });

  $("challengeBtn").addEventListener("click", () => $("categoryDialog").showModal());

  $("backToCategory").addEventListener("click", () => {
    $("readyDialog").close();
    window.setTimeout(() => $("categoryDialog").showModal(), 50);
  });

  $("closeReady").addEventListener("click", () => $("readyDialog").close());

  let remaining = 2700;
  let interval = null;
  let paused = false;
  let running = false;

  function drawTimer(){
    $("timer").textContent =
      String(Math.floor(remaining / 60)).padStart(2,"0") + ":" +
      String(remaining % 60).padStart(2,"0");
  }

  function startCountdown(){
    if (running) return;
    remaining = 2700;
    paused = false;
    running = true;
    $("timerCategory").textContent = selectedCategory;
    $("pauseTimer").textContent = "一時停止";
    drawTimer();
    $("readyDialog").close();
    window.setTimeout(() => $("timerDialog").showModal(), 50);

    clearInterval(interval);
    interval = window.setInterval(() => {
      if (!paused && remaining > 0) {
        remaining -= 1;
        drawTimer();
      }
      if (remaining === 0) finishNormally();
    }, 1000);
  }

  $("startChallenge").addEventListener("click", startCountdown);

  function finishNormally(){
    if (!running || remaining !== 0) return;
    clearInterval(interval);
    running = false;
    state.dailyChallenges += 1;
    state.points += 50;
    state.missions[0] = true;
    save();
    render();
    $("timerDialog").close();
    show("よし、チャージ完了！","45分やり切ったね。スターエナジーを50pt獲得！カイトもひと休憩しよう😊");
  }

  $("pauseTimer").addEventListener("click", () => {
    if (!running) return;
    paused = !paused;
    $("pauseTimer").textContent = paused ? "再開" : "一時停止";
  });

  $("cancelTimer").addEventListener("click", () => {
    clearInterval(interval);
    running = false;
    paused = false;
    $("timerDialog").close();
    show("Challenge45を中止しました","途中ではポイントは加算されません。");
  });

  $("recordBtn").addEventListener("click", () => $("recordDialog").showModal());
  $("saveRecord").addEventListener("click", e => {
    e.preventDefault();
    $("recordDialog").close();
    show("記録できたよ！",$("recordCategory").value + "を" + $("recordMinutes").selectedOptions[0].textContent + "、学習時間に加えました。");
  });

  document.querySelectorAll("[data-title]").forEach(button => {
    button.addEventListener("click", () => show(button.dataset.title,"この機能は順次追加します。"));
  });

  let longPress;
  $("logo").addEventListener("pointerdown", () => {
    longPress = setTimeout(() => $("parentDialog").showModal(),1200);
  });
  ["pointerup","pointerleave","pointercancel"].forEach(name => {
    $("logo").addEventListener(name, () => clearTimeout(longPress));
  });

  $("login").addEventListener("click", e => {
    e.preventDefault();
    if ($("password").value === "460631") {
      $("parentDialog").close();
      show("保護者モード","認証できました。");
    } else {
      $("error").hidden = false;
    }
  });

  render();
})();