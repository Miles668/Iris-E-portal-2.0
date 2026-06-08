import { supabase } from '../js/supabase-client.js';

const form = document.getElementById('resultForm');
const subjectSelect = document.getElementById('subjectId');

async function loadSubjects(){
  const { data, error } = await supabase.from('subjects').select('*');
  if(error) console.error(error);
  data?.forEach(s => subjectSelect.append(new Option(s.subject_name, s.id)));
}
loadSubjects();

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const studentIdentifier = document.getElementById('studentId').value.trim();
  const term = document.getElementById('term').value;
  const score = parseFloat(document.getElementById('score').value);
  const grade = document.getElementById('grade').value;
  const comments = document.getElementById('comments').value;
  const subjectId = document.getElementById('subjectId').value;
  const fileInput = document.getElementById('file');

  // Resolve student
  let studentRes;
  if(studentIdentifier.includes('@')){
    studentRes = await supabase.from('users').select('id').eq('email', studentIdentifier).maybeSingle();
  } else {
    studentRes = await supabase.from('users').select('id').eq('id', studentIdentifier).maybeSingle();
  }
  if(!studentRes.data){ alert('Student not found'); return; }
  const studentId = studentRes.data.id;
  const teacher = (await supabase.auth.getUser()).data.user;
  if(!teacher){ alert('Not authenticated'); return; }

  let attached_file_url = null;
  if(fileInput.files.length){
    const file = fileInput.files[0];
    const key = `report_cards/${studentId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('documents').upload(key, file, { upsert: true });
    if(uploadError){ console.error(uploadError); alert('Upload failed'); return; }
    const { data: signed, error: urlErr } = await supabase.storage.from('documents').createSignedUrl(uploadData.path, 60*60*24);
    attached_file_url = signed?.signedURL || null;
  }

  const { data, error } = await supabase.from('report_cards').insert([{
    student_id: studentId,
    teacher_id: teacher.id,
    subject_id: subjectId,
    term,
    score,
    grade,
    comments,
    attached_file_url
  }]);
  if(error){ console.error(error); alert('Insert failed'); } else { alert('Result uploaded'); form.reset(); }
});
