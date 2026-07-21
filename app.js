(()=>{
const $=id=>document.getElementById(id),EXAM=new Date('2027-02-03T00:00:00'),KEY='studyStarV02';
const categories=['理系宿題','文系宿題','塾での学習','過去問','模試解き直し','苦手克服','自由学習'];
let s=JSON.parse(localStorage.getItem(KEY)||'{}'),n=new Date(),k=n.toISOString().slice(0,10);
if(s.last!==k){s.todayChallenges=0;s.todayMinutes=0;s.count=0}s.count=(s.count||0)+1;s.last=k;s.points=Number(s.points||0);s.todayChallenges=Number(s.todayChallenges||0);s.todayMinutes=Number(s.todayMinutes||0);save();
function save(){localStorage.setItem(KEY,JSON.stringify(s))}
const t=new Date(n.getFullYear(),n.getMonth(),n.getDate()),e=new Date(EXAM.getFullYear(),EXAM.getMonth(),EXAM.getDate());
$('days').textContent='あと'+Math.max(0,Math.ceil((e-t)/86400000))+'日';
let g,m;if(s.count>1){g='また会えたね、海翔！';m='戻ってきたことも、ちゃんと前進だよ。'}else if(n.getHours()<9){g='おはよう、海翔！';m='今日も最高のJumpにしよう！'}else if(n.getHours()<12){g='やぁ、海翔！';m='今日はどんな自分に会えるかな。'}else if(n.getHours()<18){g='こんにちは、海翔！';m='まず一つ、始めよう。'}else{g='おかえり、海翔！';m='今日も会えたね。'}$('greeting').textContent=g;$('adMessage').textContent=m;
function renderProgress(){
 $('points').textContent=s.points+' pt';
 const filled=Math.min(5,s.todayChallenges);$('stars').textContent='★ '.repeat(filled)+'☆ '.repeat(5-filled);$('jumpBar').style.width=(filled/5*100)+'%';$('pointBar').style.width=Math.min(100,s.points/800*100)+'%';
}
renderProgress();
const d=$('dialog');function show(a,b){$('dialogTitle').textContent=a;$('dialogText').textContent=b;d.showModal()}$('closeDialog').onclick=()=>d.close();
const categoryDialog=$('categoryDialog'),list=$('categoryList');categories.forEach(cat=>{const b=document.createElement('button');b.type='button';b.textContent=cat;b.onclick=()=>{categoryDialog.close();startTimer(cat)};list.appendChild(b)});$('challengeBtn').onclick=()=>categoryDialog.showModal();
let remain=2700,interval=null,paused=false;function draw(){const mm=String(Math.floor(remain/60)).padStart(2,'0'),ss=String(remain%60).padStart(2,'0');$('timerDisplay').textContent=mm+':'+ss}
function startTimer(cat){remain=2700;paused=false;$('timerCategory').textContent=cat;$('pauseTimer').textContent='一時停止';draw();$('timerDialog').showModal();clearInterval(interval);interval=setInterval(()=>{if(!paused&&remain>0){remain--;draw()}if(remain<=0)complete()},1000)}
function complete(){clearInterval(interval);s.todayChallenges++;s.todayMinutes+=45;s.points+=50;save();renderProgress();$('timerDialog').close();show('よし、チャージ完了！','スターエナジーを50pt獲得。カイトもひと休憩しよう😊')}
$('pauseTimer').onclick=()=>{paused=!paused;$('pauseTimer').textContent=paused?'再開':'一時停止'};$('completeTimer').onclick=complete;$('cancelTimer').onclick=()=>{clearInterval(interval);$('timerDialog').close()};
$('recordBtn').onclick=()=>show('学習時間を残す','この入力画面は次の更新で追加します。');document.querySelectorAll('[data-title]').forEach(b=>b.onclick=()=>show(b.dataset.title,'この機能は順次追加します。'));
let timer;const logo=$('logo'),p=$('parent');logo.onpointerdown=()=>timer=setTimeout(()=>p.showModal(),1200);['onpointerup','onpointerleave','onpointercancel'].forEach(x=>logo[x]=()=>clearTimeout(timer));$('login').onclick=x=>{x.preventDefault();if($('password').value==='460631'){p.close();show('保護者モード','認証できました。編集機能は次の更新で追加します。')}else $('error').hidden=false};
})();