(() => {
  const STORAGE_KEY = 'swisstravelmemory-v1-trips';
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
  const demoTripsBtn=document.getElementById('demoTripsBtn');
  const uploadIcon=document.getElementById('uploadIcon');
  const uploadTitle=document.getElementById('uploadTitle');
  const uploadText=document.getElementById('uploadText');
  const detectedDialog=document.getElementById('detectedTripDialog');
  let detectedTrips=[];
  let editingDetectedId=null;
  const knownPlaces=[
    {name:'Tokyo',country:'Japon',emoji:'🇯🇵',lat:35.6762,lng:139.6503,radius:140},
    {name:'Kyoto',country:'Japon',emoji:'🇯🇵',lat:35.0116,lng:135.7681,radius:100},
    {name:'Osaka',country:'Japon',emoji:'🇯🇵',lat:34.6937,lng:135.5023,radius:90},
    {name:'Paris',country:'France',emoji:'🇫🇷',lat:48.8566,lng:2.3522,radius:120},
    {name:'Lisbonne',country:'Portugal',emoji:'🇵🇹',lat:38.7223,lng:-9.1393,radius:120},
    {name:'Rome',country:'Italie',emoji:'🇮🇹',lat:41.9028,lng:12.4964,radius:130},
    {name:'New York',country:'États-Unis',emoji:'🇺🇸',lat:40.7128,lng:-74.0060,radius:170},
    {name:'Zurich',country:'Suisse',emoji:'🇨🇭',lat:47.3769,lng:8.5417,radius:100},
    {name:'Bali',country:'Indonésie',emoji:'🇮🇩',lat:-8.4095,lng:115.1889,radius:180}
  ];
  document.querySelectorAll('.source-card').forEach(btn=>btn.addEventListener('click',()=>selectImportSource(btn.dataset.source)));

  function selectImportSource(source){
    document.querySelectorAll('.source-card').forEach(b=>b.classList.toggle('active',b.dataset.source===source));
    googleDemoBtn.classList.add('hidden'); fileButton.classList.remove('hidden'); demoTripsBtn.classList.remove('hidden');
    const content={
      device:{icon:'📱',title:'Choisir des photos',text:'Le sélecteur de votre appareil s’ouvre. SwissTravelMemory n’accède qu’aux fichiers que vous choisissez.',info:'<b>Cet appareil</b><span>Import réel dans cette démo locale : les fichiers restent dans votre navigateur.</span>'},
      computer:{icon:'💻',title:'Importer depuis l’ordinateur',text:'Choisissez plusieurs photos depuis votre Mac, PC ou un dossier exporté.',info:'<b>Ordinateur</b><span>Import réel dans cette démo locale. Aucun fichier n’est envoyé sur Internet.</span>'},
      icloud:{icon:'☁️',title:'Choisir depuis iCloud Photos',text:'Sur iPhone, iPad ou Mac, le sélecteur système peut présenter les photos iCloud disponibles dans votre photothèque.',info:'<b>iCloud Photos</b><span>Test via le sélecteur Apple de votre appareil. Une connexion iCloud serveur-à-serveur n’est pas active dans cette V1.1.</span>'},
      google:{icon:'🟠',title:'Google Photos',text:'Testez ici le futur parcours de connexion et de sélection Google Photos.',info:'<b>Google Photos</b><span>Mode démonstration : la vraie connexion nécessitera OAuth Google et le backend SwissTravelMemory.</span>'}
    }[source];
    uploadIcon.textContent=content.icon; uploadTitle.textContent=content.title; uploadText.textContent=content.text; sourceInfo.innerHTML=content.info;
    if(source==='google'){ fileButton.classList.add('hidden'); googleDemoBtn.classList.remove('hidden'); demoTripsBtn.classList.add('hidden'); }
  }

  document.getElementById('photoInput').addEventListener('change', async e=>handleSelectedFiles([...e.target.files]));

  async function handleSelectedFiles(inputFiles){
    const files=inputFiles.slice(0,250), status=document.getElementById('importStatus'), preview=document.getElementById('photoPreview');
    preview.innerHTML='';
    if(!files.length){status.textContent='Aucune photo sélectionnée.';return;}
    status.textContent=`Analyse locale de ${files.length} photo(s)…`;
    const assets=[]; let gpsCount=0,exifDates=0;
    for(const [idx,file] of files.entries()){
      let taken=file.lastModified?new Date(file.lastModified):new Date(),gps=null;
      try{
        if(window.exifr){
          const d=await window.exifr.parse(file,['DateTimeOriginal','CreateDate','latitude','longitude']);
          if(d?.DateTimeOriginal||d?.CreateDate){ taken=new Date(d.DateTimeOriginal||d.CreateDate); exifDates++; }
          if(Number.isFinite(d?.latitude)&&Number.isFinite(d?.longitude)){gps=[d.latitude,d.longitude];gpsCount++;}
        }
      }catch(_){ }
      assets.push({id:idx,file,taken,gps});
      if(idx<24){
        const url=URL.createObjectURL(file),fig=document.createElement('figure');
        fig.innerHTML=`<img alt="Aperçu"><figcaption>${esc(file.name)}<br>${taken.toLocaleDateString('fr-CH')}${gps?` · GPS ${gps[0].toFixed(2)}, ${gps[1].toFixed(2)}`:' · GPS indisponible'}</figcaption>`;
        fig.querySelector('img').src=url; preview.appendChild(fig);
      }
    }
    detectedTrips=detectTripsFromAssets(assets);
    status.textContent=`Analyse des lieux… ${files.length} photo(s), ${gpsCount} avec GPS.`;
    detectedTrips=await enrichTripsWithWebPlaces(detectedTrips);
    renderDetectedTrips();
    const placesFound=detectedTrips.filter(t=>t.country && t.country!=='Lieu à confirmer').length;
    status.textContent=`Analyse terminée : ${files.length} photo(s), ${exifDates} date(s) EXIF, ${gpsCount} avec GPS, ${detectedTrips.length} voyage(s) potentiel(s), ${placesFound} lieu(x) identifié(s). ${document.getElementById('cloudConsent').checked?'Sauvegarde cloud demandée (simulation).':'Aucun fichier n’a été envoyé : analyse locale uniquement.'}`;
  }

  function detectTripsFromAssets(assets){
    const sorted=assets.slice().sort((a,b)=>a.taken-b.taken);
    if(!sorted.length)return [];
    const groups=[]; let current=[];
    for(const asset of sorted){
      if(!current.length){current=[asset];continue;}
      const prev=current[current.length-1];
      const gapDays=(asset.taken-prev.taken)/86400000;
      const dist=(asset.gps&&prev.gps)?distanceKm(asset.gps[0],asset.gps[1],prev.gps[0],prev.gps[1]):0;
      const split=gapDays>4 || (gapDays>0.5 && dist>350);
      if(split){groups.push(current);current=[asset];}else current.push(asset);
    }
    if(current.length)groups.push(current);
    return groups.filter(g=>g.length>0).map((g,i)=>buildDetectedTrip(g,i));
  }

  function buildDetectedTrip(group,i){
    const gps=group.filter(x=>x.gps);
    let lat=null,lng=null;
    if(gps.length){lat=gps.reduce((n,x)=>n+x.gps[0],0)/gps.length;lng=gps.reduce((n,x)=>n+x.gps[1],0)/gps.length;}
    const place=lat!==null?nearestKnownPlace(lat,lng):null;
    const start=group[0].taken,end=group[group.length-1].taken;
    const country=place?.country||'Lieu à confirmer';
    const city=place?.name||(lat!==null?`GPS ${lat.toFixed(2)}, ${lng.toFixed(2)}`:'Lieu non détecté');
    const name=place?`${place.name} ${start.getFullYear()}`:`Voyage ${start.toLocaleDateString('fr-CH',{month:'long',year:'numeric'})}`;
    return {id:`det-${Date.now()}-${i}`,name,country,city,type:'Vacances',start:isoDate(start),end:isoDate(end),note:`${group.length} photo(s) regroupées automatiquement à partir des dates${gps.length?` et de ${gps.length} position(s) GPS`:''}.`,photos:group.length,lat,lng,emoji:place?.emoji||'🧭',gpsCount:gps.length,ignored:false};
  }

  function renderDetectedTrips(){
    const suggestions=document.getElementById('suggestions');
    const active=detectedTrips.filter(t=>!t.ignored);
    if(!active.length){suggestions.innerHTML='<div class="detected-empty"><b>Aucun voyage proposé</b><small>Sélectionnez des photos ou utilisez le mode démonstration.</small></div>';return;}
    suggestions.innerHTML=active.map(t=>`<article class="detected-trip" data-id="${t.id}"><div class="detected-flag">${esc(t.emoji)}</div><div class="detected-main"><div class="detected-title"><div><span class="eyebrow">Nouveau voyage détecté</span><h4>${esc(t.name)}</h4></div><span class="confidence">${t.gpsCount?'GPS + dates':'Dates disponibles'}</span></div><div class="detected-facts"><div><small>📍 LIEU DÉTECTÉ</small><strong>${esc(t.country)}</strong><span>${esc(t.city || 'Ville à confirmer')}</span>${Number.isFinite(t.lat)&&Number.isFinite(t.lng)?`<em class="place-source">${esc(t.placeSource||'GPS')} · ${t.lat.toFixed(3)}, ${t.lng.toFixed(3)}</em>`:'<em class="place-source">Aucune coordonnée GPS transmise par le navigateur</em>'}</div><div><small>📅 DATES DÉTECTÉES</small><strong>${formatDate(t.start)} — ${formatDate(t.end)}</strong><span>${t.start===t.end?'1 journée':dateSpanLabel(t.start,t.end)}</span></div></div><div class="detected-meta"><span>📷 ${t.photos} photo(s)</span><span>📍 ${t.gpsCount} photo(s) avec GPS</span></div>${(!t.gpsCount||t.country==='Lieu à confirmer')?'<div class="metadata-warning">ℹ️ Le navigateur ne transmet pas de GPS exploitable pour ce groupe. Utilisez « Modifier » pour indiquer la ville/pays, ou la future application iOS/Android pour une détection native.</div>':''}<div class="detected-actions"><button class="detected-create" data-id="${t.id}" type="button">Créer le voyage</button><button class="outline detected-edit" data-id="${t.id}" type="button">Modifier</button><button class="ghost detected-ignore" data-id="${t.id}" type="button">Ignorer</button></div></div></article>`).join('');
    suggestions.querySelectorAll('.detected-create').forEach(b=>b.addEventListener('click',()=>createDetectedTrip(b.dataset.id)));
    suggestions.querySelectorAll('.detected-edit').forEach(b=>b.addEventListener('click',()=>editDetectedTrip(b.dataset.id)));
    suggestions.querySelectorAll('.detected-ignore').forEach(b=>b.addEventListener('click',()=>ignoreDetectedTrip(b.dataset.id)));
  }

  function createDetectedTrip(id){
    const t=detectedTrips.find(x=>x.id===id); if(!t)return;
    trips.push({...t,id:Date.now()}); saveTrips(); t.ignored=true; renderAll(); renderDetectedTrips();
    document.getElementById('importStatus').innerHTML=`✅ <b>${esc(t.name)}</b> a été créé avec ${t.photos} photo(s) associée(s) dans cette démonstration.`;
  }
  function ignoreDetectedTrip(id){const t=detectedTrips.find(x=>x.id===id);if(t){t.ignored=true;renderDetectedTrips();}}
  function editDetectedTrip(id){
    const t=detectedTrips.find(x=>x.id===id);if(!t)return;editingDetectedId=id;
    document.getElementById('detectedName').value=t.name;document.getElementById('detectedCountry').value=t.country;document.getElementById('detectedCity').value=t.city;document.getElementById('detectedType').value=t.type;document.getElementById('detectedStart').value=t.start;document.getElementById('detectedEnd').value=t.end;document.getElementById('detectedNote').value=t.note;detectedDialog.showModal();
  }
  document.getElementById('detectedTripForm').addEventListener('submit',e=>{e.preventDefault();const t=detectedTrips.find(x=>x.id===editingDetectedId);if(!t)return;t.name=val('detectedName');t.country=val('detectedCountry');t.city=val('detectedCity');t.type=val('detectedType');t.start=val('detectedStart');t.end=val('detectedEnd');t.note=val('detectedNote');detectedDialog.close();renderDetectedTrips();});
  ['closeDetectedTrip','cancelDetectedTrip'].forEach(id=>document.getElementById(id).addEventListener('click',()=>detectedDialog.close()));

  demoTripsBtn.addEventListener('click',()=>{
    detectedTrips=[
      {id:'demo-jp',name:'Japon 2025',country:'Japon',city:'Tokyo · Kyoto · Osaka',type:'Vacances',start:'2025-04-12',end:'2025-04-27',note:'684 photos détectées automatiquement à partir des dates et positions GPS.',photos:684,lat:35.3,lng:136.6,emoji:'🇯🇵',gpsCount:641,ignored:false},
      {id:'demo-it',name:'Italie 2024',country:'Italie',city:'Rome · Florence',type:'Vacances',start:'2024-05-08',end:'2024-05-15',note:'328 photos détectées automatiquement.',photos:328,lat:42.2,lng:12.4,emoji:'🇮🇹',gpsCount:297,ignored:false},
      {id:'demo-us',name:'New York 2025',country:'États-Unis',city:'New York',type:'Professionnel',start:'2025-09-08',end:'2025-09-13',note:'216 photos détectées automatiquement.',photos:216,lat:40.7128,lng:-74.006,emoji:'🇺🇸',gpsCount:198,ignored:false}
    ];
    renderDetectedTrips();
    document.getElementById('photoPreview').innerHTML='<div class="demo-explainer"><span>✨</span><div><b>Mode démonstration activé</b><p>Ces voyages simulent le résultat obtenu après analyse d’une photothèque iPhone ou Android. Testez Créer, Modifier et Ignorer.</p></div></div>';
    document.getElementById('importStatus').innerHTML='✅ <b>3 voyages détectés avec lieux et dates.</b> Japon : 12–27 avril 2025 · Italie : 8–15 mai 2024 · New York : 8–13 septembre 2025.';
  });

  googleDemoBtn.addEventListener('click',()=>{
    detectedTrips=[
      {id:'g-jp',name:'Japon 2025',country:'Japon',city:'Tokyo · Kyoto · Osaka',type:'Vacances',start:'2025-04-12',end:'2025-04-27',note:'Sélection Google Photos — démonstration.',photos:684,lat:35.3,lng:136.6,emoji:'🇯🇵',gpsCount:620,ignored:false},
      {id:'g-it',name:'Italie 2024',country:'Italie',city:'Rome',type:'Vacances',start:'2024-05-08',end:'2024-05-15',note:'Sélection Google Photos — démonstration.',photos:328,lat:41.9028,lng:12.4964,emoji:'🇮🇹',gpsCount:301,ignored:false}
    ];
    renderDetectedTrips();
    document.getElementById('importStatus').innerHTML='✅ <b>Google Photos connecté — démonstration.</b> Deux voyages potentiels sont proposés ci-contre.';
    document.getElementById('photoPreview').innerHTML='<div class="demo-explainer"><span>🟠</span><div><b>Google Photos Picker — simulation</b><p>La vraie version ouvrira le sélecteur sécurisé Google. Seules les photos choisies par l’utilisateur seront analysées.</p></div></div>';
  });

  function dateSpanLabel(start,end){
    const a=new Date(start+'T12:00:00'),b=new Date(end+'T12:00:00');
    const days=Math.max(1,Math.round((b-a)/86400000)+1);
    return `${days} jours`;
  }


  const webPlaceCache=new Map();

  async function reverseGeocodeWeb(lat,lng){
    if(!Number.isFinite(lat)||!Number.isFinite(lng)) return null;
    const key=`${lat.toFixed(4)},${lng.toFixed(4)}`;
    if(webPlaceCache.has(key)) return webPlaceCache.get(key);

    try{
      const url=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=10&addressdetails=1&accept-language=fr`;
      const response=await fetch(url,{headers:{Accept:'application/json'}});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      const a=data.address||{};
      const place={
        city:a.city||a.town||a.village||a.municipality||a.county||a.state||'',
        region:a.state||a.region||'',
        country:a.country||'',
        countryCode:(a.country_code||'').toUpperCase()
      };
      webPlaceCache.set(key,place);
      return place;
    }catch(err){
      console.warn('Identification du lieu indisponible',err);
      webPlaceCache.set(key,null);
      return null;
    }
  }

  async function enrichTripsWithWebPlaces(trips){
    for(const trip of trips){
      if(!Number.isFinite(trip.lat)||!Number.isFinite(trip.lng)) continue;

      // Les lieux connus intégrés restent instantanés.
      const known=nearestKnownPlace(trip.lat,trip.lng);
      if(known){
        trip.country=known.country;
        trip.city=known.name;
        trip.emoji=known.emoji||trip.emoji;
        trip.placeSource='GPS';
        continue;
      }

      // Pour le reste du monde, convertir latitude/longitude en ville + pays.
      const place=await reverseGeocodeWeb(trip.lat,trip.lng);
      if(place && (place.country||place.city)){
        trip.country=place.country||'Lieu à confirmer';
        trip.city=place.city||place.region||'Ville à confirmer';
        trip.name=`${trip.city!=='Ville à confirmer'?trip.city:trip.country} ${new Date(trip.start+'T12:00:00').getFullYear()}`;
        trip.placeSource='GPS + OpenStreetMap';
      }else{
        trip.placeSource='GPS disponible · lieu à confirmer';
      }

      // Petite temporisation pour ne pas surcharger le service public.
      await new Promise(resolve=>setTimeout(resolve,180));
    }
    return trips;
  }

  function nearestKnownPlace(lat,lng){let best=null,bestD=Infinity;for(const p of knownPlaces){const d=distanceKm(lat,lng,p.lat,p.lng);if(d<bestD){best=p;bestD=d;}}return best&&bestD<=best.radius?best:null;}
  function distanceKm(a,b,c,d){const r=6371,toRad=x=>x*Math.PI/180;const dLat=toRad(c-a),dLon=toRad(d-b);const x=Math.sin(dLat/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;return 2*r*Math.asin(Math.sqrt(x));}
  function isoDate(d){return new Date(d).toISOString().slice(0,10);}
  function formatDate(s){if(!s)return 'Date à préciser';const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d)).toLocaleDateString('fr-CH',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});}


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

  const nativeScanBtn=document.getElementById("simulateNativeScan");
  if(nativeScanBtn){
    nativeScanBtn.addEventListener("click",()=>{
      const nativeTrips=[
        {id:"native-jp",emoji:"🇯🇵",name:"Japon · Printemps 2025",country:"Japon",city:"Tokyo · Kyoto · Osaka",start:"2025-04-12",end:"2025-04-27",photos:684,gpsCount:612,status:"active",lat:35.6762,lng:139.6503},
        {id:"native-it",emoji:"🇮🇹",name:"Italie · Mai 2024",country:"Italie",city:"Rome · Florence",start:"2024-05-08",end:"2024-05-15",photos:328,gpsCount:291,status:"active",lat:41.9028,lng:12.4964},
        {id:"native-us",emoji:"🇺🇸",name:"New York · Septembre 2025",country:"États-Unis",city:"New York",start:"2025-09-08",end:"2025-09-13",photos:216,gpsCount:198,status:"active",lat:40.7128,lng:-74.0060}
      ];
      detectedTrips=nativeTrips;
      const status=document.getElementById("importStatus");
      if(status) status.innerHTML="📱 <b>Simulation mobile terminée :</b> 3 voyages retrouvés à partir des dates et positions de la photothèque autorisée.";
      const diag=document.getElementById("gpsDiagnosticText");
      if(diag) diag.textContent="1 228 médias analysés localement · 1 228 avec date · 1 101 avec position exploitable.";
      renderDetectedTrips();
      document.getElementById("detectedSuggestions")?.scrollIntoView({behavior:"smooth",block:"start"});
    });
  }

})();
