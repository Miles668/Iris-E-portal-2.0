import { supabase } from '../js/supabase-client.js';
const reportList = document.getElementById('reportList');

async function loadReports(){
  const user = (await supabase.auth.getUser()).data.user;
  if(!user){ reportList.innerText = 'Not logged in.'; return; }
  const { data, error } = await supabase.from('report_cards').select('id, subject_id, term, score, grade, comments, attached_file_url, created_at, teacher_id').eq('student_id', user.id).order('created_at', { ascending: false });
  if(error){ console.error(error); reportList.innerText = 'Error loading reports'; return; }
  if(!data || data.length === 0){ reportList.innerHTML = '<p>No reports yet.</p>'; return; }
  data.forEach(r=>{
    const div = document.createElement('div');
    div.className = 'report-card';
    div.innerHTML = `<h3>${r.term} - Subject: ${r.subject_id}</h3>
      <p>Score: ${r.score} | Grade: ${r.grade}</p>
      <p>${r.comments || ''}</p>
      ${r.attached_file_url ? `<a href="${r.attached_file_url}" target="_blank">Download</a>` : ''}
      <small>${new Date(r.created_at).toLocaleString()}</small>`;
    reportList.appendChild(div);
  });
}
loadReports();
