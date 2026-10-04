const $=id=>document.getElementById(id);
const names={RO:'Rondônia',AC:'Acre',AM:'Amazonas',RR:'Roraima',PA:'Pará',AP:'Amapá',TO:'Tocantins',MA:'Maranhão',PI:'Piauí',CE:'Ceará',RN:'Rio Grande do Norte',PB:'Paraíba',PE:'Pernambuco',AL:'Alagoas',SE:'Sergipe',BA:'Bahia',MG:'Minas Gerais',ES:'Espírito Santo',RJ:'Rio de Janeiro',SP:'São Paulo',PR:'Paraná',SC:'Santa Catarina',RS:'Rio Grande do Sul',MS:'Mato Grosso do Sul',MT:'Mato Grosso',GO:'Goiás',DF:'Distrito Federal'};
let data={},selected='SP',busy=false;
const number=v=>v===null||v===undefined||v===''?null:Number(String(v).replace(',','.'));
const pct=v=>v===null?'—':new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v)+'%';
const integer=v=>new Intl.NumberFormat('pt-BR').format(v);
const candidateColors={'13':'#d94950','22':'#3474c5','55':'#8056b2','70':'#269b88','14':'#c27924','30':'#a47a3c'};
function displayName(candidate){
 if(candidate.n==='13')return 'Lula';if(candidate.n==='22')return 'Flávio Bolsonaro';
 return candidate.name.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g,s=>s.toLocaleUpperCase('pt-BR'));
}
function parse(raw){
 const cargo=raw.carg?.find(c=>c.cd==='1');if(!cargo||!raw.s)throw Error('Formato de dados inesperado');
 const candidates=(cargo.agr||[]).flatMap(a=>(a.par||[]).flatMap(p=>(p.cand||[]).map(c=>({n:c.n,name:c.nmu,party:p.sg,votes:number(c.vap),pct:number(c.pvap)}))));
 const ranking=candidates.slice().sort((a,b)=>b.votes-a.votes||Number(a.n)-Number(b.n)).slice(0,4);
 return {ranking,lula:candidates.find(c=>c.n==='13')??null,bolsonaro:candidates.find(c=>c.n==='22')??null,count:number(raw.s.pst),total:number(raw.s.ts),counted:number(raw.s.st),time:raw.dt+' '+raw.ht,date:raw.dt,final:raw.and==='f'};
}
function track(value,color){const element=document.createElement('div');element.className='track';const bar=document.createElement('i');bar.style.width=(value??0)+'%';if(color)bar.style.background=color;element.append(bar);return element;}
function nationalRanking(d){
 const summary=$('national-summary');summary.replaceChildren();
 if(!d){const empty=document.createElement('article');empty.textContent='Dados nacionais indisponíveis';summary.append(empty);}
 for(const [position,c]of(d?.ranking??[]).entries()){
  const color=candidateColors[c.n]??'#687e85';const card=document.createElement('article');card.className='ranking-card';card.style.setProperty('--candidate-color',color);
  const top=document.createElement('div');top.className='card-top';top.textContent=`BRASIL · ${position+1}º · ${c.party} ${c.n}`;
  const name=document.createElement('h2');name.textContent=displayName(c);const value=document.createElement('strong');value.textContent=pct(c.pct);
  const votes=document.createElement('p');votes.textContent=integer(c.votes)+' votos válidos';card.append(top,name,value,votes,track(c.pct,color));summary.append(card);
 }
 const count=document.createElement('article');count.className='count';const title=document.createElement('div');title.className='card-top';title.textContent='APURAÇÃO NACIONAL';
 const label=document.createElement('h2');label.textContent='Urnas apuradas';const value=document.createElement('strong');value.textContent=pct(d?.count??null);
 const total=document.createElement('p');total.textContent=d?integer(d.counted)+' de '+integer(d.total)+' seções':'Dados indisponíveis';count.append(title,label,value,total,track(d?.count));summary.append(count);
}
function winner(d){if(!d?.lula||!d?.bolsonaro||d.lula.votes===d.bolsonaro.votes)return '';return d.lula.votes>d.bolsonaro.votes?'lula':'bolsonaro';}
function draw(){
 const br=data.BR;
 nationalRanking(br);
 $('national-time').textContent=br?'TSE · Brasil: '+br.time+' (Brasília)':'Aguardando dados nacionais';
 document.querySelectorAll('[data-uf]').forEach(path=>{const uf=path.dataset.uf,d=data[uf];path.classList.remove('lula','bolsonaro','selected');const w=winner(d);if(w)path.classList.add(w);path.classList.toggle('selected',uf===selected);path.setAttribute('aria-label',`${names[uf]}. ${(d?.ranking??[]).map((c,i)=>`${i+1}º: ${displayName(c)} ${pct(c.pct)}`).join('. ')}. Urnas apuradas ${pct(d?.count??null)}.`);path.querySelector('title').textContent=path.getAttribute('aria-label');});
 detail(selected);
}
function detail(uf){selected=uf;const d=data[uf];$('state-title').textContent=names[uf]+' · '+uf;$('state-meta').textContent=d?'TSE: '+d.time+' (Brasília)':'Dados indisponíveis nesta consulta';$('state-detail').replaceChildren();
 for(const [position,c]of(d?.ranking??[]).entries()){
  const color=candidateColors[c.n]??'#687e85';const box=document.createElement('div');box.className='result';
  const row=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');label.textContent=`${position+1}º · ${displayName(c)}`;value.textContent=pct(c.pct);value.style.color=color;row.append(label,value);
  const votes=document.createElement('p');votes.className='candidate-meta';votes.textContent=`${c.party} · ${c.n} · ${integer(c.votes)} votos`;box.append(row,votes,track(c.pct,color));$('state-detail').append(box);
 }
 const count=document.createElement('div');count.className='result state-count';const row=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');label.textContent='Urnas apuradas';value.textContent=pct(d?.count??null);row.append(label,value);count.append(row,track(d?.count));$('state-detail').append(count);
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
