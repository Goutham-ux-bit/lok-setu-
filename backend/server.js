require('dotenv').config();
const express=require('express'),cors=require('cors'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const app=express(),PORT=process.env.PORT||3000,ADMIN=process.env.ADMIN_PASSWORD||'admin123';
const DIR=path.join(__dirname,'data'),FILE=path.join(DIR,'db.json'),tokens=new Set();
fs.mkdirSync(DIR,{recursive:true});
const now=Date.now(),day=864e5;
let db=fs.existsSync(FILE)?JSON.parse(fs.readFileSync(FILE)):{reports:[
 {id:'LS1001',title:'Broken street light near market',cat:'Street_Light',desc:'Needs repair',loc:'Sector 4 Main Market',status:'Pending',votes:12,img:'',by:'Citizen',t:now-day,log:[{s:'Pending',t:now-day}]},
 {id:'LS1002',title:'Large pothole on ring road',cat:'Road_Damage',desc:'Dangerous for bikes',loc:'Ring Road, Gate 2',status:'Progress',votes:31,img:'',by:'Citizen',t:now-2*day,log:[{s:'Pending',t:now-2*day},{s:'Progress',t:now-day}]}]};
const save=()=>fs.writeFileSync(FILE,JSON.stringify(db,null,1));
const CATS=['Street_Light','Road_Damage','Water_Supply','Sewage','Electricity','Garbage','Other'],STAT=['Pending','Progress','Resolved','Rejected'];
const hits={};app.use((q,s,n)=>{const k=q.ip,t=Math.floor(Date.now()/6e4);hits[k]=hits[k]&&hits[k].t==t?hits[k]:{t,n:0};if(++hits[k].n>120)return s.status(429).json({error:'Too many requests'});n()});
app.use(cors());app.use(express.json({limit:'2mb'}));
const admin=(q,s,n)=>tokens.has(q.get('x-admin-token'))?n():s.status(401).json({error:'Unauthorized'});
const str=(v,m)=>String(v||'').slice(0,m);
app.post('/api/login',(q,s)=>{if(q.body.password!==ADMIN)return s.status(401).json({error:'Wrong password'});const t=crypto.randomBytes(24).toString('hex');tokens.add(t);s.json({token:t})});
app.get('/api/reports',(q,s)=>s.json(db.reports));
app.post('/api/reports',(q,s)=>{const b=q.body||{};if(!b.title||!b.loc||!CATS.includes(b.cat))return s.status(400).json({error:'Invalid report'});
 const r={id:'LS'+crypto.randomInt(10000,99999),title:str(b.title,120),cat:b.cat,desc:str(b.desc,1000),loc:str(b.loc,150),status:'Pending',votes:1,img:/^data:image\/jpeg;base64,/.test(b.img||'')&&b.img.length<900000?b.img:'',by:str(b.by,40)||'Guest',t:Date.now(),log:[{s:'Pending',t:Date.now()}]};
 db.reports.push(r);save();s.status(201).json(r)});
app.post('/api/reports/:id/vote',(q,s)=>{const r=db.reports.find(x=>x.id==q.params.id);if(!r)return s.sendStatus(404);r.votes++;save();s.json(r)});
app.patch('/api/reports/:id',admin,(q,s)=>{const r=db.reports.find(x=>x.id==q.params.id);if(!r||!STAT.includes(q.body.status))return s.sendStatus(400);r.status=q.body.status;r.log.push({s:r.status,t:Date.now()});save();s.json(r)});
app.delete('/api/reports/:id',admin,(q,s)=>{db.reports=db.reports.filter(x=>x.id!=q.params.id);save();s.sendStatus(204)});
app.use(express.static(path.join(__dirname,'..','frontend')));
app.listen(PORT,()=>console.log('Lok Setu running on http://localhost:'+PORT));
