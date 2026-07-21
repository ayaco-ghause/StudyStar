(()=>{
const $=id=>document.getElementById(id), KEY="studyStarHomeV131", EXAM=new Date(2027,1,3), TARGET=18000;
const cats=["理系宿題","文系宿題","塾での学習","過去問","模試解き直し","苦手克服","自由学習"];
const localDate=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
const today=localDate(new Date());
let s={}; try{s=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
s.points=Number(s.points||0); s.records=Array.isArray(s.records)?s.records:[]; s.openDates=s.openDates||{}; s.missions=s.missions||{};
s.openDates[today]=(s.openDates[today]||0)+1;
function save(){localStorage.setItem(KEY,JSON.stringify(s))}
function challengeCount(date=today){return s.records.filter(r=>r.date===date&&r.type==="challenge").length}
function totalMinutes(){return s.records.reduce((n,r)=>n+Number(r.minutes||0),0)}
function fmt(min){min=Math.max(0,Math.round(min));return `${Math.floor(min/60)}時間${String(min%60).padStart(2,"0")}分`}
function render(){
 const now=new Date(), a=new Date(now.getFullYear(),now.getMonth(),now.getDate()); $("days").textContent="あと"+Math.max(0,Math.ceil((EXAM-a)/86400000))+"日";
 $("points").textContent=s.points+" pt"; const c=challengeCount(), f=Math.min(5,c); $("stars").textContent="★ ".repeat(f)+"☆ ".repeat(5-f); $("jumpBar").style.width=f*20+"%"; $("pointBar").style.width=Math.min(100,s.points/800*100)+"%";
 const min=totalMinutes(), rate=Math.min(100,min/TARGET*100); $("summerTotal").textContent=fmt(min); $("summerRemain").textContent="残り"+fmt(TARGET-min); $("summerBar").style.width=rate+"%"; $("summerRate").textContent=`達成率 ${rate.toFixed(1)}%`;
 $("historySummary").textContent=s.records.length?`${s.records.length}件・合計 ${fmt(min)}`:"まだ記録がありません";
 let h=now.getHours(),g,m,opened=s.openDates[today]; if(opened>1){g="また会えたね、海翔！";m="戻ってきたことも、ちゃんと前進だよ。"}else if(h<9){g="おはよう、海翔！";m="今日も最高の<br><strong>Jump</strong>にしよう！"}else if(h<12){g="やぁ、海翔！";m="今日はどんな自分に会えるかな。"}else if(h<18){g="こんにちは、海翔！";m="まず一つ、始めよう。"}else{g="おかえり、海翔！";m="今日も会えたね。"} $("greeting").textContent=g; $("adMessage").innerHTML=m;
}
const md=$("messageDialog"); function show(t,x){$("dialogTitle").textContent=t;$("dialogText").textContent=x;md.showModal()} $("closeDialog").onclick=()=>md.close();
let chosen=""; cats.forEach(c=>{let b=document.createElement("button");b.type="button";b.textContent=c;b.onclick=()=>{chosen=c;$("readyCategory").textContent=c;$("categoryDialog").close();setTimeout(()=>$("readyDialog").showModal(),40)};$("categoryList").appendChild(b);let o=document.createElement("option");o.value=o.textContent=c;$("recordCategory").appendChild(o)});
for(let i=0;i<=12;i++){let o=document.createElement("option");o.value=i;o.textContent=i;$("recordHours").appendChild(o)} $("recordHours").value="1";
$("challengeBtn").onclick=()=>$("categoryDialog").showModal(); $("backToCategory").onclick=()=>{$("readyDialog").close();setTimeout(()=>$("categoryDialog").showModal(),40)}; $("closeReady").onclick=()=>$("readyDialog").close();
let remaining=2700,timer=null,paused=false,running=false; function draw(){$("timer").textContent=String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0")}
function start(){if(running)return;remaining=2700;paused=false;running=true;$("timerCategory").textContent=chosen;$("pauseTimer").textContent="一時停止";draw();$("readyDialog").close();setTimeout(()=>$("timerDialog").showModal(),40);clearInterval(timer);timer=setInterval(()=>{if(!paused&&remaining>0){remaining--;draw()}if(remaining===0)finish()},1000)} $("startChallenge").onclick=start;
function finish(){if(!running||remaining!==0)return;clearInterval(timer);running=false;const nth=challengeCount()+1,earned=nth<=2?55:88;s.points+=earned;s.records.push({id:Date.now(),date:today,category:chosen,minutes:45,type:"challenge",points:earned,memo:`Challenge45 ${nth}回目`});save();render();$("timerDialog").close();show("よし、チャージ完了！",`45分やり切ったね。スターエナジーを${earned}P獲得！カイトもひと休憩しよう😊`)}
$("pauseTimer").onclick=()=>{if(!running)return;paused=!paused;$("pauseTimer").textContent=paused?"再開":"一時停止"}; $("cancelTimer").onclick=()=>{clearInterval(timer);running=false;paused=false;$("timerDialog").close();show("Challenge45を中止しました","途中ではポイントは加算されません。")};
function openRecord(){ $("recordDate").value=today; $("recordDate").max=today; $("recordMemo").value=""; $("recordDialog").showModal()} $("recordBtn").onclick=openRecord; $("navRecord").onclick=openRecord;
$("saveRecord").onclick=e=>{e.preventDefault();const date=$("recordDate").value,h=Number($("recordHours").value),m=Number($("recordMinutes").value),minutes=h*60+m;if(!date){show("日付を選んでください","カレンダーから学習日を選びましょう。");return}if(date>today){show("未来の日付は記録できません","今日以前の日付を選んでください。");return}if(minutes<=0){show("学習時間を選んでください","1分以上の学習時間を入力しましょう。");return}s.records.push({id:Date.now(),date,category:$("recordCategory").value,minutes,type:"manual",points:0,memo:$("recordMemo").value.trim()});s.records.sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);save();render();$("recordDialog").close();show("記録できたよ！",`${date.replaceAll("-","/")}の学習を${fmt(minutes)}、300時間チャレンジに加えました。`)};
function renderHistory(){const list=$("historyList");list.innerHTML="";const rs=[...s.records].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);if(!rs.length){list.innerHTML='<div class="empty">まだ記録がありません。</div>';return}rs.forEach(r=>{const el=document.createElement("article");el.className="history-item";el.innerHTML=`<header><div><strong>${r.date.replaceAll("-","/")}　${r.category}</strong><br><small>${r.type==="challenge"?`Challenge45・+${r.points}P`:"手入力・ポイントなし"}</small></div><button class="delete-record" aria-label="削除">削除</button></header><p>${fmt(r.minutes)}${r.memo?`<br><small>${escapeHtml(r.memo)}</small>`:""}</p>`;el.querySelector("button").onclick=()=>{if(confirm("この学習記録を削除しますか？")){if(r.type==="challenge")s.points=Math.max(0,s.points-Number(r.points||0));s.records=s.records.filter(x=>x.id!==r.id);save();render();renderHistory()}};list.appendChild(el)})}
function escapeHtml(v){return v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
$("historyBtn").onclick=()=>{renderHistory();$("historyDialog").showModal()}; $("closeHistory").onclick=()=>$("historyDialog").close();
document.querySelectorAll("[data-title]").forEach(b=>b.onclick=()=>show(b.dataset.title,"この機能は順次追加します。")); let lp;$("logo").onpointerdown=()=>lp=setTimeout(()=>$("parentDialog").showModal(),1200);["onpointerup","onpointerleave","onpointercancel"].forEach(x=>$("logo")[x]=()=>clearTimeout(lp)); $("login").onclick=e=>{e.preventDefault();if($("password").value==="460631"){$("parentDialog").close();show("保護者モード","認証できました。学習カテゴリ・ごほうび・写真・設定の編集機能は順次追加します。")}else $("error").hidden=false};
save();render();
})();
