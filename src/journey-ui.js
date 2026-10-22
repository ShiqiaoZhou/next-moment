let lessonIndex=0;
try{const saved=Number(localStorage.getItem('next-moment-lesson-position-v2'));if(Number.isInteger(saved)&&saved>=0&&saved<L.stages.length)lessonIndex=saved;}catch{}
function renderJourney(){
 $('journey-path').hidden=mode!=='lesson';
 if(mode!=='lesson')return;
 const list=$('level-list');list.replaceChildren();
 const completed=L.stages.filter(s=>Object.hasOwn(stats.played,s.id)).length;
 $('journey-title').textContent=bi(`Level ${lessonIndex+1} · ${roundCopy().difficulty}`,`第 ${lessonIndex+1} 关 · ${roundCopy().difficulty}`);
 $('journey-progress').textContent=bi(`${completed} / ${L.stages.length} completed`,`已完成 ${completed} / ${L.stages.length}`);
 L.stages.forEach((original,i)=>{
  const stage=lessonCopy(original);
  const b=document.createElement('button');b.className='level-button'+(Object.hasOwn(stats.played,stage.id)?' done':'');
  if(i===lessonIndex)b.setAttribute('aria-current','step');
  b.setAttribute('aria-label',bi(`Level ${i+1}: ${stage.difficulty}, ${stage.title}${Object.hasOwn(stats.played,stage.id)?', completed':''}`,`第${i+1}关 ${stage.difficulty} ${stage.title}${Object.hasOwn(stats.played,stage.id)?tr(' 已完成'):''}`));
  b.title=`${stage.difficulty} · ${stage.title}`;
  const num=document.createElement('span');num.className='level-num';num.textContent=String(i+1).padStart(2,'0')+' / '+stage.difficulty;
  const name=document.createElement('span');name.className='level-name';name.textContent=stage.title.replace(/^\d+\s*·\s*/, '');
  b.append(num,name);b.addEventListener('click',()=>{if(revealing)return;nextRound('lesson',i)});list.append(b);
 });
}
function briefingEvents(){
 if(mode==='lesson')return current.events.map((event,i)=>({...event,...(locale==='en'?window.CONTENT_EN.lessons[current.id].events[i]:{})}));
 // These facts use only the 48 already visible values; do not read future here.
 const latest=current.history.slice(-24),peak=latest.indexOf(Math.max(...latest)),low=latest.indexOf(Math.min(...latest));
 return [{type:'history',time:fmtTime(24+peak,true),title:tr('过去一天的最高点'),detail:bi(`Use reached ${latest[peak].toFixed(2)} kW at this hour. Compare the same time one day earlier: does the peak repeat?`,`已知曲线在这个小时达到 ${latest[peak].toFixed(2)} kW。对照前一天同一时段，看看高点是否重复。`)},{type:'history',time:fmtTime(24+low,true),title:tr('过去一天的最低点'),detail:bi(`Use fell to ${latest[low].toFixed(2)} kW at this hour. This low point is a useful reference, though it may not repeat.`,`已知曲线在这个小时降至 ${latest[low].toFixed(2)} kW。低谷可以作为预测的参照，但不保证会重复。`)}];
}
function renderBriefing(){
 $('briefing-title').textContent=mode==='lesson'?tr('落笔前，先读本局情报'):tr('落笔前，先看历史线索');
 $('briefing-type').textContent=mode==='lesson'?tr('教学情境 · 模拟设定'):tr('UCI 数据 · 仅历史观察');
 $('briefing-note').textContent=mode==='lesson'?tr('以下时间均为待预测的第 3 天；圈号标在图上。你能读情报，三个基线只看历史曲线。'):tr('以上线索来自已经显示的历史。原始数据没有配套天气或活动记录，不额外推测原因。');
 const list=$('event-list');list.replaceChildren();
 briefingEvents().forEach((event,i)=>{
  const card=document.createElement('article');card.className='event-card';
  const index=document.createElement('span');index.className='event-index';index.textContent=String(i+1);
  const body=document.createElement('div'),heading=document.createElement('h3');heading.className='event-heading';
  const time=document.createElement('span');time.className='event-time';time.textContent=mode==='lesson'?`${String(event.hour).padStart(2,'0')}:${String(event.minute).padStart(2,'0')}`:event.time;
  heading.append(time,document.createTextNode(event.title));const text=document.createElement('p');text.className='event-detail';text.textContent=event.detail;
  body.append(heading,text);card.append(index,body);list.append(card);
 });
}
function renderEventMarkers(){
 const g=$('chart-events');g.replaceChildren();if(mode!=='lesson')return;
 current.events.forEach((event,i)=>{
  const x=X(Math.min(71,48+event.hour+event.minute/60));
  g.append(el('line',{x1:x,x2:x,y1:P.t+25+i*22,y2:P.b,stroke:'#d7b989','stroke-dasharray':'2 6','stroke-width':1,opacity:.6}));
  const circle=el('circle',{cx:x,cy:P.t+13+i*22,r:9,fill:'#fff8eb',stroke:'#d6b680','stroke-width':1});
  g.append(circle,el('text',{x,y:P.t+17+i*22,'text-anchor':'middle',class:'event-label'},String(i+1)));
 });
}
