import { supabase } from './supabase-client.js';

const urlParams = new URLSearchParams(location.search);
const resourceId = urlParams.get('resource_id');
const pdfUrl = urlParams.get('file_url');
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');
const progressFill = document.getElementById('pdfProgressFill');
const progressPercent = document.getElementById('pdfProgressPercent');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let lastSavedPercent = 0;

async function saveProgress(pct, last_position){
  try{
    const user = (await supabase.auth.getUser()).data.user;
    if(!user) return;
    await supabase.from('resource_progress').upsert({
      user_id: user.id,
      resource_id: resourceId,
      progress_percent: pct,
      last_position,
      updated_at: new Date().toISOString()
    }, { onConflict: ['user_id','resource_id'] });
  }catch(e){console.error('save err',e)}
}

function renderPage(num){
  pdfDoc.getPage(num).then(page=>{
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = { canvasContext: ctx, viewport };
    page.render(renderContext).promise.then(()=>{
      const pct = Math.round((currentPage / totalPages) * 10000) / 100;
      progressFill.style.width = pct + '%';
      progressPercent.textContent = pct + '%';
      pageInfo.textContent = `${currentPage} / ${totalPages}`;
      if(pct - lastSavedPercent >= 1){ saveProgress(pct, currentPage); lastSavedPercent = pct; }
    });
  });
}

async function loadSaved(){
  if(!resourceId) return;
  const user = (await supabase.auth.getUser()).data.user;
  if(!user) return;
  const { data } = await supabase.from('resource_progress').select('*').eq('user_id', user.id).eq('resource_id', resourceId).maybeSingle();
  if(data){ currentPage = Math.min(totalPages||1, Number(data.last_position||1)); }
}

async function loadPDF(){
  if(!pdfUrl) return;
  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  pdfDoc = await loadingTask.promise;
  totalPages = pdfDoc.numPages;
  await loadSaved();
  renderPage(currentPage);
}

prevBtn.addEventListener('click', ()=>{ if(currentPage>1){ currentPage--; renderPage(currentPage); } });
nextBtn.addEventListener('click', ()=>{ if(currentPage<totalPages){ currentPage++; renderPage(currentPage); } });

loadPDF();
