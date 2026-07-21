(()=>{
'use strict';
const $=id=>document.getElementById(id), KEY='studyStarV20', EXAM='2027-02-03', SUMMER_START='2026-07-18', SUMMER_END='2026-08-31';
const cats=['理系宿題','文系宿題','塾での学習','過去問','模試解き直し','苦手克服','自由学習'];
const defaultState={points:0,records:[],challengeCounts:{},missions:{},openCount:0};
let s={...defaultState,...JSON.parse(localStorage.getItem(KEY)||'{}')};
s.records=Array.isArray(s.records)?s.records:[];s.challengeCounts=s.challengeCounts||{};s.missions=s.missions||{};
if(!s.manualPointMigrationV24){
  s.records.forEach(r=>{if(r.type==='manual')r.points=Number(r.minutes)||0});
  s.points=s.records.reduce((sum,r)=>sum+(Number(r.points)||0),0);
  s.manualPointMigrationV24=true;
}
s.openCount=(s.openCount||0)+1;save();
const localDate=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=localDate();
function save(){localStorage.setItem(KEY,JSON.stringify(s))}
function minutesText(m){return m%60?`${Math.floor(m/60)}時間${m%60}分`:`${m/60}時間`}
function dateJP(x){const d=new Date(x+'T00:00:00');return `${d.getMonth()+1}月${d.getDate()}日`}
function challengePointFor(date){return (s.challengeCounts[date]||0)<2?55:88}
function render(){
 const a=new Date(today+'T00:00:00'),b=new Date(EXAM+'T00:00:00');$('days').textContent='あと'+Math.max(0,Math.ceil((b-a)/86400000))+'日';
 $('points').textContent=s.points+' pt';
 const c=s.challengeCounts[today]||0;$('stars').textContent='★'.repeat(Math.min(5,c))+'☆'.repeat(Math.max(0,5-Math.min(5,c)));
 const todayMin=s.records.filter(r=>r.date===today).reduce((n,r)=>n+r.minutes,0);$('todaySummary').textContent=todayMin?`今日の学習 ${minutesText(todayMin)} / Challenge45 ${c}回`:'今日はまだ記録がありません';
 const summer=s.records.filter(r=>r.date>=SUMMER_START&&r.date<=SUMMER_END).reduce((n,r)=>n+r.minutes,0),goal=18000,remain=Math.max(0,goal-summer),rate=Math.min(100,summer/goal*100);
 $('summerTotal').textContent=minutesText(summer);$('summerRemain').textContent=minutesText(remain);$('summerRate').textContent=rate.toFixed(1)+'%';$('summerBar').style.width=rate+'%';
 const h=new Date().getHours();let g,m;if(s.openCount>1){g='また会えたね、海翔！';m='戻ってきたことも、ちゃんと前進だよ。'}else if(h<9){g='おはよう、海翔！';m='今日も最高の <strong>Jump</strong> にしよう！'}else if(h<12){g='やぁ、海翔！';m='今日はどんな自分に会えるかな。'}else if(h<18){g='こんにちは、海翔！';m='まず一つ、始めよう。'}else{g='おかえり、海翔！';m='今日も会えたね。'}$('greeting').textContent=g;$('adMessage').innerHTML=m;
 ['m1','m2','m3'].forEach((id,i)=>{$(id).checked=!!s.missions[today]?.[i]});
}
function message(title,text){$('messageTitle').textContent=title;$('messageText').textContent=text;$('messageDialog').showModal()}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
['m1','m2','m3'].forEach((id,i)=>$(id).onchange=e=>{s.missions[today]=s.missions[today]||{};s.missions[today][i]=e.target.checked;save()});
for(const c of cats){const b=document.createElement('button');b.type='button';b.textContent=c;b.onclick=()=>{chosen=c;$('readyCategory').textContent=c;$('categoryDialog').close();setTimeout(()=>$('readyDialog').showModal(),30)};$('categoryList').appendChild(b);const o=document.createElement('option');o.value=o.textContent=c;$('recordCategory').appendChild(o)}
let chosen='自由学習',remaining=2700,timer=null,paused=false,running=false;
$('challengeBtn').onclick=()=>$('categoryDialog').showModal();$('chooseAgain').onclick=()=>{$('readyDialog').close();setTimeout(()=>$('categoryDialog').showModal(),30)};
function draw(){$('timer').textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0')}
$('startChallenge').onclick=()=>{if(running)return;remaining=2700;paused=false;running=true;$('timerCategory').textContent=chosen;$('pauseTimer').textContent='一時停止';draw();$('readyDialog').close();setTimeout(()=>$('timerDialog').showModal(),30);clearInterval(timer);timer=setInterval(()=>{if(!paused&&remaining>0){remaining--;draw()}if(remaining===0)finish()},1000)};
function finish(){if(!running)return;clearInterval(timer);running=false;const point=challengePointFor(today);s.challengeCounts[today]=(s.challengeCounts[today]||0)+1;s.points+=point;s.records.push({id:crypto.randomUUID(),date:today,category:chosen,minutes:45,memo:'Challenge45 完了',type:'challenge',points:point,createdAt:Date.now()});s.missions[today]=s.missions[today]||{};s.missions[today][0]=true;save();render();$('timerDialog').close();message('よし、チャージ完了！',`45分やり切ったね。スターエナジーを${point}P獲得！ カイトもひと休憩しよう😊`)}
$('pauseTimer').onclick=()=>{if(!running)return;paused=!paused;$('pauseTimer').textContent=paused?'再開':'一時停止'};$('cancelTimer').onclick=()=>{clearInterval(timer);running=false;paused=false;$('timerDialog').close();message('Challenge45を中止しました','途中では学習時間もポイントも加算されません。')};
$('recordBtn').onclick=()=>{$('recordDate').value=today;$('recordDate').max=today;$('recordDialog').showModal()};
$('recordForm').onsubmit=e=>{e.preventDefault();const date=$('recordDate').value,minutes=Number($('recordMinutes').value),category=$('recordCategory').value,memo=$('recordMemo').value.trim();if(!date||!minutes)return;const point=minutes;s.points+=point;s.records.push({id:crypto.randomUUID(),date,category,minutes,memo,type:'manual',points:point,createdAt:Date.now()});save();render();$('recordForm').reset();$('recordDialog').close();message('記録できたよ！',`${dateJP(date)}の${category}を${minutesText(minutes)}、学習時間に加えました。Dream Bankに${point}P貯まったよ！`)};
function renderHistory(){const list=$('historyList');list.innerHTML='';const records=[...s.records].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt);if(!records.length){list.innerHTML='<div class="empty">まだ記録がありません。</div>';return}for(const r of records){const d=document.createElement('article');d.className='history-item';d.innerHTML=`<header><strong>${dateJP(r.date)}　${r.category}</strong><button class="delete" data-id="${r.id}">削除</button></header><p>${minutesText(r.minutes)}　+${r.points||0}P</p>${r.memo?`<small>${r.memo}</small>`:''}`;list.appendChild(d)}list.querySelectorAll('.delete').forEach(b=>b.onclick=()=>{if(!confirm('この記録を削除しますか？'))return;const r=s.records.find(x=>x.id===b.dataset.id);if(r){s.points=Math.max(0,s.points-(r.points||0));if(r.type==='challenge')s.challengeCounts[r.date]=Math.max(0,(s.challengeCounts[r.date]||0)-1)}s.records=s.records.filter(x=>x.id!==b.dataset.id);save();render();renderHistory()})}
function openHistory(){renderHistory();$('historyDialog').showModal()}$('historyBtn').onclick=openHistory;$('navHistory').onclick=openHistory;
$('bankBtn').onclick=()=>message('Dream Bank',`現在 ${s.points}P です。\nChallenge45は1・2回目55P、3回目以降88P。\nChallenge45以外の学習は1分につき1Pです。`);
$('parentBtn').onclick=()=>$('parentDialog').showModal();$('parentForm').onsubmit=e=>{e.preventDefault();if($('password').value==='460631'){$('parentDialog').close();message('保護者モード','認証できました。設定機能は次の更新で追加します。')}else $('passwordError').hidden=false};
render();
})();
