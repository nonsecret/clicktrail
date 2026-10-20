let busy = false;
async function capture() {
  if (busy) throw new Error('Capture already in progress.');
  busy = true;
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if (!tab || !/^https?:/.test(tab.url || '')) throw new Error('Open a normal http/https page first.');
    const image = await chrome.tabs.captureVisibleTab(tab.windowId,{format:'png'});
    const {steps=[]} = await chrome.storage.local.get('steps');
    if (steps.length >= 30) throw new Error('30-step limit reached. Export or clear this walkthrough.');
    steps.push({id:crypto.randomUUID(),image,title:'Step '+(steps.length+1),note:'',x:0.5,y:0.5});
    await chrome.storage.local.set({steps});
    return {ok:true,count:steps.length};
  } finally { busy=false; }
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(message.type==='capture') {capture().then(reply).catch(e=>reply({ok:false,error:e.message})); return true;}
});
chrome.commands.onCommand.addListener(command=>{
  if(command==='capture-step') capture().then(()=>chrome.action.setBadgeText({text:'✓'})).catch(()=>chrome.action.setBadgeText({text:'!'}));
});
