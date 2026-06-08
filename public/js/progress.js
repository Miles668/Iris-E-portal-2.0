import { supabase } from './supabase-client.js';

const video = document.getElementById('videoPlayer');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const markCompleteBtn = document.getElementById('markComplete');

// resource_id and file_url should be provided in query params
const params = new URLSearchParams(location.search);
const resourceId = params.get('resource_id');
const fileUrl = params.get('file_url');

let lastSavedPercent = 0;
let saveTimer = 0;
const saveIntervalSec = 10;

if (fileUrl) video.src = fileUrl;

async function upsertProgress(percent, last_position){
  try{
    const user = (await supabase.auth.getUser()).data.user;
    if(!user) return;
    await supabase.from('resource_progress').upsert({
      user_id: user.id,
      resource_id: resourceId,
      progress_percent: percent,
      last_position,
      updated_at: new Date().toISOString()
    }, { onConflict: ['user_id','resource_id'] });
  }catch(e){console.error('save err',e)}
}

function renderProgress(pct){
  progressFill.style.width = pct + '%';
  progressPercent.textContent = Math.round(pct) + '%';
}

async function loadProgress(){
  if(!resourceId) return;
  const user = (await supabase.auth.getUser()).data.user;
  if(!user) return;
  const { data } = await supabase.from('resource_progress').select('*').eq('user_id', user.id).eq('resource_id', resourceId).maybeSingle();
  if(data){
    lastSavedPercent = Number(data.progress_percent || 0);
    renderProgress(lastSavedPercent);
    if(data.last_position){
      video.addEventListener('loadedmetadata', ()=>{ if(video.duration) video.currentTime = Number(data.last_position); });
    }
  }
}

video.addEventListener('timeupdate', async ()=>{
  if(!video.duration) return;
  const played = video.currentTime;
  const pct = Math.min(100, (played / video.duration) * 100);
  renderProgress(pct);
  saveTimer++;
  if(pct - lastSavedPercent >= 1 || saveTimer >= saveIntervalSec){
    lastSavedPercent = Math.round(pct * 100) / 100;
    await upsertProgress(lastSavedPercent, Math.round(played));
    saveTimer = 0;
  }
});

markCompleteBtn.addEventListener('click', async ()=>{
  await upsertProgress(100, Math.round(video.duration || video.currentTime || 0));
  renderProgress(100);
});

window.addEventListener('beforeunload', async ()=>{
  if(video.duration){
    const pct = Math.min(100, (video.currentTime / video.duration) * 100);
    await upsertProgress(Math.round(pct * 100) / 100, Math.round(video.currentTime));
  }
});

loadProgress();
