
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

function setGreeting(){
 const h=new Date().getHours();
 const title=h<10?"おはよう、海翔！":h<17?"やぁ、海翔！":h<20?"おかえり、海翔！":"こんばんは、海翔！";
 const daily=[
  "今日も最高の\nJumpにしよう！",
  "昨日の自分を\nひとつ超えよう！",
  "小さな一歩が\n大きな飛躍になるよ！",
  "焦らなくて大丈夫。\n今日の星を灯そう！",
  "ここまで来た自分を信じて、\nよし、始めよう！"
 ];
 $("greetingTitle").textContent=title;
 const dayIndex=Math.floor(new Date().setHours(0,0,0,0)/86400000)%daily.length;
 const body=state.message||daily[dayIndex];
 $("greetingBody").innerHTML=body.replace("Jump","<strong>Jump</strong>").replace(/\n/g,"<br>");
 $("reactionMark").textContent=["✨","⭐","💪","🌟","🚀"][dayIndex];
}
function renderMission(){
 const key=today(), checks=state.missions[key]||{};
 $("missionList").innerHTML=state.missionTemplate.map((m,i)=>`
 <label class="mission-item"><span>${m.icon} ${m.text}${m.sub?`<br><small>${m.sub}</small>`:""}</span>
 <input type="checkbox" data-mission="${i}" ${checks[i]?"checked":""}></label>`).join("");
 document.querySelectorAll("[data-mission]").forEach(el=>el.onchange=()=>{
  state.missions[key]=state.missions[key]||{};
  state.missions[key][el.dataset.mission]=el.checked;save();renderJump();
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
function renderAll(){
 setGreeting();renderMission();examCountdown();renderSummer();renderJump();renderBank();renderRecords();renderTweets();
 if($("todayDateLabel"))$("todayDateLabel").textContent=dateJP(today());
}
renderAll();

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
 toast(`${minutes}分を記録。Dream Bankに${points}P！`);
});

let timer=null,remaining=2700,paused=false;
$("challengeBtn").onclick=()=>{$("challengeReady").hidden=false;$("challengeRunning").hidden=true;$("challengeDialog").showModal()};
$("closeChallenge").onclick=()=>{if(timer)return alert("進行中はキャンセルボタンを使ってください");$("challengeDialog").close()};
$("startChallenge").onclick=()=>{
 remaining=2700;paused=false;$("challengeReady").hidden=true;$("challengeRunning").hidden=false;
 $("timerCategory").textContent=$("challengeCategory").value;updateTimer();timer=setInterval(tick,1000);
};
function updateTimer(){const m=Math.floor(remaining/60),s=remaining%60;$("timerText").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function tick(){if(paused)return;remaining--;updateTimer();if(remaining<=0)completeChallenge()}
$("pauseChallenge").onclick=()=>{paused=!paused;$("pauseChallenge").textContent=paused?"再開":"一時停止"};
$("cancelChallenge").onclick=()=>{
 if(!confirm("Challenge45をキャンセルしますか？ポイントは付きません。"))return;
 clearInterval(timer);timer=null;remaining=2700;$("challengeDialog").close();toast("Challenge45をキャンセルしました");
};
function completeChallenge(){
 clearInterval(timer);timer=null;
 const date=today(),count=state.challengeCounts[date]||0,points=count<2?55:88,category=$("challengeCategory").value;
 state.challengeCounts[date]=count+1;state.points+=points;
 state.records.push({id:crypto.randomUUID(),date,category,minutes:45,memo:"Challenge45 完了",type:"challenge",points,createdAt:Date.now()});
 save();$("challengeDialog").close();renderAll();
 alert(`よし、チャージ完了！\nカイトもひと休憩しよう😊\n\nDream Bankに ${points}P 貯まりました。`);
}

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
