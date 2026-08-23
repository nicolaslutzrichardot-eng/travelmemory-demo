(() => {
  const STORAGE_KEY = 'travelmemory-v1-trips';
  const defaultTrips = [
    {id:1,name:'Japon 2025',country:'Japon',city:'Tokyo · Kyoto · Osaka',type:'Vacances',start:'2025-04-12',end:'2025-04-27',note:'Cerisiers, temples et cuisine locale.',lat:35.6762,lng:139.6503,photos:684,emoji:'🇯🇵'},
    {id:2,name:'New York 2025',country:'États-Unis',city:'New York',type:'Professionnel',start:'2025-09-08',end:'2025-09-13',note:'Déplacement professionnel et quelques promenades à Manhattan.',lat:40.7128,lng:-74.0060,photos:216,emoji:'🇺🇸'},
    {id:3,name:'Paris 2026',country:'France',city:'Paris',type:'Vacances',start:'2026-05-02',end:'2026-05-06',note:'Week-end prolongé entre musées, promenades et restaurants.',lat:48.8566,lng:2.3522,photos:142,emoji:'🇫🇷'},
    {id:4,name:'Lisbonne 2024',country:'Portugal',city:'Lisbonne',type:'Vacances',start:'2024-09-10',end:'2024-09-16',note:'Lumière, tramways et côte atlantique.',lat:38.7223,lng:-9.1393,photos:327,emoji:'🇵🇹'}
  ];
  let trips = loadTrips();
  let map, markerLayer;

  const site = document.getElementById('site');
  const app = document.getElementById('app');
  const openApp = () => { site.classList.add('hidden'); app.classList.remove('hidden'); app.setAttribute('aria-hidden','false'); initMap(); renderAll(); window.scrollTo(0,0); };
  const openSite = () => { app.classList.add('hidden'); app.setAttribute('aria-hidden','true'); site.classList.remove('hidden'); window.scrollTo(0,0); };
  ['tryBtn','heroTry','miniOpen'].forEach(id => document.getElementById(id)?.addEventListener('click', openApp));
  document.querySelectorAll('.start-demo').forEach(b => b.addEventListener('click', openApp));
  document.getElementById('loginBtn').addEventListener('click', openApp);
  document.getElementById('backSite').addEventListener('click', openSite);
  document.getElementById('brandHome').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  document.querySelectorAll('.nav').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
  document.getElementById('quickImport').addEventListener('click', () => switchView('import'));
  function switchView(name){
    document.querySelectorAll('.nav').forEach(b => b.classList.toggle('active', b.dataset.view===name));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(`view-${name}`).classList.add('active-view');
    if(name==='map' && map) setTimeout(()=>map.invalidateSize(),60);
  }

  function initMap(){
    if(map) { setTimeout(()=>map.invalidateSize(),60); return; }
    if(!window.L){ document.getElementById('map').innerHTML='<div class="empty-state"><h3>Carte indisponible hors connexion</h3><p>Connectez-vous à Internet puis rechargez la page pour afficher OpenStreetMap.</p></div>'; return; }
    map = L.map('map',{worldCopyJump:true,zoomControl:true}).setView([25,10],2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
  }

  function renderAll(){ renderTrips(); renderMap(); renderStats(); renderShareSelect(); }
  function renderStats(){
    document.getElementById('statTrips').textContent=trips.length;
    document.getElementById('statCountries').textContent=new Set(trips.map(t=>t.country)).size;
    document.getElementById('statPhotos').textContent=trips.reduce((n,t)=>n+(Number(t.photos)||0),0).toLocaleString('fr-CH');
  }
  function renderMap(){
    if(!markerLayer) return;
    markerLayer.clearLayers();
    trips.forEach(t=>{
      if(!Number.isFinite(Number(t.lat))||!Number.isFinite(Number(t.lng))) return;
      const marker=L.marker([Number(t.lat),Number(t.lng)]).addTo(markerLayer).bindTooltip(t.name);
      marker.on('click',()=>showTrip(t));
    });
  }
  function showTrip(t){
    document.getElementById('tripDetail').innerHTML=`<div class="detail-grid"><div><span class="eyebrow">${esc(t.type)}</span><h2>${esc(t.emoji||'📍')} ${esc(t.name)}</h2><div class="trip-meta"><span>📍 ${esc(t.country)} · ${esc(t.city||'')}</span><span>📅 ${esc(t.start||'')} → ${esc(t.end||'')}</span><span>📷 ${(t.photos||0).toLocaleString('fr-CH')} photos</span></div><p>${esc(t.note||'Aucun commentaire.')}</p></div><div><h3>Souvenirs</h3><p class="muted">Dans la version cloud, les photos, vidéos, documents, commentaires et bandes-son de ce voyage apparaîtront ici.</p><button type="button" id="detailOpenTrips">Ouvrir le voyage</button></div></div>`;
    document.getElementById('detailOpenTrips')?.addEventListener('click',()=>switchView('trips'));
  }
  function renderTrips(){
    const box=document.getElementById('tripList');
    box.innerHTML=trips.map(t=>`<article class="trip-card"><div class="trip-cover">${esc(t.emoji||'🌍')}</div><div class="trip-card-body"><span class="eyebrow">${esc(t.type)}</span><h3>${esc(t.name)}</h3><p>${esc(t.country)} · ${esc(t.city||'')}</p><p>${esc(t.start||'Date à préciser')} → ${esc(t.end||'Date à préciser')} · ${(t.photos||0).toLocaleString('fr-CH')} photos</p><button class="show-on-map" data-id="${t.id}" type="button">Voir sur la carte</button></div></article>`).join('');
    box.querySelectorAll('.show-on-map').forEach(b=>b.addEventListener('click',()=>{
      const t=trips.find(x=>String(x.id)===b.dataset.id); if(!t)return; switchView('map'); showTrip(t); if(map&&t.lat)map.setView([t.lat,t.lng],5);
    }));
  }
  function renderShareSelect(){ document.getElementById('shareTrip').innerHTML=trips.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join(''); }

  const tripDialog=document.getElementById('tripDialog');
  document.getElementById('newTripBtn').addEventListener('click',()=>tripDialog.showModal());
  ['cancelTrip','cancelTrip2'].forEach(id=>document.getElementById(id).addEventListener('click',()=>tripDialog.close()));
  document.getElementById('tripForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=val('tripName'),country=val('tripCountry');
    if(!name||!country)return;
    trips.push({id:Date.now(),name,country,city:val('tripCity'),type:val('tripType'),start:val('tripStart'),end:val('tripEnd'),note:val('tripNote'),photos:0,lat:null,lng:null,emoji:'🌍'});
    saveTrips(); e.target.reset(); tripDialog.close(); renderAll();
  });

  const sourceInfo=document.getElementById('sourceInfo');
  const fileButton=document.getElementById('fileButton');
  const googleDemoBtn=document.getElementById('googleDemoBtn');
  const uploadIcon=document.getElementById('uploadIcon');
  const uploadTitle=document.getElementById('uploadTitle');
  const uploadText=document.getElementById('uploadText');
  document.querySelectorAll('.source-card').forEach(btn=>btn.addEventListener('click',()=>selectImportSource(btn.dataset.source)));

  function selectImportSource(source){
    document.querySelectorAll('.source-card').forEach(b=>b.classList.toggle('active',b.dataset.source===source));
    googleDemoBtn.classList.add('hidden'); fileButton.classList.remove('hidden');
    const content={
      device:{icon:'📱',title:'Choisir des photos',text:'Le sélecteur de votre appareil s’ouvre. TravelMemory n’accède qu’aux fichiers que vous choisissez.',info:'<b>Cet appareil</b><span>Import réel dans cette démo locale : les fichiers restent dans votre navigateur.</span>'},
      computer:{icon:'💻',title:'Importer depuis l’ordinateur',text:'Choisissez plusieurs photos depuis votre Mac, PC ou un dossier exporté.',info:'<b>Ordinateur</b><span>Import réel dans cette démo locale. Aucun fichier n’est envoyé sur Internet.</span>'},
      icloud:{icon:'☁️',title:'Choisir depuis iCloud Photos',text:'Sur iPhone, iPad ou Mac, le sélecteur système peut présenter les photos iCloud disponibles dans votre photothèque.',info:'<b>iCloud Photos</b><span>Test via le sélecteur Apple de votre appareil. Une connexion iCloud serveur-à-serveur n’est pas active dans cette V1.</span>'},
      google:{icon:'🟠',title:'Google Photos',text:'Testez ici le futur parcours de connexion et de sélection Google Photos.',info:'<b>Google Photos</b><span>Mode démonstration : la vraie connexion nécessitera OAuth Google et le backend TravelMemory.</span>'}
    }[source];
    uploadIcon.textContent=content.icon; uploadTitle.textContent=content.title; uploadText.textContent=content.text; sourceInfo.innerHTML=content.info;
    if(source==='google'){ fileButton.classList.add('hidden'); googleDemoBtn.classList.remove('hidden'); }
  }

  document.getElementById('photoInput').addEventListener('change', async e=>handleSelectedFiles([...e.target.files]));

  async function handleSelectedFiles(inputFiles){
    const files=inputFiles.slice(0,80), status=document.getElementById('importStatus'), preview=document.getElementById('photoPreview'), suggestions=document.getElementById('suggestions');
    preview.innerHTML=''; suggestions.innerHTML='';
    if(!files.length){status.textContent='Aucune photo sélectionnée.';return;}
    status.textContent=`Analyse locale de ${files.length} photo(s)…`;
    const groups=new Map(); let gpsCount=0;
    for(const file of files){
      let taken=file.lastModified?new Date(file.lastModified):new Date(),gps=null;
      try{ if(window.exifr){ const d=await window.exifr.parse(file,['DateTimeOriginal','latitude','longitude']); if(d?.DateTimeOriginal)taken=new Date(d.DateTimeOriginal); if(Number.isFinite(d?.latitude)&&Number.isFinite(d?.longitude)){gps=[d.latitude,d.longitude];gpsCount++;} } }catch(_){ }
      const month=`${taken.getFullYear()}-${String(taken.getMonth()+1).padStart(2,'0')}`; groups.set(month,(groups.get(month)||0)+1);
      const url=URL.createObjectURL(file),fig=document.createElement('figure'); fig.innerHTML=`<img alt="Aperçu"><figcaption>${esc(file.name)}<br>${taken.toLocaleDateString('fr-CH')}${gps?` · GPS ${gps[0].toFixed(2)}, ${gps[1].toFixed(2)}`:''}</figcaption>`; fig.querySelector('img').src=url; preview.appendChild(fig);
    }
    renderDetectedGroups(groups);
    status.textContent=`Analyse terminée : ${files.length} photo(s), ${groups.size} groupe(s) temporel(s), ${gpsCount} avec GPS. ${document.getElementById('cloudConsent').checked?'Vous avez indiqué vouloir les sauvegarder dans le cloud (simulation).':'Aucun fichier n’a été envoyé : la démo reste locale.'}`;
  }

  function renderDetectedGroups(groups){
    const suggestions=document.getElementById('suggestions');
    suggestions.innerHTML=[...groups.entries()].map(([month,n])=>`<div class="suggestion-item"><div><b>${month}</b><small>${n} photo(s) · groupe temporel détecté</small></div><button class="suggest-create" data-month="${month}" data-count="${n}" type="button">Créer</button></div>`).join('');
    suggestions.querySelectorAll('.suggest-create').forEach(b=>b.addEventListener('click',()=>{switchView('trips'); tripDialog.showModal(); document.getElementById('tripName').value=`Voyage ${b.dataset.month}`; document.getElementById('tripNote').value=`${b.dataset.count} photos détectées automatiquement dans la photothèque.`;}));
  }

  googleDemoBtn.addEventListener('click',()=>{
    const status=document.getElementById('importStatus'), preview=document.getElementById('photoPreview');
    status.innerHTML='✅ <b>Google Photos connecté — démonstration.</b><br>Dans la version cloud, Google demandera ici votre autorisation puis ouvrira son sélecteur sécurisé.';
    preview.innerHTML=`<div class="mock-album"><div class="mock-thumb">🇯🇵</div><div><b>Japon · avril 2025</b><small>684 éléments proposés par Google Photos</small></div><button class="mock-select" data-month="2025-04" data-count="684" type="button">Sélectionner</button></div><div class="mock-album"><div class="mock-thumb">🇮🇹</div><div><b>Italie · mai 2024</b><small>328 éléments proposés par Google Photos</small></div><button class="mock-select" data-month="2024-05" data-count="328" type="button">Sélectionner</button></div><div class="mock-album"><div class="mock-thumb">🇺🇸</div><div><b>New York · septembre 2025</b><small>216 éléments proposés par Google Photos</small></div><button class="mock-select" data-month="2025-09" data-count="216" type="button">Sélectionner</button></div>`;
    preview.querySelectorAll('.mock-select').forEach(b=>b.addEventListener('click',()=>{
      const groups=new Map([[b.dataset.month,Number(b.dataset.count)]]); renderDetectedGroups(groups); status.innerHTML=`✅ ${b.dataset.count} photos sélectionnées dans Google Photos <b>(simulation)</b>. Vous pouvez maintenant créer le voyage proposé.`;
    }));
  });


  document.getElementById('shareForm').addEventListener('submit',e=>{
    e.preventDefault(); const trip=trips.find(t=>String(t.id)===val('shareTrip'));
    document.getElementById('shareResult').innerHTML=`✅ Invitation de démonstration créée pour <b>${esc(val('shareEmail'))}</b><br>${esc(trip?.name||'')} · ${esc(val('shareRole'))}.`;
  });
  document.getElementById('lang').addEventListener('change',e=>{
    const msgs={fr:'Français sélectionné.',en:'English selected. Full localization comes in the cloud build.',de:'Deutsch ausgewählt. Die vollständige Übersetzung folgt in der Cloud-Version.'};
    alert(msgs[e.target.value]);
  });
  document.getElementById('accountBtn').addEventListener('click',()=>switchView('account'));

  function loadTrips(){ try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(saved)&&saved.length?saved:structuredClone(defaultTrips);}catch(_){return structuredClone(defaultTrips);} }
  function saveTrips(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(trips));}catch(_){}}
  function val(id){return document.getElementById(id).value.trim();}
  function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
})();
