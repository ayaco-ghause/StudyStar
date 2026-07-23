
"use strict";
const $=id=>document.getElementById(id);
const CATEGORIES=["理系宿題","文系宿題","塾での学習","過去問","模試解き直し","苦手克服","自由学習"];
const REWARDS=[
 {name:"お菓子またはコンビニ軽食",points:200},
 {name:"ご褒美アイス",points:300},
 {name:"コミック",points:800},
 {name:"映画",points:1500},
 {name:"外食",points:2500}
];
const defaultState={
 records:[],tweets:[],points:0,challengeCounts:{},missions:{},
 message:"今日も最高のJumpにしよう！",
 missionTemplate:[
  {icon:"🎓",text:"塾（夏期講習）",sub:"15:50〜18:10"},
  {icon:"📘",text:"Challenge45",sub:""},
  {icon:"✏️",text:"読書15分",sub:""},
  {icon:"🌙",text:"手伝い・読書",sub:""}
 ]
};
let state;
try{state={...defaultState,...JSON.parse(localStorage.getItem("studystar_official_1")||"{}")}}catch{state={...defaultState}}
state.records=Array.isArray(state.records)?state.records:[];
state.tweets=Array.isArray(state.tweets)?state.tweets:[];
state.challengeCounts=state.challengeCounts||{};
state.missions=state.missions||{};
function save(){localStorage.setItem("studystar_official_1",JSON.stringify(state))}
function today(){return new Date().toLocaleDateString("sv-SE")}
function dateJP(d){const x=new Date(d+"T00:00:00");return `${x.getMonth()+1}/${x.getDate()}`}
function minText(m){m=Number(m)||0;return m>=60?`${Math.floor(m/60)}時間${String(m%60).padStart(2,"0")}分`:`${m}分`}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2400)}
function fillSelect(id){$(id).innerHTML=CATEGORIES.map(c=>`<option>${c}</option>`).join("")}
fillSelect("recordCategory");fillSelect("challengeCategory");
$("recordDate").value=today();$("recordDate").max=today();

const VISIT_KEY="studystar_home_visits_v1";
const VISIT_SESSION_KEY="studystar_home_session_v1";
const VISIT_GAP_MS=10*60*1000;
let currentVisitInfo={count:1,isReturn:false};

function readVisitData(){
 try{return JSON.parse(localStorage.getItem(VISIT_KEY)||"{}")||{}}catch{return {}}
}
function registerVisit(force=false){
 const now=Date.now(),key=today();
 const data=readVisitData();
 const session=Number(sessionStorage.getItem(VISIT_SESSION_KEY)||0);
 const last=Number(data.lastActiveAt||0);
 const newVisit=force||!session||(now-Math.max(session,last)>VISIT_GAP_MS);
 if(data.date!==key){data.date=key;data.count=0;data.lastActiveAt=0}
 if(newVisit){data.count=(Number(data.count)||0)+1}
 data.lastActiveAt=now;
 localStorage.setItem(VISIT_KEY,JSON.stringify(data));
 sessionStorage.setItem(VISIT_SESSION_KEY,String(now));
 currentVisitInfo={count:Math.max(1,Number(data.count)||1),isReturn:(Number(data.count)||1)>=2&&newVisit};
 return currentVisitInfo;
}
function touchVisit(){
 const now=Date.now();
 sessionStorage.setItem(VISIT_SESSION_KEY,String(now));
 const data=readVisitData();data.lastActiveAt=now;localStorage.setItem(VISIT_KEY,JSON.stringify(data));
}
function timeGreetingTitle(h){
 return h<10?"おはよう、海翔！":h<17?"やぁ、海翔！":h<20?"おかえり、海翔！":"こんばんは、海翔！";
}
function todaySummary(){
 const rows=state.records.filter(r=>r.date===today());
 return {
  minutes:rows.reduce((a,r)=>a+(Number(r.minutes)||0),0),
  points:rows.reduce((a,r)=>a+(Number(r.points)||0),0),
  challenges:Number(state.challengeCounts[today()]||0)
 };
}
function adSituationalMessage(){
 const {minutes,challenges}=todaySummary();
 const missions=state.missions[today()]||{};
 const hasJuku=(state.missionTemplate||[]).some((m,i)=>/塾/.test(m.text||"")&&!missions[i]);
 if(challenges===2)return "あとChallenge45を1回で、今日の3回目！ここからは88Pだよ！";
 if(challenges===1)return "Challenge45をもう1回できたら、今日の集中がもっと大きな星になるよ！";
 if(challenges>=3)return `今日はChallenge45を${challenges}回達成！海翔の本気、アドにも伝わっているよ！`;
 if(minutes>=180)return "今日はもう3時間以上！大きな飛躍になっているね！";
 if(minutes>=90)return "今日の積み重ね、しっかり力になっているよ！";
 if(hasJuku)return "今日は塾だね！終わったら、頑張った時間も残そう！";
 if(minutes>0)return "今日も一歩進んでいるね。次は何に挑戦する？";
 return "今日は何から始める？最初の一歩をアドと一緒に！";
}
function animateAd(kind="jump",text="ぴょーん！",shine=true){
 const stage=document.querySelector(".avatar-stage"),reaction=$("adReaction");
 if(!stage)return;
 stage.classList.remove("ad-jump","ad-celebrate","ad-guts","eye-shine");
 void stage.offsetWidth;
 stage.classList.add(kind==="celebrate"?"ad-celebrate":kind==="guts"?"ad-guts":"ad-jump");
 if(shine)stage.classList.add("eye-shine");
 if(reaction){reaction.textContent=text;reaction.classList.remove("show");void reaction.offsetWidth;reaction.classList.add("show")}
 setTimeout(()=>stage.classList.remove("ad-jump","ad-celebrate","ad-guts","eye-shine"),1800);
}
function setGreeting(){
 const h=new Date().getHours();
 const firstDaily=[
  "今日も最高のJumpにしよう！",
  "昨日の自分を、ひとつ超えよう！",
  "小さな一歩が、大きな飛躍になるよ！",
  "焦らなくて大丈夫。今日の星を灯そう！",
  "ここまで来た自分を信じて、始めよう！"
 ];
 const returnLines=[
  "また会えたね！今日はやる気がいつも以上だね！",
  "おかえり！もう一度開いたその気持ち、かっこいいぞ！",
  "また来てくれた！今日の海翔、いい流れだね！",
  "再び登場！その一歩が大きな飛躍につながるよ！",
  "また会えたね。アドの目もキラリと輝いているよ！"
 ];
 const legacy=["カイトおはよう","カイト おはよう","カイト、おはよう","カイトおはよう。"];
 if(legacy.includes((state.message||"").trim())){state.message="";save()}
 let title=timeGreetingTitle(h),body;
 const dayIndex=Math.floor(new Date().setHours(0,0,0,0)/86400000)%firstDaily.length;
 if(currentVisitInfo.count>=2){
  title=h<10?"また会えたね、海翔！":h<17?"また来てくれたね、海翔！":"おかえり、海翔！";
  body=returnLines[(currentVisitInfo.count-2)%returnLines.length]+"\n"+adSituationalMessage();
 }else{
  body=((state.message||firstDaily[dayIndex]).trim())+"\n"+adSituationalMessage();
 }
 $("greetingTitle").textContent=title;
 const safe=body.replace("Jump","<strong>Jump</strong>").replace(/。(?=.)/g,"。<br>").replace(/\n/g,"<br>");
 $("greetingBody").innerHTML=safe;
}
function renderHomeToday(){
 const x=todaySummary();
 if($("homeTodayStudy"))$("homeTodayStudy").textContent=minText(x.minutes);
 if($("homeTodayChallenge"))$("homeTodayChallenge").textContent=`${x.challenges}回`;
 if($("homeTodayPoints"))$("homeTodayPoints").textContent=`${x.points}P`;
}

function renderMission(){
 const key=today(), checks=state.missions[key]||{};
 $("missionList").innerHTML=state.missionTemplate.map((m,i)=>`
 <label class="mission-item"><span>${m.icon} ${m.text}${m.sub?`<br><small>${m.sub}</small>`:""}</span>
 <input type="checkbox" data-mission="${i}" ${checks[i]?"checked":""}></label>`).join("");
 document.querySelectorAll("[data-mission]").forEach(el=>el.onchange=()=>{
  state.missions[key]=state.missions[key]||{};
  state.missions[key][el.dataset.mission]=el.checked;save();renderJump();renderMissionWorld();
 });
}
function examCountdown(){
 const target=new Date("2027-02-03T00:00:00");
 const now=new Date();now.setHours(0,0,0,0);
 const days=Math.max(0,Math.ceil((target-now)/86400000));
 $("examCountdown").textContent=`あと${days}日`;
}
function totals(){
 const all=state.records.reduce((a,r)=>a+(Number(r.minutes)||0),0);
 const td=state.records.filter(r=>r.date===today()).reduce((a,r)=>a+(Number(r.minutes)||0),0);
 return {all,td};
}
function renderSummer(){
 const {all,td}=totals(), goal=18000, remain=Math.max(0,goal-all), pct=Math.min(100,all/goal*100);
 $("summerTotal").textContent=minText(all);
 $("summerRemain").textContent=minText(remain);
 $("todayTotal").textContent=minText(td);
 $("summerPercent").textContent=`${pct.toFixed(1)}%`;
 $("summerBar").style.width=`${pct}%`;
}
function renderJump(){
 const count=state.challengeCounts[today()]||0;
 const stars=Math.min(5,count);
 $("todayStars").textContent="★".repeat(stars)+"☆".repeat(5-stars);
 $("jumpBar").style.width=`${stars/5*100}%`;
 $("jumpMessage").textContent=count?`今日もよく頑張ったね！ ${count}回チャージ完了`:"今日はまだ記録がありません";
 $("challengeSub").textContent=`本番${count+1}回目の集中Jump！`;
}
function renderBank(){
 $("points").innerHTML=`${state.points||0} <em>pt</em>`;
 const next=REWARDS.find(r=>r.points>state.points)||REWARDS.at(-1);
 const before=Math.max(0,next.points-state.points);
 $("nextRewardText").textContent=before?`${next.name}まであと ${before}P`:`${next.name}に交換できます`;
 $("bankBar").style.width=`${Math.min(100,state.points/next.points*100)}%`;
}
function renderRecords(){
 const rows=[...state.records].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,5);
 $("recentRecords").innerHTML=rows.length?rows.map(r=>`
 <div class="record-row">
 <span>${dateJP(r.date)}</span><div><strong>${r.category}</strong><small>${r.memo||""}</small></div>
 <span class="kind">${minText(r.minutes)} / +${r.points||0}P</span>
 <button data-delete-record="${r.id}">削除</button></div>`).join(""):'<div class="empty">まだ学習記録がありません</div>';
 document.querySelectorAll("[data-delete-record]").forEach(b=>b.onclick=()=>{
  const r=state.records.find(x=>x.id===b.dataset.deleteRecord);
  if(!r||!confirm("この記録を削除しますか？"))return;
  state.points=Math.max(0,state.points-(r.points||0));
  if(r.type==="challenge")state.challengeCounts[r.date]=Math.max(0,(state.challengeCounts[r.date]||0)-1);
  state.records=state.records.filter(x=>x.id!==r.id);save();renderAll();toast("記録を削除しました");
 });
}
function renderTweets(){
 const rows=[...state.tweets].sort((a,b)=>b.createdAt-a.createdAt).slice(0,3);
 $("recentTweets").innerHTML=rows.length?rows.map(t=>`<div class="recent-row"><span>${dateJP(t.date)}</span><span>${t.text}</span><button data-del-tweet="${t.id}">×</button></div>`).join(""):'<div class="empty">まだつぶやきはありません</div>';
 document.querySelectorAll("[data-del-tweet]").forEach(b=>b.onclick=()=>{
  state.tweets=state.tweets.filter(t=>t.id!==b.dataset.delTweet);save();renderTweets();
 });
}

function applyTimeTheme(){
 const h=new Date().getHours();
 document.body.classList.remove("theme-morning","theme-day","theme-evening","theme-night");
 document.body.classList.add(h<10?"theme-morning":h<17?"theme-day":h<20?"theme-evening":"theme-night");
}
function renderExamRoad(){
 const start=new Date("2026-07-22T00:00:00");
 const target=new Date("2027-02-03T00:00:00");
 const now=new Date();now.setHours(0,0,0,0);
 const total=Math.max(1,target-start);
 const elapsed=Math.min(total,Math.max(0,now-start));
 const pct=Math.min(100,elapsed/total*100);
 $("examRoadProgress").style.width=`${pct}%`;
 $("roadKaito").style.left=`calc(${pct}% - 3px)`;
 $("examEncourage").textContent=pct<35?"今日も一歩、前へ。":pct<70?"ここまで来た自分を信じよう。":"ゴールは、もうずっと近いよ。";
}
function renderMissionWorld(){
 const boxes=[...document.querySelectorAll("[data-mission]")];
 const done=boxes.length&&boxes.every(x=>x.checked);
 document.querySelector(".mission-card").classList.toggle("completed",done);
 const h=new Date().getHours();
 $("missionWeather").textContent=h<10?"🌅":h<17?"☀":h<20?"🌇":"⭐";
 const lines=[
  "今日の一歩を、アドと一緒に。",
  "終わったら、星がひとつ灯るよ。",
  "完璧より、まず始めることが強さ。",
  "昨日より少し前へ。それで十分！"
 ];
 $("missionWhisper").textContent=done?"全部できたね！今日は最高のJumpだよ✨":lines[new Date().getDate()%lines.length];
}
function renderSummerWorld(){
 const all=state.records.reduce((a,r)=>a+(Number(r.minutes)||0),0);
 const pct=Math.min(100,all/18000*100);
 const card=document.querySelector(".summer-card");
 card.classList.remove("milestone-1","milestone-2","milestone-3");
 if(pct>=75)card.classList.add("milestone-3");
 else if(pct>=40)card.classList.add("milestone-2");
 else if(pct>=10)card.classList.add("milestone-1");
 $("summerMessage").textContent=pct>=100?"300時間達成！夏の努力が大きな星になったね🎆":
   pct>=75?"ゴールが見えてきた！最後まで一緒に走ろう。":
   pct>=40?"夏の真ん中まで来たよ。積み重ねが力になっている！":
   pct>=10?"少しずつ景色が変わってきたね。":
   "夏の冒険は、ここから始まる！";
}
function renderBankWorld(){
 const p=state.points||0;
 const bank=document.querySelector(".bank-card");
 bank.classList.toggle("bank-happy",p>=300);
 bank.classList.toggle("bank-shine",p>=800);
 $("pigMood").textContent=p>=2500?"夢がいっぱい！":p>=800?"すごい！キラキラだね":p>=300?"うれしいな♪":"一緒に貯めよう♪";
}

function renderAll(){
 applyTimeTheme();
 setGreeting();renderMission();examCountdown();renderSummer();renderJump();renderBank();renderRecords();renderTweets();
 renderExamRoad();renderMissionWorld();renderSummerWorld();renderBankWorld();renderHomeToday();
 if($("todayDateLabel"))$("todayDateLabel").textContent=dateJP(today());
}
registerVisit();
renderAll();
setTimeout(()=>{if(currentVisitInfo.isReturn)animateAd("jump","ぴょーん！",true);else animateAd("guts","今日もいこう！",true)},450);

$("recordBtn").onclick=$("navRecord").onclick=()=>{$("recordDate").value=today();$("recordDialog").showModal()};
$("closeRecord").onclick=$("cancelRecord").onclick=()=>$("recordDialog").close();
$("recordForm").addEventListener("submit",e=>{
 e.preventDefault();
 const date=$("recordDate").value,category=$("recordCategory").value,minutes=Number($("recordMinutes").value),memo=$("recordMemo").value.trim();
 if(!date||!category||!minutes)return;
 const points=minutes;
 state.points+=points;
 state.records.push({id:crypto.randomUUID(),date,category,minutes,memo,type:"manual",points,createdAt:Date.now()});
 save();$("recordForm").reset();$("recordDate").value=today();$("recordDialog").close();renderAll();
 animateAd("celebrate","やったね！",true);
 toast(`${minutes}分を記録。Dream Bankに${points}P！`);
});

const CHALLENGE_SECONDS=45*60;
const CHALLENGE_SESSION_KEY="studystar_challenge45_v1";
let timer=null,remaining=CHALLENGE_SECONDS,paused=false,challengeSession=null,challengeCompleting=false;
let challengeAudioContext=null;

function readChallengeSession(){
 try{
  const x=JSON.parse(localStorage.getItem(CHALLENGE_SESSION_KEY)||"null");
  return x&&typeof x==="object"?x:null;
 }catch{return null}
}
function saveChallengeSession(){
 if(challengeSession)localStorage.setItem(CHALLENGE_SESSION_KEY,JSON.stringify(challengeSession));
 else localStorage.removeItem(CHALLENGE_SESSION_KEY);
}
function clearChallengeTimer(){if(timer){clearInterval(timer);timer=null}}
function ensureChallengeAudio(){
 try{
  challengeAudioContext=challengeAudioContext||new (window.AudioContext||window.webkitAudioContext)();
  if(challengeAudioContext.state==="suspended")challengeAudioContext.resume();
 }catch{}
}
function challengeBeep(times=1){
 try{
  ensureChallengeAudio();
  if(!challengeAudioContext)return;
  for(let i=0;i<times;i++){
   const osc=challengeAudioContext.createOscillator(),gain=challengeAudioContext.createGain();
   const t=challengeAudioContext.currentTime+i*0.28;
   osc.frequency.value=880;gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(0.16,t+0.02);gain.gain.exponentialRampToValueAtTime(0.0001,t+0.18);
   osc.connect(gain);gain.connect(challengeAudioContext.destination);osc.start(t);osc.stop(t+0.2);
  }
 }catch{}
}
function showChallengeAlert(message,times=1){
 challengeBeep(times);
 toast(message);
 setTimeout(()=>alert(message),80);
}
function currentRemainingMs(){
 if(!challengeSession)return CHALLENGE_SECONDS*1000;
 if(challengeSession.status==="paused")return Math.max(0,Number(challengeSession.pausedRemainingMs)||0);
 return Math.max(0,(Number(challengeSession.endAt)||0)-Date.now());
}
function updateTimer(){
 const totalSeconds=Math.max(0,Math.ceil(currentRemainingMs()/1000));
 remaining=totalSeconds;
 const m=Math.floor(totalSeconds/60),s=totalSeconds%60;
 $("timerText").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function processChallengeThresholds(){
 if(!challengeSession||challengeSession.status!=="running")return;
 const ms=currentRemainingMs();
 if(ms<=0){completeChallenge();return}
 // スリープ中に両方を通過した場合は、その時点で近い方だけを知らせます。
 if(ms<=5*60*1000&&!challengeSession.alerted5){
  challengeSession.alerted10=true;challengeSession.alerted5=true;saveChallengeSession();
  showChallengeAlert("あと5分。一緒にいこう。",2);
 }else if(ms<=10*60*1000&&!challengeSession.alerted10){
  challengeSession.alerted10=true;saveChallengeSession();
  showChallengeAlert("残り10分だよ。",1);
 }
}
function tick(){updateTimer();processChallengeThresholds()}
function startChallengeClock(){
 clearChallengeTimer();
 timer=setInterval(tick,500);
 tick();
}
function showRunningChallenge(){
 $("challengeReady").hidden=true;$("challengeRunning").hidden=false;
 $("timerCategory").textContent=challengeSession?.category||$("challengeCategory").value;
 paused=challengeSession?.status==="paused";
 $("pauseChallenge").textContent=paused?"再開":"一時停止";
 updateTimer();
}
function normalizeChallengeSession(raw){
 if(!raw||typeof raw!=="object")return null;
 const status=raw.status==="paused"?"paused":"running";
 const session={...raw,status};
 if(status==="paused"){
  session.pausedRemainingMs=Math.max(0,Number(session.pausedRemainingMs)||0);
  session.endAt=null;
 }else{
  session.endAt=Number(session.endAt)||0;
  session.pausedRemainingMs=null;
  if(!session.endAt)return null;
 }
 return session;
}
function syncChallengeFromStorage(){
 const stored=normalizeChallengeSession(readChallengeSession());
 challengeSession=stored;
 if(!challengeSession){
  clearChallengeTimer();
  return false;
 }
 showRunningChallenge();
 if(challengeSession.status==="running"){
  if(currentRemainingMs()<=0)completeChallenge();
  else startChallengeClock();
 }else{
  clearChallengeTimer();
  updateTimer();
 }
 return true;
}
function restoreChallenge(){syncChallengeFromStorage()}

$("challengeBtn").onclick=()=>{
 challengeSession=readChallengeSession();
 if(challengeSession){showRunningChallenge();if(challengeSession.status==="running")startChallengeClock()}
 else{$("challengeReady").hidden=false;$("challengeRunning").hidden=true;remaining=CHALLENGE_SECONDS;updateTimer()}
 $("challengeDialog").showModal();
};
$("closeChallenge").onclick=()=>{if(challengeSession)return alert("進行中はキャンセルボタンを使ってください");$("challengeDialog").close()};
$("startChallenge").onclick=()=>{
 ensureChallengeAudio();
 const now=Date.now(),category=$("challengeCategory").value;
 challengeSession={status:"running",category,dateStarted:today(),startedAt:now,endAt:now+CHALLENGE_SECONDS*1000,pausedRemainingMs:null,alerted10:false,alerted5:false};
 saveChallengeSession();showRunningChallenge();startChallengeClock();
};
$("pauseChallenge").onclick=()=>{
 if(!challengeSession)return;
 if(challengeSession.status==="running"){
  challengeSession.pausedRemainingMs=currentRemainingMs();challengeSession.status="paused";paused=true;clearChallengeTimer();
 }else{
  challengeSession.endAt=Date.now()+Math.max(0,Number(challengeSession.pausedRemainingMs)||0);challengeSession.pausedRemainingMs=null;challengeSession.status="running";paused=false;startChallengeClock();
 }
 saveChallengeSession();$("pauseChallenge").textContent=paused?"再開":"一時停止";updateTimer();
};
$("cancelChallenge").onclick=()=>{
 if(!confirm("Challenge45をキャンセルしますか？ポイントは付きません。"))return;
 clearChallengeTimer();challengeSession=null;saveChallengeSession();remaining=CHALLENGE_SECONDS;paused=false;$("challengeDialog").close();toast("Challenge45をキャンセルしました");
};
const CHALLENGE_COMPLETE_MESSAGES=[
 "おつかれ！集中できたね！",
 "この45分は、未来の自分へのプレゼントだ！",
 "今日の君、なかなかカッコよかったぞ！",
 "また一つ、合格へ近づいたね！",
 "やり切った45分は、ちゃんと力になっているよ！",
 "ナイスJump！次の自分へ一歩前進！"
];
function randomChallengeMessage(){
 return CHALLENGE_COMPLETE_MESSAGES[Math.floor(Math.random()*CHALLENGE_COMPLETE_MESSAGES.length)];
}
function completeChallenge(){
 if(challengeCompleting||!challengeSession)return;
 challengeCompleting=true;clearChallengeTimer();
 const session=challengeSession;
 const date=session.dateStarted||today(),count=state.challengeCounts[date]||0,points=count<2?55:88,category=session.category||$("challengeCategory").value;
 state.challengeCounts[date]=count+1;state.points+=points;
 state.records.push({id:crypto.randomUUID(),date,category,minutes:45,memo:"Challenge45 完了",type:"challenge",points,createdAt:Date.now()});
 challengeSession=null;saveChallengeSession();save();
 if($("challengeDialog").open)$("challengeDialog").close();renderAll();
 animateAd("celebrate","ばんざーい！",true);
 challengeBeep(3);
 const adMessage=randomChallengeMessage();
 alert(`よし、チャージ完了！\n\nアド：${adMessage}\n\nDream Bankに ${points}P 貯まりました。\nカイトもひと休憩しよう😊`);
 challengeCompleting=false;
}

restoreChallenge();
function resumeChallengeSafely(){
 if(document.visibilityState&&document.visibilityState!=="visible")return;
 syncChallengeFromStorage();
}
function handleAppReturn(){
 if(document.visibilityState&&document.visibilityState!=="visible")return;
 const before=currentVisitInfo.count;
 const info=registerVisit();
 resumeChallengeSafely();
 if(info.isReturn&&info.count!==before){setGreeting();animateAd("jump","また会えた！",true)}
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")handleAppReturn()});
window.addEventListener("pageshow",handleAppReturn);
window.addEventListener("focus",handleAppReturn);
document.addEventListener("pointerdown",()=>{touchVisit();resumeChallengeSafely()},{passive:true});
document.addEventListener("touchstart",()=>{touchVisit();resumeChallengeSafely()},{passive:true});

$("tweetBtn").onclick=$("navTweet").onclick=()=>{$("tweetText").value="";$("tweetDialog").showModal()};
$("closeTweet").onclick=$("backTweet").onclick=()=>$("tweetDialog").close();
$("tweetForm").addEventListener("submit",e=>{
 e.preventDefault();const text=$("tweetText").value.trim();if(!text)return;
 state.tweets.push({id:crypto.randomUUID(),date:today(),text,createdAt:Date.now()});save();$("tweetDialog").close();renderTweets();
 toast("つぶやきを残したよ。アド：今日の気持ちも大切な一歩だね！");
});
function openList(title,html){$("listTitle").textContent=title;$("listContent").innerHTML=html;$("listDialog").showModal()}
$("closeList").onclick=()=>$("listDialog").close();
$("allTweetsBtn").onclick=()=>openList("つぶやき帳",state.tweets.length?[...state.tweets].sort((a,b)=>b.createdAt-a.createdAt).map(t=>`<div class="recent-row"><span>${dateJP(t.date)}</span><span>${t.text}</span></div>`).join(""):'<div class="empty">まだつぶやきはありません</div>');
$("historyBtn").onclick=()=>openList("学習記録",state.records.length?[...state.records].sort((a,b)=>b.createdAt-a.createdAt).map(r=>`<div class="record-row"><span>${dateJP(r.date)}</span><div><strong>${r.category}</strong><small>${r.memo||""}</small></div><span>${minText(r.minutes)} / +${r.points||0}P</span></div>`).join(""):'<div class="empty">まだ学習記録はありません</div>');
$("bankBtn").onclick=$("navBank").onclick=()=>openList("ごほうびリスト",REWARDS.map(r=>`<div class="record-row"><span>${r.points}P</span><strong>${r.name}</strong><span>${state.points>=r.points?"交換できます":"あと "+(r.points-state.points)+"P"}</span></div>`).join(""));
$("jumpBtn").onclick=$("navJump").onclick=()=>openList("Jump Sky",`<p>Challenge45を1回完了するごとに、今日の空に星が1つ灯ります。</p><div class="stars">${$("todayStars").textContent}</div><p>${$("jumpMessage").textContent}</p>`);
$("missionEditBtn").onclick=()=>{
 const current=state.missionTemplate.map(m=>`${m.icon} ${m.text}${m.sub?" "+m.sub:""}`).join("\n");
 const value=prompt("ミッションを1行ずつ入力してください。先頭の絵文字も入力できます。",current);
 if(value===null)return;
 state.missionTemplate=value.split("\n").filter(Boolean).map(line=>({icon:"★",text:line,sub:""}));save();renderMission();
};
$("menuBtn").onclick=()=>{
 openList("Study☆Star メニュー",`<p>アドと一緒に、今日の一歩を残そう。</p><button class="primary wide" id="parentOpen">保護者モード</button><p class="rule-note">ポイントルール<br>Challenge45：1・2回目 55P／3回目以降 88P<br>その他の学習：1分＝1P</p>`);
 setTimeout(()=>{const b=$("parentOpen");if(b)b.onclick=()=>{
   const pass=prompt("保護者用パスワードを入力してください");
   if(pass!=="460631")return alert("パスワードが違います");
   $("listDialog").close();$("parentMessage").value=state.message||"";$("parentDialog").showModal();
 }},0);
};
$("noticeBtn").onclick=()=>toast("今日もStudy☆Starへようこそ！");
$("scheduleBtn").onclick=()=>toast("予定管理は次回アップデートで編集対応予定です");

$("closeParent").onclick=$("cancelParent").onclick=()=>$("parentDialog").close();
$("parentForm").addEventListener("submit",e=>{
 e.preventDefault();
 state.message=$("parentMessage").value.trim();
 save();setGreeting();$("parentDialog").close();toast("アドのひとことを保存しました");
});

/* ダイアログの外側を押したときに閉じる */
["recordDialog","tweetDialog","listDialog","parentDialog"].forEach(id=>{
 const d=$(id);
 d.addEventListener("click",e=>{
  const r=d.getBoundingClientRect();
  const outside=e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;
  if(outside)d.close();
 });
});
