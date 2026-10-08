// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {DemoContext, useDemo} from '@/lib/demo-context';
import {appendVersion, can, initialFormulas} from '@/lib/model';
import type {Formula, FormulaVersion, Page, Role} from '@/lib/model';
import type {SaveResult} from '@/lib/demo-context';
import {storeApi, StoreRequestError} from '@/lib/store-client';
import type {StoreSnapshot} from '@/lib/store-client';
import {localizeValidationMessage} from '@/lib/validation-messages';
import {Badge, Icon, Modal, Notice, Panel} from './ui';
import {FormulaEditor, FormulaLibrary} from './formula-pages';
import {LabPage, CompliancePage} from './lab-pages';
import {ReferenceDataPage} from './reference-data';
import {referenceApi} from '@/lib/reference-client';
import type {ActiveReference} from '@/lib/reference-client';
import {AccountPage, AdminPage, TutorialPage, PublicPage, AuthPage} from './access-pages';
import {PersonaSwitcher} from './persona-switcher';
import {Dropdown} from './dropdown';
import {ThemeToggle} from './theme-toggle';
import {PresentationGuide} from './presentation-guide';
const navItems:{page:Page;icon:string;en:string;th:string;group:string}[]=[
  {page:'dashboard',icon:'grid',en:'Overview',th:'ภาพรวม',group:'roadmap'},
  {page:'formulas',icon:'flask',en:'Formula library',th:'คลังสูตร',group:'workspace'},
  {page:'lab',icon:'layers',en:'Lab workspace',th:'พื้นที่แล็บ',group:'roadmap'},
  {page:'compliance',icon:'shield',en:'Compliance & docs',th:'ข้อกำหนดและเอกสาร',group:'roadmap'},
  {page:'references',icon:'book',en:'Reference data',th:'ข้อมูลอ้างอิง',group:'workspace'},
  {page:'tutorial',icon:'spark',en:'Getting started',th:'บทสอนเริ่มต้น',group:'roadmap'},
  {page:'account',icon:'user',en:'My account',th:'บัญชีของฉัน',group:'roadmap'},
  {page:'admin',icon:'users',en:'Team & roles',th:'ทีมและบทบาท',group:'workspace'},
];
// Pages in the roadmap group are hidden unless the footer's Roadmap switch is on.
const roadmapPages:Page[]=navItems.filter(x=>x.group==='roadmap').map(x=>x.page);
const domainPages:Page[]=['formulas','editor','lab','compliance','references'];
// [English, Thai]. Persona role names stay English; "Pending access" is an account status, not a role.
const label=(role:Role):[string,string]=>{
  if(role==='pending')return ['Pending access','รอสิทธิ์ใช้งาน'];
  const name=role.split('_').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
  return [name,name];
};
export default function DemoApp(){
  const [page,setPage]=useState<Page>('editor');
  const [viewState,setViewState]=useState<'ready'|'loading'|'error'>('ready');
  const [role,setCurrentRole]=useState<Role>('formulator');
  const [locale,setLocale]=useState<'en'|'th'>('en');
  const [formulas,setFormulas]=useState(initialFormulas);
  const [selectedId,setSelectedId]=useState('formula-1');
  const [store,setStore]=useState<{state:'loading'|'saved'|'offline';revision:number}>({state:'loading',revision:0});
  const [reference,setReference]=useState<ActiveReference|null>(null);
  // Remembered per browser; storage may be unavailable, so every access is guarded.
  const [presenter,setPresenter]=useState(false);
  useEffect(()=>{try{setPresenter(localStorage.getItem('perfumery.presenter')==='on');}catch{}},[]);
  const [roadmap,setRoadmap]=useState(false);
  useEffect(()=>{try{setRoadmap(localStorage.getItem('perfumery.roadmap')==='on');}catch{}},[]);
  const toggleRoadmap=()=>setRoadmap(on=>{const next=!on;try{localStorage.setItem('perfumery.roadmap',next?'on':'off');}catch{}if(!next&&roadmapPages.includes(page))setPage('formulas');return next;});
  const togglePresenter=()=>setPresenter(on=>{const next=!on;try{localStorage.setItem('perfumery.presenter',next?'on':'off');}catch{}return next;});
  const reloadReference=useCallback(()=>{referenceApi.active().then(setReference).catch(()=>setReference(null));},[]);
  useEffect(()=>{reloadReference();},[reloadReference]);
  const [dirty,setDirtyState]=useState(false);
  const dirtyRef=useRef(false);
  const setDirty=useCallback((value:boolean)=>{dirtyRef.current=value;setDirtyState(value);},[]);
  const [mobileNav,setMobileNav]=useState(false);
  const [pendingAction,setPendingAction]=useState<(()=>void)|null>(null);
  const [toast,setToast]=useState('');
  const [epoch,setEpoch]=useState(0);
  const [editorEpoch,setEditorEpoch]=useState(0);
  const [tip,setTip]=useState(true);
  const [tourInfo,setTourInfo]=useState(false);
  const [authIntent,setAuthIntent]=useState<'reset'|'recovery'|null>(null);
  const toastTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const t=useCallback((en:string,th:string)=>locale==='th'?th:en,[locale]);
  const mainRef=useRef<HTMLElement>(null);
  const sidebarRef=useRef<HTMLElement>(null);
  const menuRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{document.documentElement.lang=locale;},[locale]);
  // The static metadata title is English; follow the selected language in the browser tab.
  useEffect(()=>{document.title=t('AI Perfumery Engine · AI Perfumery Engine Demo','AI Perfumery Engine · เดโม AI Perfumery Engine');},[t]);
  useEffect(()=>{setViewState('ready');},[page]);
  useEffect(()=>{if(!dirty)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  useEffect(()=>()=>{if(toastTimer.current)clearTimeout(toastTimer.current);},[]);
  useEffect(()=>{
    if(!mobileNav)return;
    const before=document.activeElement as HTMLElement|null;
    const sidebar=sidebarRef.current;
    sidebar?.querySelector<HTMLElement>('a, button')?.focus();
    const handle=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){setMobileNav(false);e.preventDefault();return;}
      if(e.key!=='Tab'||!sidebar)return;
      const items=Array.from(sidebar.querySelectorAll<HTMLElement>('a, button, select')).filter(x=>!x.hasAttribute('disabled'));
      const first=items[0],last=items.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',handle);
    return()=>{document.removeEventListener('keydown',handle);if(before===menuRef.current)menuRef.current?.focus();};
  },[mobileNav]);
  const notify=useCallback((message:string)=>{clearTimeout(toastTimer.current);setToast(message);toastTimer.current=setTimeout(()=>setToast(''),6000);},[]);
  // A toast is already resolved to the language it was raised in; close it on a language switch instead of showing stale text.
  useEffect(()=>{clearTimeout(toastTimer.current);setToast('');},[locale]);
  // Read the saved formulas once. The editor remounts so it opens on the saved latest version.
  const applySnapshot=useCallback((data:StoreSnapshot)=>{setFormulas(data.formulas);setStore({state:'saved',revision:data.revision});},[]);
  useEffect(()=>{let live=true;storeApi.load().then(data=>{if(!live)return;applySnapshot(data);setEditorEpoch(x=>x+1);if(data.notice)notify(data.notice);}).catch(()=>{if(live)setStore(s=>({...s,state:'offline'}));});return()=>{live=false;};},[applySnapshot,notify]);
  function guarded(action:()=>void){if(dirtyRef.current){setPendingAction(()=>action);}else action();}
  function allowed(target:Page,nextRole=role){if(!roadmap&&roadmapPages.includes(target))return false;if(target==='references')return nextRole==='system_admin';if(domainPages.includes(target))return can(nextRole,'read');return true;}
  function navigate(target:Page){if(target===page)return;guarded(()=>{setPage(allowed(target)?target:'formulas');setMobileNav(false);setDirty(false);requestAnimationFrame(()=>{mainRef.current?.focus();window.scrollTo({top:0});});});}
  function setRole(next:Role){guarded(()=>{setCurrentRole(next);setDirty(false);if(!allowed(page,next))setPage('formulas');const [nameEn,nameTh]=label(next);notify(t(`Demo persona: ${nameEn}. No real permissions changed.`,`บทบาทจำลอง: ${nameTh} ไม่มีการเปลี่ยนสิทธิ์จริง`));});}
  // Turns a store refusal into a message. A stale revision reloads the list so the next try starts fresh.
  async function storeFailure(error:unknown):Promise<readonly [string,string]>{
    if(error instanceof StoreRequestError&&error.code==='stale'){try{applySnapshot(await storeApi.load());}catch{}return ['Another tab saved first. The latest formulas are loaded; your change was not saved, so make it again.','อีกแท็บบันทึกก่อน โหลดสูตรล่าสุดแล้ว การเปลี่ยนแปลงของคุณยังไม่ถูกบันทึก กรุณาทำอีกครั้ง'];}
    if(error instanceof StoreRequestError&&error.code==='offline'){setStore(s=>({...s,state:'offline'}));return ['The local store is not reachable, so nothing was saved. Is the demo server still running?','เชื่อมต่อที่เก็บข้อมูลในเครื่องไม่ได้ จึงยังไม่ได้บันทึก เซิร์ฟเวอร์เดโมยังทำงานอยู่หรือไม่'];}
    const message=error instanceof Error?error.message:'The change was not saved.';
    return [message,localizeValidationMessage(message,'th')??message];
  }
  async function createFormula(name:string,version:FormulaVersion):Promise<SaveResult<Formula>>{
    if(store.state==='offline'){
      // Not saved anywhere: kept in this tab, as the demo behaved before the store existed.
      const id=`formula-demo-${Date.now()}`;
      const next:Formula={id,name,code:`F-${String(formulas.length+1).padStart(3,'0')}`,updatedLabel:'Just now',versions:[{...version,ingredients:version.ingredients.map(x=>({...x})),id:`${id}-v1`,number:1,createdLabel:'This session',note:'Initial synthetic version'}]};
      setFormulas(items=>[next,...items]);return {ok:true,value:next};
    }
    try{const data=await storeApi.create(store.revision,name,version);applySnapshot(data);return {ok:true,value:data.formulas[0]};}
    catch(error){return {ok:false,error:await storeFailure(error)};}
  }
  async function saveVersion(formulaId:string,version:FormulaVersion,note:string):Promise<SaveResult<FormulaVersion>>{
    if(store.state==='offline'){
      const formula=formulas.find(f=>f.id===formulaId);if(!formula)return {ok:false,error:['This formula no longer exists.','ไม่พบสูตรนี้แล้ว']};
      const next=appendVersion(formula,version,note);setFormulas(items=>items.map(item=>item.id===formulaId?next:item));return {ok:true,value:next.versions.at(-1)!};
    }
    try{const data=await storeApi.appendVersion(store.revision,formulaId,version,note);applySnapshot(data);return {ok:true,value:data.formulas.find(f=>f.id===formulaId)!.versions.at(-1)!};}
    catch(error){return {ok:false,error:await storeFailure(error)};}
  }
  function selectFormula(id:string){guarded(()=>{setSelectedId(id);setEditorEpoch(x=>x+1);setPage('editor');setDirty(false);setMobileNav(false);requestAnimationFrame(()=>mainRef.current?.focus());});}
  function reset(){guarded(()=>{
    const after=()=>{setSelectedId('formula-1');setPage('editor');setCurrentRole('formulator');setDirty(false);setEpoch(x=>x+1);setEditorEpoch(x=>x+1);setTip(true);};
    if(store.state==='offline'){setFormulas(initialFormulas());after();notify(t('Demo reset in this tab. The local store is not reachable.','รีเซ็ตเดโมในแท็บนี้แล้ว เชื่อมต่อที่เก็บข้อมูลในเครื่องไม่ได้'));return;}
    storeApi.reset().then(data=>{applySnapshot(data);after();notify(t('Demo reset. The previous formulas were kept as a backup file.','รีเซ็ตเดโมแล้ว สูตรก่อนหน้าถูกเก็บเป็นไฟล์สำรอง'));}).catch(async error=>notify(t(...await storeFailure(error))));
  });}
  const current=navItems.find(x=>x.page===page);
  const context={page,navigate,role,setRole,locale,t,formulas,setFormulas,selectedId,selectFormula,notify,reset,store,reference,reloadReference,presenter,createFormula,saveVersion,dirty,setDirty,authIntent,setAuthIntent};
  return <DemoContext value={context}><a href="#main-content" className="skip-link">{t('Skip to content','ข้ามไปเนื้อหา')}</a><div className="app-shell">
    {mobileNav&&<button className="nav-scrim" aria-label={t('Close navigation','ปิดเมนู')} onClick={()=>setMobileNav(false)}/>}
    <aside role={mobileNav?'dialog':undefined} aria-modal={mobileNav?true:undefined} ref={sidebarRef} className={`sidebar ${mobileNav?'sidebar-open':''}`} aria-label={t('Main navigation','เมนูหลัก')}>
      <a className="brand" href="#" onClick={e=>{e.preventDefault();navigate('dashboard');}}><span className="brand-mark"><Icon name="flask" size={25}/></span><span><strong>AI Perfumery Engine</strong><small>AI PERFUMERY ENGINE</small></span></a>
      <div className="org-card"><span className="org-avatar">A</span><span><strong>Demo Lab A</strong><small>{t('Synthetic workspace','พื้นที่ทำงานจำลอง')}</small></span><Icon name="lock" size={15}/></div>
      <nav>{(roadmap?['workspace','roadmap']:['workspace']).map(group=><div className="nav-group" key={group}><div className="nav-label">{group==='workspace'?t('WORKSPACE · THIS BUILD','พื้นที่ทำงาน · รอบนี้'):t('ROADMAP PREVIEW · NOT IN THIS BUILD','ตัวอย่างแผนงาน · ยังไม่อยู่ในรอบนี้')}</div>{navItems.filter(x=>x.group===group && (x.page!=='references'||role==='system_admin') && (!domainPages.includes(x.page)||can(role,'read'))).map(item=><button key={item.page} className={`nav-item ${(page===item.page||(page==='editor'&&item.page==='formulas'))?'nav-active':''}`} aria-current={page===item.page||(page==='editor'&&item.page==='formulas')?'page':undefined} onClick={()=>navigate(item.page)}><Icon name={item.icon} size={19}/>{t(item.en,item.th)}{item.page==='formulas'&&<span className="nav-count">{formulas.length}</span>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={()=>navigate('public')}><Icon name="globe" size={18}/>{t('About the platform','เกี่ยวกับระบบ')}</button><div className="sidebar-footnote">{t('MVP PREVIEW','ตัวอย่าง MVP')} <span>01</span></div></div>
    </aside>
    <header inert={mobileNav} className="topbar"><div className="topbar-left"><button ref={menuRef} className="icon-button mobile-menu" aria-label={t('Open navigation','เปิดเมนู')} aria-expanded={mobileNav} onClick={()=>setMobileNav(!mobileNav)}><Icon name="menu"/></button><span className="breadcrumb">{t('Workspace','พื้นที่ทำงาน')}<span>/</span><strong>{page==='editor'?t('Formula workspace','พื้นที่สูตร'):current?t(current.en,current.th):page==='auth'?t('Access walkthrough','ทดลองเข้าสู่ระบบ'):t('About','เกี่ยวกับระบบ')}</strong></span></div><div className="topbar-actions"><ThemeToggle/><button className="locale-button" onClick={()=>setLocale(locale==='en'?'th':'en')} aria-label={t('Switch language to Thai','เปลี่ยนภาษาเป็นอังกฤษ')}><Icon name="globe" size={15}/>{locale==='en'?'EN':'TH'}</button><button className="icon-button reset-button" aria-label={t('Reset demo','รีเซ็ตเดโม')} title={t('Reset demo','รีเซ็ตเดโม')} onClick={reset}><Icon name="refresh" size={18}/></button><PersonaSwitcher/></div></header>
    <main inert={mobileNav} id="main-content" className="main-content" ref={mainRef} tabIndex={-1}><div className="demo-ribbon"><span><span className="demo-dot"/>{t('INTERACTIVE MVP','เดโม MVP')}<span className="ribbon-divider">/</span>{store.state==='saved'?t(`Synthetic data · saved to a file on this computer · revision ${store.revision}`,`ข้อมูลจำลอง · บันทึกเป็นไฟล์ในเครื่องนี้ · รุ่น ${store.revision}`):store.state==='offline'?t('Synthetic data · NOT SAVED: local store unreachable, changes stay in this tab','ข้อมูลจำลอง · ยังไม่บันทึก: เชื่อมต่อที่เก็บข้อมูลไม่ได้ การแก้ไขอยู่เฉพาะในแท็บนี้'):t('Synthetic data · loading saved formulas…','ข้อมูลจำลอง · กำลังโหลดสูตรที่บันทึกไว้…')}</span><div className="ribbon-actions"><Dropdown className="preview-select" aria-label={t('Preview display state','ทดลองสถานะหน้าจอ')} value={viewState} onValueChange={value=>setViewState(value as 'ready'|'loading'|'error')}><option value="ready">{t('Ready view','หน้าจอพร้อม')}</option><option value="loading">{t('Loading preview','ตัวอย่างกำลังโหลด')}</option><option value="error">{t('Error preview','ตัวอย่างข้อผิดพลาด')}</option></Dropdown><button onClick={()=>setTourInfo(true)}>{t('What you can try','ลองอะไรได้บ้าง')}<Icon name="info" size={14}/></button></div></div>
      {viewState==='ready'&&presenter&&<PresentationGuide/>}
      <div className="page-content" key={epoch} hidden={viewState!=='ready'}>{navItems.some(item=>item.page===page&&item.group==='roadmap')&&<Notice tone="amber">{t('Roadmap preview. This page is not part of the alpha build: it shows where the product goes next, with invented data and no working backend. See scope-lock.md.','ตัวอย่างแผนงาน หน้านี้ไม่อยู่ในงานรอบอัลฟา ใช้แสดงทิศทางของผลิตภัณฑ์ในอนาคต ด้วยข้อมูลสมมติและยังไม่มีระบบหลังบ้าน ดู scope-lock.md')}</Notice>}
        <div hidden={page!=='dashboard'}><Dashboard/></div>
        {can(role,'read')&&<><div hidden={page!=='formulas'}><FormulaLibrary/></div><div hidden={page!=='editor'}><FormulaEditor key={`${selectedId}-${editorEpoch}`}/></div><div hidden={page!=='lab'}><LabPage/></div><div hidden={page!=='compliance'}><CompliancePage/></div>{role==='system_admin'&&<div hidden={page!=='references'}><ReferenceDataPage/></div>}</>}
        <div hidden={page!=='account'}><AccountPage/></div>
        <div hidden={page!=='admin'}><AdminPage/></div>
        <div hidden={page!=='tutorial'}><TutorialPage/></div><div hidden={page!=='public'}><PublicPage/></div><div hidden={page!=='auth'}><AuthPage/></div>
      </div>
      {viewState!=='ready'&&<Panel className="request-preview">{viewState==='loading'?<><span className="empty-icon"><Icon name="clock" size={28}/></span><h2>{t('Loading · UI preview','กำลังโหลด · ตัวอย่างหน้าจอ')}</h2><p className="muted">{t('This is a deterministic loading illustration. No request is running.','ตัวอย่างสถานะกำลังโหลด ไม่มีการเรียกบริการจริง')}</p><div className="skeleton-lines" aria-hidden="true"><i/><i/><i/></div><button className="button secondary" onClick={()=>setViewState('ready')}>{t('Return to ready view','กลับหน้าจอพร้อม')}</button></>:<><span className="empty-icon error"><Icon name="alert" size={28}/></span><h2>{t('Could not load this view','โหลดหน้านี้ไม่สำเร็จ')}</h2><p className="muted">{t('Simulated request error. Records are hidden in this preview. Retry returns to the synthetic ready view.','จำลองข้อผิดพลาด ไม่มีการแสดงข้อมูลในสถานะนี้ ลองใหม่เพื่อกลับหน้าจอตัวอย่าง')}</p><button className="button primary" onClick={()=>setViewState('ready')}><Icon name="refresh" size={16}/>{t('Retry demo view','ลองเปิดเดโมใหม่')}</button></>}</Panel>}<footer className="page-footer"><span>AI PERFUMERY ENGINE <span className="footer-dot">·</span> MVP 0–5 <button type="button" className="presenter-switch" aria-pressed={presenter} onClick={togglePresenter} title={t('Presenter notes','โน้ตสำหรับนำเสนอ')}>{presenter?t('Notes on','โน้ต: เปิด'):t('Notes','โน้ต')}</button><button type="button" className="presenter-switch" aria-pressed={roadmap} onClick={toggleRoadmap} title={t('Roadmap preview pages','หน้าตัวอย่างแผนงาน')}>{roadmap?t('Roadmap on','แผนงาน: เปิด'):t('Roadmap','แผนงาน')}</button></span><span>{t('Synthetic prototype · no production service connected','ต้นแบบจำลอง · ยังไม่ได้เชื่อมบริการจริง')}</span></footer>
    </main>
    {tip&&<button className="static-helper" aria-label={t('Dismiss static tip','ปิดคำแนะนำ')} onClick={()=>setTip(false)}><Icon name="spark" size={16}/><span>{t('Tip: edits create a new version.','เคล็ดลับ: บันทึกการแก้ไขเป็นเวอร์ชันใหม่')}</span><Icon name="close" size={13}/></button>}
    <div className="toast-region" role="status" aria-live="polite">{toast&&<div className="toast"><Icon name="check" size={18}/><span>{toast}</span><button className="icon-button" aria-label={t('Dismiss message','ปิดข้อความ')} onClick={()=>setToast('')}><Icon name="close" size={16}/></button></div>}</div>
    <Modal open={!!pendingAction} onClose={()=>setPendingAction(null)} title={t('Leave unsaved changes?','ออกโดยไม่บันทึกการแก้ไขหรือไม่?')}><p className="muted">{t('Your saved version stays intact. Unsaved editor and what-if inputs will be discarded.','เวอร์ชันที่บันทึกแล้วคงเดิม แต่การแก้ไขและข้อมูล What-if ที่ยังไม่บันทึกจะถูกทิ้ง')}</p><div className="modal-actions"><button className="button secondary" onClick={()=>setPendingAction(null)}>{t('Keep editing','แก้ไขต่อ')}</button><button className="button danger" onClick={()=>{const action=pendingAction;setPendingAction(null);setDirty(false);setEditorEpoch(x=>x+1);action?.();}}>{t('Discard & continue','ทิ้งการแก้ไขและดำเนินการต่อ')}</button></div></Modal>
    <Modal open={tourInfo} onClose={()=>setTourInfo(false)} title={t('A complete MVP walkthrough','สาธิตขั้นตอนงาน MVP ครบทุกส่วน')}><div className="stack"><p className="muted">{t('Built around the approved scope, using only invented records.','สร้างตามสโคปที่อนุมัติ โดยใช้ข้อมูลที่แต่งขึ้นทั้งหมด')}</p><ol className="tour-list"><li>{t('Edit a formula, save an immutable version, and try a separate what-if.','แก้ไขสูตร บันทึกเวอร์ชันที่แก้ไขไม่ได้ และลอง What-if แยกต่างหาก')}</li><li>{t('Inspect sample charts, freshness and source evidence.','ดูกราฟตัวอย่าง ความเป็นปัจจุบันของผล และหลักฐานจากแหล่งข้อมูล')}</li><li>{t('Create a demo batch, select an instrument, and record/reweigh.','สร้างแบตช์จำลอง เลือกเครื่องมือ แล้วบันทึกผลชั่งหรือชั่งซ้ำ')}</li><li>{t('Explore document states, account rights, and the guided tutorial.','ลองสถานะเอกสาร สิทธิ์บัญชี และบทสอน')}</li><li>{t('Switch to an admin persona to inspect scoped role/log controls.','เปลี่ยนเป็นบทบาทผู้ดูแลเพื่อดูการจัดการบทบาทและบันทึกการเข้าถึงตามขอบเขต')}</li></ol><Notice>{t('Chemistry, legal conclusions, authentication, files and permissions are simulated. No Go API or PostgreSQL is connected.','ผลเคมี ข้อกฎหมาย การยืนยันตัวตน ไฟล์ และสิทธิ์เป็นการจำลอง ยังไม่ได้เชื่อม Go API หรือ PostgreSQL')}</Notice><button className="button primary" onClick={()=>setTourInfo(false)}>{t('Got it','เข้าใจแล้ว')}</button></div></Modal>
  </div></DemoContext>;
}
function Dashboard(){
  const {role,t,navigate,formulas,selectFormula}=useDemo();
  if(role==='pending')return <div className="pending-page"><span className="empty-icon"><Icon name="lock" size={30}/></span><Badge tone="amber">{t('Pending access','รอสิทธิ์ใช้งาน')}</Badge><h1>{t('Your workspace is almost ready.','พื้นที่ทำงานของคุณกำลังเตรียมพร้อม')}</h1><p>{t('This demo persona has no laboratory role. Explore your account and the synthetic tutorial while access is pending.','ผู้ใช้จำลองนี้ยังไม่มีบทบาทแล็บ ระหว่างรอสิทธิ์ใช้งาน ดูบัญชีของคุณและลองบทสอนที่ใช้ข้อมูลจำลองได้')}</p><div className="row"><button className="button primary" onClick={()=>navigate('tutorial')}>{t('Explore the tutorial','ทดลองบทสอน')}<Icon name="arrow" size={16}/></button><button className="button secondary" onClick={()=>navigate('account')}>{t('My account','บัญชีของฉัน')}</button></div></div>;
  return <><div className="overview-hero"><div className="hero-copy"><div className="eyebrow">{t('GOOD MORNING, DEMO PERFUMER','สวัสดี นักปรุงน้ำหอมจำลอง')}</div><h1>{t('A little clarity in','เติมความชัดเจนให้')}<br/><em>{t('every blend.','ทุกสูตรของคุณ')}</em></h1><p>{t('From a first idea to a traceable laboratory record. Everything your next study needs, in one place.','จากไอเดียแรกสู่บันทึกแล็บที่ตรวจสอบได้ รวมงานที่ต้องใช้ในพื้นที่เดียว')}</p><button className="button primary" onClick={()=>navigate('formulas')}>{t('Open formula library','เปิดคลังสูตร')}<Icon name="arrow" size={17}/></button></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="bottle"><div className="bottle-cap"/><div className="bottle-neck"/><div className="bottle-body"><div className="bottle-label"><span>{t('ATELIER','ห้องปรุงน้ำหอม')}</span><strong>01</strong><small>{t('FRAGRANCE STUDY','สูตรศึกษา')}</small></div></div></div><span className="art-caption">{t('AN IDEA, TAKING SHAPE.','ไอเดียที่กำลังเป็นรูปเป็นร่าง')}</span></div></div>
  <div className="overview-stats"><Panel><span className="stat-icon"><Icon name="flask"/></span><div><span className="small muted">{t('Saved formulas','สูตรที่บันทึก')}</span><strong>{formulas.length.toString().padStart(2,'0')}</strong></div><Badge tone="purple">{t('Demo','จำลอง')}</Badge></Panel><Panel><span className="stat-icon green"><Icon name="layers"/></span><div><span className="small muted">{t('Lab workflow','ขั้นตอนแล็บ')}</span><strong>{t('Ready to explore','พร้อมทดลอง')}</strong></div><button className="icon-button" aria-label={t('Open lab','เปิดแล็บ')} onClick={()=>navigate('lab')}><Icon name="arrow"/></button></Panel><Panel><span className="stat-icon amber"><Icon name="shield"/></span><div><span className="small muted">{t('Scientific & legal data','ข้อมูลเคมีและข้อกำหนด')}</span><strong>{t('Not connected','ยังไม่เชื่อมต่อ')}</strong></div></Panel></div>
  <div className="overview-bottom"><Panel><div className="panel-heading"><div><h2>{t('Pick up where you left off','สูตรล่าสุด')}</h2><p className="small muted">{t('Synthetic studies in Demo Lab A','สูตรจำลองใน Demo Lab A')}</p></div><button className="text-button" onClick={()=>navigate('formulas')}>{t('View all','ดูทั้งหมด')}<Icon name="arrow" size={16}/></button></div><div className="recent-list">{formulas.slice(0,4).map((f,i)=><button className="recent-row" key={f.id} onClick={()=>selectFormula(f.id)}><span className={`formula-tile tile-${i%3}`}><Icon name="flask" size={22}/></span><span><strong>{f.name}</strong><small>{f.code} <span>·</span> {f.versions.length} {t('versions','เวอร์ชัน')}</small></span><Badge tone="neutral">v{f.versions.at(-1)?.number}</Badge><Icon name="arrow" size={18}/></button>)}</div></Panel><Panel className="next-step"><div className="eyebrow">{t('A GOOD NEXT STEP','ขั้นตอนถัดไป')}</div><span className="next-step-icon"><Icon name="book" size={26}/></span><h2>{t('Make your first lab record.','ลองบันทึกการชั่งครั้งแรก')}</h2><p className="muted">{t('Pin a saved version, choose an instrument and explore weighing states with a sample batch.','เลือกเวอร์ชันสูตรและเครื่องมือ แล้วลองสถานะการชั่งกับแบตช์ตัวอย่าง')}</p><button className="button secondary" onClick={()=>navigate('lab')}>{t('Explore the lab','ลองพื้นที่แล็บ')}<Icon name="arrow" size={17}/></button><div className="small muted next-note">{t('No real measurements are recorded.','ไม่มีการบันทึกการชั่งจริง')}</div></Panel></div></>;
}
