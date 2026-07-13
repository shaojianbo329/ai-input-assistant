const input = document.querySelector('#inputText');
const suggestions = document.querySelector('#suggestions');
const alertBox = document.querySelector('#privacyAlert');
const charCount = document.querySelector('#charCount');
const prefTag = document.querySelector('#prefTag');
const analysisBar = document.querySelector('#analysisBar');
const intentLabel = document.querySelector('#intentLabel');
const styleLabel = document.querySelector('#styleLabel');
const riskLabel = document.querySelector('#riskLabel');
let mode = 'next';
let recognition;

const samples = {
  next: ['可以，我会在周五前发你初稿。', '可以，我先梳理需求，明天给你一个框架。', '没问题，完成后我会同步关键进展。'],
  polish: ['好的，我会进一步梳理需求，并于周五前提交初稿。', '收到，我会尽快整理相关内容，完成后第一时间同步。', '感谢提醒，我会按计划推进并及时反馈。'],
  shorten: ['好的，周五前给你初稿。', '收到，我来整理。', '没问题，完成后同步。'],
  correct: ['可以，我先梳理一下需求，稍后给你回复。', '好的，我会先确认需求，再开始整理。', '收到，我已理解你的意思。']
};

const demoTexts = {
  long: '我们这次的活动主要是希望通过用户访谈和数据分析，进一步了解新用户在注册、首次使用和持续留存几个环节中遇到的问题，后续会根据结果优化产品流程，并在下周的评审会上同步第一版方案。',
  voice: '我明天把那个方按发给你，里面有几个细节我们在看一下',
  privacy: '我的手机号是13812345678，地址在北京市朝阳区望京路88号。'
};

function render(){
  const text=input.value.trim();
  charCount.textContent=`${input.value.length} / 500`;
  if(!text){suggestions.innerHTML='<div class="empty-state"><span>✦</span><p>输入消息后，选择你想要的表达方式</p></div>';alertBox.classList.add('hidden');analysisBar.classList.add('hidden');return}
  const reasons = mode==='next'?['承接对话上下文','语气自然不生硬','适合直接发送']:mode==='polish'?['表达更正式','保留原始意图','适合工作沟通']:mode==='shorten'?['压缩关键信息','减少阅读负担','适合聊天场景']:['修正同音错字','结合上下文还原语义','建议发送前确认'];
  suggestions.innerHTML=`<div class="result-meta"><span>为你生成 3 条建议</span><span>刚刚</span></div>`+samples[mode].map((s,i)=>`<div class="suggestion" data-value="${s}"><div><small>${i===0?'推荐表达':i===1?'更自然':'备选表达'} · ${reasons[i]}</small><strong>${s}</strong></div><button class="use-btn">使用</button></div>`).join('');
  const hasSensitive=/1[3-9]\d{9}|\d{17}[\dXx]|(北京|上海|广州|深圳).{0,12}(路|区|号)/.test(text);
  alertBox.classList.toggle('hidden',!hasSensitive);
  analysisBar.classList.remove('hidden');
  intentLabel.textContent=mode==='next'?'回复进度确认':mode==='polish'?'工作沟通润色':mode==='shorten'?'长文本压缩': '语音语义纠错';
  styleLabel.textContent=localStorage.getItem('preferredStyle')||'简洁直接';
  riskLabel.textContent=hasSensitive?'发现隐私风险':'未发现风险';
  riskLabel.style.color=hasSensitive?'#d28b2f':'#45a26c';
}
document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector('.mode.active').classList.remove('active');btn.classList.add('active');mode=btn.dataset.mode;render()}));
document.querySelector('#generateBtn').addEventListener('click',render);
input.addEventListener('input',()=>{charCount.textContent=`${input.value.length} / 500`;});
document.querySelector('#clearBtn').addEventListener('click',()=>{input.value='';render()});
suggestions.addEventListener('click',e=>{const card=e.target.closest('.suggestion');if(card){input.value=card.dataset.value;localStorage.setItem('preferredStyle',mode==='polish'?'礼貌正式':mode==='shorten'?'简洁直接':'自然清晰');prefTag.textContent=localStorage.getItem('preferredStyle');if(e.target.classList.contains('use-btn')){e.target.textContent='已回填';setTimeout(render,500)}else{render()}}});
document.querySelector('#maskBtn').addEventListener('click',()=>{input.value=input.value.replace(/1[3-9]\d{9}/g,'138****8000').replace(/\d{17}[\dXx]/g,'******************');render()});
prefTag.textContent=localStorage.getItem('preferredStyle')||prefTag.textContent;
document.querySelector('#voiceBtn').addEventListener('click',()=>{
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){input.value=demoTexts.voice;mode='correct';document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode==='correct'));render();document.querySelector('#voiceBtn').textContent='✓ 已完成转写';return}
  if(recognition){recognition.stop();return}
  recognition=new SpeechRecognition(); recognition.lang='zh-CN'; recognition.interimResults=true;
  document.querySelector('#voiceBtn').textContent='● 正在聆听…';
  recognition.onresult=e=>{input.value=Array.from(e.results).map(r=>r[0].transcript).join('');charCount.textContent=`${input.value.length} / 500`};
  recognition.onend=()=>{recognition=null;mode='correct';document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode==='correct'));render();document.querySelector('#voiceBtn').textContent='✓ 语音已转写'};
  recognition.onerror=()=>{recognition=null;input.value=demoTexts.voice;mode='correct';render();document.querySelector('#voiceBtn').textContent='✓ 使用演示转写'};
  recognition.start();
});
document.querySelectorAll('[data-demo]').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.demo;input.value=demoTexts[type];mode=type==='long'?'shorten':type==='voice'?'correct':'next';document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));render();document.querySelector('.composer-panel').scrollIntoView({behavior:'smooth',block:'center'})}));
