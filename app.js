(()=> {
  const $ = id => document.getElementById(id);
  const KEY = "studyStarHomeV10";
  const EXAM = new Date("2027-02-03T00:00:00");
  const categories = ["理系宿題","文系宿題","塾での学習","過去問","模試解き直し","苦手克服","自由学習"];

  let state = JSON.parse(localStorage.getItem(KEY) || "{}");
  const now = new Date();
  const today = now.toISOString().slice(0,10);

  if (state.date !== today) {
    state.date = today;
    state.dailyChallenges = 0;
    state.dailyMinutes = 0;
    state.openCount = 0;
    state.missions = {};
  }

  state.openCount = (state.openCount || 0) + 1;
  state.points = Number(state.points || 0);
  state.dailyChallenges = Number(state.dailyChallenges || 0);
  state.dailyMinutes = Number(state.dailyMinutes || 0);
  state.tweets = Array.isArray(state.tweets) ? state.tweets : [];
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

    ["mission1","mission2","mission3"].forEach((id,i)=>$(id).checked=!!state.missions[i]);

    const publicTweet = [...state.tweets].reverse().find(t => !t.secret);
    $("tweetPreview").textContent = publicTweet ? publicTweet.text : "今日のつぶやきを書こう！";

    const h = now.getHours();
    let g, m;
    if (state.openCount > 1) {
      g = "また会えたね、海翔！";
      m = "戻ってきたことも、ちゃんと前進だよ。";
    } else if (h < 9) {
      g = "おはよう、海翔！";
      m = "今日も最高の<br><strong>Jump</strong>にしよう！";
    } else if (h < 12) {
      g = "やぁ、海翔！";
      m = "今日はどんな自分に会えるかな。";
    } else if (h < 18) {
      g = "こんにちは、海翔！";
      m = "まず一つ、始めよう。";
    } else {
      g = "おかえり、海翔！";
      m = "今日も会えたね。";
    }
    $("greeting").textContent = g;
    $("adMessage").innerHTML = m;
  }

  const messageDialog = $("messageDialog");
  function show(title,text){
    $("dialogTitle").textContent = title;
    $("dialogText").textContent = text;
    messageDialog.showModal();
  }
  $("closeDialog").onclick = () => messageDialog.close();

  categories.forEach(cat => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = cat;
    button.onclick = () => { $("categoryDialog").close(); startTimer(cat); };
    $("categoryList").appendChild(button);

    const option = document.createElement("option");
    option.value = option.textContent = cat;
    $("recordCategory").appendChild(option);
  });

  $("challengeBtn").onclick = () => $("categoryDialog").showModal();

  let remaining = 2700;
  let interval = null;
  let paused = false;

  function drawTimer(){
    $("timer").textContent =
      String(Math.floor(remaining/60)).padStart(2,"0") + ":" +
      String(remaining%60).padStart(2,"0");
  }

  function startTimer(category){
    remaining = 2700;
    paused = false;
    $("timerCategory").textContent = category;
    $("pauseTimer").textContent = "一時停止";
    drawTimer();
    $("timerDialog").showModal();
    clearInterval(interval);
    interval = setInterval(() => {
      if (!paused && remaining > 0) { remaining--; drawTimer(); }
      if (remaining <= 0) completeChallenge();
    },1000);
  }

  function completeChallenge(){
    clearInterval(interval);
    state.dailyChallenges += 1;
    state.dailyMinutes += 45;
    state.points += 50;
    state.missions[0] = true;
    save();
    render();
    $("timerDialog").close();
    show("よし、チャージ完了！","スターエナジーを50pt獲得。カイトもひと休憩しよう😊");
  }

  $("pauseTimer").onclick = () => {
    paused = !paused;
    $("pauseTimer").textContent = paused ? "再開" : "一時停止";
  };
  $("finishTimer").onclick = completeChallenge;
  $("cancelTimer").onclick = () => { clearInterval(interval); $("timerDialog").close(); };

  $("recordBtn").onclick = () => $("recordDialog").showModal();
  $("saveRecord").onclick = e => {
    e.preventDefault();
    const mins = Number($("recordMinutes").value);
    state.dailyMinutes += mins;
    state.points += Math.round(mins/15) * 10;
    save();
    render();
    $("recordDialog").close();
    show("記録できたよ！", $("recordCategory").value + "を" + mins + "分、学習時間に加えました。");
  };

  $("tweetBtn").onclick = () => $("tweetDialog").showModal();
  $("saveTweet").onclick = e => {
    e.preventDefault();
    const text = $("tweetText").value.trim();
    if (!text) return;
    state.tweets.push({text, secret:$("secretTweet").checked, date:new Date().toISOString()});
    save();
    render();
    $("tweetText").value = "";
    $("secretTweet").checked = false;
    $("tweetDialog").close();
    show("つぶやきを残したよ","今日の気持ちを大切に保存しました。");
  };

  ["mission1","mission2","mission3"].forEach((id,i)=>{
    $(id).onchange = () => { state.missions[i] = $(id).checked; save(); };
  });

  document.querySelectorAll("[data-title]").forEach(button => {
    button.onclick = () => show(button.dataset.title,"この機能は順次追加します。");
  });

  let longPress;
  $("logo").onpointerdown = () => longPress = setTimeout(() => $("parentDialog").showModal(),1200);
  ["onpointerup","onpointerleave","onpointercancel"].forEach(name => $("logo")[name] = () => clearTimeout(longPress));

  $("login").onclick = e => {
    e.preventDefault();
    if ($("password").value === "460631") {
      $("parentDialog").close();
      show("保護者モード","認証できました。編集画面は次の更新で追加します。");
    } else {
      $("error").hidden = false;
    }
  };

  render();
})();