let locale='en';
try{const requested=new URLSearchParams(location.search).get('lang'),saved=localStorage.getItem('next-moment-language');locale=(requested||saved)==='zh'?'zh':'en';}catch{}
const staticCopy=[];
function tr(zh){return locale==='zh'?zh:(window.UI_EN[zh]??zh)}
function bi(en,zh){return locale==='en'?en:zh}
function lessonCopy(stage){return locale==='en'?{...stage,...window.CONTENT_EN.lessons[stage.id]}:stage}
function roundCopy(){return mode==='lesson'?lessonCopy(current):locale==='en'?{...current,...window.CONTENT_EN.real[current.id]}:current}
function dayLabel(day){return bi(`Day ${day}`,`第${day}天`)}
function captureStaticCopy(){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const node=walker.currentNode;if(node.parentElement.closest('script,style'))continue;
  const zh=node.nodeValue.trim();if(Object.hasOwn(window.UI_EN,zh))staticCopy.push({node,zh,prefix:node.nodeValue.match(/^\s*/)[0],suffix:node.nodeValue.match(/\s*$/)[0]});
 }
 document.querySelectorAll('[aria-label],[title],meta[name=description]').forEach(node=>{
  for(const attr of ['aria-label','title','content']){const zh=node.getAttribute(attr);if(zh&&Object.hasOwn(window.UI_EN,zh))staticCopy.push({node,attr,zh});}
 });
}
function applyStaticCopy(){
 document.documentElement.lang=locale==='en'?'en':'zh-CN';
 document.title=bi('Next Moment · Interval','下一刻 · 间距');
 for(const item of staticCopy){if(!item.node.isConnected)continue;if(item.attr)item.node.setAttribute(item.attr,tr(item.zh));else item.node.nodeValue=item.prefix+tr(item.zh)+item.suffix;}
 document.querySelector('meta[name="description"]').content=document.querySelector('.hero-content p').textContent;
 document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===locale)));
 const back=document.querySelector('.back-to-vibe');if(back){back.hidden=false;back.textContent=bi('← Project','← 项目介绍');}
}
function updateModelNames(){names.you=tr('你的直觉');names.persistence=tr('保持最后值');names.movingAverage=tr('6 小时均值');names.seasonal=tr('昨日同小时');}
function renderDatasetInfo(){
 $('dataset-detail').textContent=bi(`${L.stages.length} guided simulations and ${D.windows.length} real excerpts. Each round shows 48 hours and asks you to predict the next 24. Original records cover 2006–2010.`,`另有 ${L.stages.length} 关情境教学；真实挑战内置 ${D.windows.length} 个精选片段，每段 48 小时历史 + 24 小时未来。原始记录覆盖 2006–2010 年。`);
}
function refreshLanguage(){
 applyStaticCopy();updateModelNames();renderDatasetInfo();
 if(!current)return;
 endPointer();hideHover();$('toast').classList.remove('visible');
 renderRoundCopy();updateStats();renderJourney();renderBriefing();renderLegend(revealed||revealing);renderBase();
 if(revealed){scoreRound(false);$('reset-button').textContent=tr('↻ 重播');$('reveal-text').textContent=nextActionLabel();}
 else if(revealing){$('reveal-text').textContent=tr('未来正在展开');$('status-text').textContent=tr(mode==='lesson'?'你的判断，正在与情境答案相遇…':'你的判断，正在与真实相遇…');}
 else{$('reset-button').textContent=tr('↶ 重画');$('reveal-text').textContent=tr('揭晓未来');updateDrawingUI();}
 updatePower();
}
function nextActionLabel(){return tr(mode==='lesson'?(lessonIndex===L.stages.length-1?'进入真实挑战':'下一关'):'再来一局')}
function initLanguage(){
 captureStaticCopy();applyStaticCopy();updateModelNames();renderDatasetInfo();
 document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>{const next=b.dataset.language;if(next===locale)return;locale=next;try{localStorage.setItem('next-moment-language',locale)}catch{}refreshLanguage();}));
}
