let steps=[],current=0,saveChain=Promise.resolve();
const $=id=>document.getElementById(id);
const nativeStorage=typeof chrome!=='undefined'&&chrome.storage?.local;
async function read(){if(nativeStorage)return (await chrome.storage.local.get('steps')).steps||[];return JSON.parse(localStorage.getItem('clicktrail')||'[]');}
function save(){const snapshot=JSON.parse(JSON.stringify(steps));saveChain=saveChain.catch(()=>{}).then(async()=>{try{if(nativeStorage)await chrome.storage.local.set({steps:snapshot});else localStorage.setItem('clicktrail',JSON.stringify(snapshot));$('status').textContent='Saved locally · '+snapshot.length+' screens';}catch(e){$('status').textContent='Save failed: '+e.message;}});return saveChain;}
function draw(){
 $('empty').hidden=!!steps.length;$('editor').hidden=!steps.length;$('export').disabled=!steps.length;
 $('list').replaceChildren();steps.forEach((s,i)=>{const b=document.createElement('button');b.textContent=`${i+1}. ${s.title}`;b.className=i===current?'active':'';b.onclick=()=>{current=i;draw()};$('list').append(b)});
 if(!steps.length)return;const s=steps[current];$('title').value=s.title;$('note').value=s.note;$('screen').src=s.image;$('spot').style.left=s.x*100+'%';$('spot').style.top=s.y*100+'%';$('up').disabled=current===0;$('down').disabled=current===steps.length-1;
}
for(const field of ['title','note'])$(field).oninput=()=>{steps[current][field]=$(field).value;save();const b=$('list').children[current];b.textContent=`${current+1}. ${steps[current].title}`;};
$('screen').onclick=e=>{const r=e.target.getBoundingClientRect();Object.assign(steps[current],{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height});save();draw();};
function move(d){const j=current+d;if(j<0||j>=steps.length)return;[steps[current],steps[j]]=[steps[j],steps[current]];current=j;save();draw();}
$('up').onclick=()=>move(-1);$('down').onclick=()=>move(1);
$('remove').onclick=()=>{steps.splice(current,1);current=Math.max(0,current-1);save();draw()};
$('clear').onclick=()=>{if(confirm('Delete all captured screens from this browser?')){steps=[];current=0;save();draw()}};
$('export').onclick=()=>{try{const blob=new Blob([Clicktrail.exportHTML(steps)],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='clicktrail-walkthrough.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}catch(e){$('status').textContent=e.message}};
function sampleScreen(index){const c=document.createElement('canvas');c.width=1100;c.height=620;const g=c.getContext('2d');g.fillStyle='#edf0f5';g.fillRect(0,0,1100,620);g.fillStyle='#182434';g.fillRect(0,0,220,620);g.fillStyle='#b8f36d';g.font='bold 25px system-ui';g.fillText('ACME / workspace',25,55);g.fillStyle='#c9d2df';g.font='18px system-ui';['Overview','Projects','Settings'].forEach((s,i)=>g.fillText(s,30,140+i*65));g.fillStyle='#182434';g.font='bold 36px system-ui';g.fillText(['Your projects','Create a project','Project ready'][index],270,85);g.fillStyle='white';g.fillRect(265,125,770,400);g.fillStyle='#536176';g.font='22px system-ui';g.fillText(['One place for your next big idea.','Name: My first project','My first project'][index],305,195);g.fillStyle='#85cc41';g.fillRect(305,250,270,60);g.fillStyle='#14210a';g.font='bold 21px system-ui';g.fillText(['+ New project','Create project','Open project'][index],330,288);return c.toDataURL('image/png');}
$('demo').onclick=async()=>{if(steps.length&&!confirm('Replace current steps with the sample?'))return;steps=[0,1,2].map(i=>({id:'demo-'+i,image:sampleScreen(i),title:['Start a project','Give it a name','You are ready'][i],note:['Click New project.','Click Create project.','Click the highlighted target to finish.'][i],x:440/1100,y:280/620}));current=0;await save();draw()};
read().then(s=>{steps=s;draw()}).catch(e=>$('status').textContent=e.message);
