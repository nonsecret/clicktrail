document.querySelector('#capture').onclick=async()=>{
 const button=document.querySelector('#capture'); button.disabled=true;
 try {const r=await chrome.runtime.sendMessage({type:'capture'}); document.querySelector('#status').textContent=r.ok?`${r.count} screens saved. Capture before each action.`:r.error;}
 catch(e){document.querySelector('#status').textContent=e.message;}
 finally {button.disabled=false;}
};
document.querySelector('#edit').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('editor.html')});
