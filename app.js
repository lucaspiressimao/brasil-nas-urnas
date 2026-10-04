const $=id=>document.getElementById(id);
const names={RO:'Rondônia',AC:'Acre',AM:'Amazonas',RR:'Roraima',PA:'Pará',AP:'Amapá',TO:'Tocantins',MA:'Maranhão',PI:'Piauí',CE:'Ceará',RN:'Rio Grande do Norte',PB:'Paraíba',PE:'Pernambuco',AL:'Alagoas',SE:'Sergipe',BA:'Bahia',MG:'Minas Gerais',ES:'Espírito Santo',RJ:'Rio de Janeiro',SP:'São Paulo',PR:'Paraná',SC:'Santa Catarina',RS:'Rio Grande do Sul',MS:'Mato Grosso do Sul',MT:'Mato Grosso',GO:'Goiás',DF:'Distrito Federal'};
let data={},selected='SP',busy=false;
const number=v=>v===null||v===undefined||v===''?null:Number(String(v).replace(',','.'));
const pct=v=>v===null?'—':new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v)+'%';
const integer=v=>new Intl.NumberFormat('pt-BR').format(v);
function parse(raw){
 const cargo=raw.carg?.find(c=>c.cd==='1');if(!cargo||!raw.s)throw Error('Formato de dados inesperado');
 const candidates=(cargo.agr||[]).flatMap(a=>(a.par||[]).flatMap(p=>p.cand||[]));
 const read=n=>{const c=candidates.find(c=>c.n===n);return c?{name:c.nmu,votes:number(c.vap),pct:number(c.pvap),precise:number(c.pvapn??c.pvap)}:null;};
 return {lula:read('13'),bolsonaro:read('22'),count:number(raw.s.pst),total:number(raw.s.ts),counted:number(raw.s.st),time:raw.dt+' '+raw.ht,date:raw.dt,final:raw.and==='f'};
}
function winner(d){if(!d?.lula||!d?.bolsonaro||d.lula.votes===d.bolsonaro.votes)return '';return d.lula.votes>d.bolsonaro.votes?'lula':'bolsonaro';}
function draw(){
 const br=data.BR;
 for(const who of ['lula','bolsonaro']){const c=br?.[who];$(who+'-pct').textContent=pct(c?.pct??null);$(who+'-votes').textContent=c?integer(c.votes)+' votos válidos':'Candidato indisponível no TSE';$(who+'-bar').style.width=(c?.pct??0)+'%';if(c)$(who+'-name').textContent=who==='lula'?'Lula':'Flávio Bolsonaro';}
 $('count-pct').textContent=pct(br?.count??null);$('count-total').textContent=br?integer(br.counted)+' de '+integer(br.total)+' seções':'Aguardando TSE';$('count-bar').style.width=(br?.count??0)+'%';
 $('national-time').textContent=br?'TSE · Brasil: '+br.time+' (Brasília)':'Aguardando dados nacionais';
 document.querySelectorAll('[data-uf]').forEach(path=>{const uf=path.dataset.uf,d=data[uf];path.classList.remove('lula','bolsonaro','selected');const w=winner(d);if(w)path.classList.add(w);path.classList.toggle('selected',uf===selected);path.setAttribute('aria-label',`${names[uf]}. Lula ${pct(d?.lula?.pct??null)}. Flávio Bolsonaro ${pct(d?.bolsonaro?.pct??null)}. Urnas apuradas ${pct(d?.count??null)}.`);path.querySelector('title').textContent=path.getAttribute('aria-label');});
 detail(selected);
}
function detail(uf){selected=uf;const d=data[uf];$('state-title').textContent=names[uf]+' · '+uf;$('state-meta').textContent=d?'TSE: '+d.time+' (Brasília)':'Dados indisponíveis nesta consulta';$('state-detail').replaceChildren();
 for(const [label,key,cls] of [['Lula','lula','red'],['Flávio Bolsonaro','bolsonaro','blue'],['Urnas apuradas','count','']]){const value=key==='count'?d?.count:d?.[key]?.pct;const box=document.createElement('div');box.className='result '+cls;const row=document.createElement('div'),name=document.createElement('span'),strong=document.createElement('strong');name.textContent=label;strong.textContent=pct(value??null);row.append(name,strong);const track=document.createElement('div');track.className='track';const bar=document.createElement('i');bar.style.width=(value??0)+'%';track.append(bar);box.append(row,track);$('state-detail').append(box);}
 document.querySelectorAll('[data-uf]').forEach(p=>p.classList.toggle('selected',p.dataset.uf===uf));
}
async function refresh(){if(busy)return;busy=true;$('refresh').disabled=true;$('status').textContent='Consultando dados oficiais…';try{
 const fresh={},failures=[],ufs=['BR',...Object.keys(names)];
 // Four requests at a time, avoiding a burst of 28 requests to the TSE.
 for(let i=0;i<ufs.length;i+=4){
  await Promise.all(ufs.slice(i,i+4).map(async uf=>{
   try{const code=uf.toLowerCase();const url=`https://resultados.tse.jus.br/oficial/ele2026/6257/dados/${code}/${code}-c0001-e006257-u.json`;
    const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error(`TSE: ${response.status}`);
    const raw=await response.json();if(raw.ele!=='6257'||raw.cdabr?.toLowerCase()!==code)throw Error('Abrangência inesperada');
    fresh[uf]=parse(raw);
   }catch{failures.push(uf);}
  }));
  if(i+4<ufs.length)await new Promise(resolve=>setTimeout(resolve,250));
 }
 // Remove outdated state values rather than mixing fresh and stale results.
 data=fresh;draw();$('alert').hidden=failures.length===0;$('alert').textContent='Dados indisponíveis nesta consulta: '+failures.join(', ')+'. Os estados sem dados ficam cinza. Nova tentativa na próxima atualização.';
 $('status').textContent='Consulta: '+new Date().toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo'})+' · '+Object.keys(fresh).length+'/28 abrangências'+(fresh.BR?.final?' · Totalização concluída':' · Resultado parcial');
 }catch(error){data={};draw();$('alert').hidden=false;$('alert').textContent='Não foi possível consultar o TSE. Verifique sua conexão e tente atualizar. Nenhum resultado anterior é exibido como atual.';$('status').textContent='Consulta indisponível';}finally{busy=false;$('refresh').disabled=false;}}
async function init(){
 document.querySelectorAll('[data-uf]').forEach(path=>{for(const event of ['mouseenter','focus','click'])path.addEventListener(event,()=>detail(path.dataset.uf));path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();detail(path.dataset.uf);}});});
 $('refresh').addEventListener('click',refresh);await refresh();
 setInterval(()=>{if(!document.hidden)refresh();},300000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
}
init();
