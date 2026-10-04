// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {DemoContext} from '@/lib/demo-context';
import {initialFormulas} from '@/lib/model';
import type {Page} from '@/lib/model';
import {Icon, Modal, Notice, Panel} from './ui';
import {FormulaEditor, FormulaLibrary} from './formula-pages';
import {Dropdown} from './dropdown';

const navItems:{page:Page;icon:string;en:string;th:string}[]=[
  {page:'formulas',icon:'flask',en:'Formula library',th:'คลังสูตร'},
  {page:'editor',icon:'layers',en:'Formula workspace',th:'พื้นที่สูตร'},
];

export default function DemoApp(){
  const [page,setPage]=useState<Page>('editor');
  const [viewState,setViewState]=useState<'ready'|'loading'|'error'>('ready');
  const [locale,setLocale]=useState<'en'|'th'>('en');
  const [formulas,setFormulas]=useState(initialFormulas);
  const [selectedId,setSelectedId]=useState('formula-1');
  const [dirty,setDirtyState]=useState(false);
  const dirtyRef=useRef(false);
  const setDirty=useCallback((value:boolean)=>{dirtyRef.current=value;setDirtyState(value);},[]);
  const [mobileNav,setMobileNav]=useState(false);
  const [pendingAction,setPendingAction]=useState<(()=>void)|null>(null);
  const [toast,setToast]=useState('');
  const [epoch,setEpoch]=useState(0);
  const [editorEpoch,setEditorEpoch]=useState(0);
  const [scopeInfo,setScopeInfo]=useState(false);
  const toastTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const t=useCallback((en:string,th:string)=>locale==='th'?th:en,[locale]);
  const mainRef=useRef<HTMLElement>(null);
  const sidebarRef=useRef<HTMLElement>(null);
  const menuRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{document.documentElement.lang=locale;},[locale]);
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
  function guarded(action:()=>void){if(dirtyRef.current){setPendingAction(()=>action);}else action();}
  function navigate(target:Page){if(target===page)return;guarded(()=>{setPage(target);setMobileNav(false);setDirty(false);requestAnimationFrame(()=>{mainRef.current?.focus();window.scrollTo({top:0});});});}
  function selectFormula(id:string){guarded(()=>{setSelectedId(id);setEditorEpoch(x=>x+1);setPage('editor');setDirty(false);setMobileNav(false);requestAnimationFrame(()=>mainRef.current?.focus());});}
  function reset(){guarded(()=>{setFormulas(initialFormulas());setSelectedId('formula-1');setPage('editor');setDirty(false);setEpoch(x=>x+1);notify(t('Demo reset. All changes were held only in this session.','รีเซ็ตเดโมแล้ว ข้อมูลที่แก้ไขอยู่เฉพาะในเซสชันนี้'));});}
  const current=navItems.find(x=>x.page===page);
  const context={page,navigate,locale,t,formulas,setFormulas,selectedId,selectFormula,notify,reset,dirty,setDirty};
  return <DemoContext value={context}><a href="#main-content" className="skip-link">{t('Skip to content','ข้ามไปเนื้อหา')}</a><div className="app-shell">
    {mobileNav&&<button className="nav-scrim" aria-label={t('Close navigation','ปิดเมนู')} onClick={()=>setMobileNav(false)}/>}
    <aside role={mobileNav?'dialog':undefined} aria-modal={mobileNav?true:undefined} ref={sidebarRef} className={`sidebar ${mobileNav?'sidebar-open':''}`} aria-label={t('Main navigation','เมนูหลัก')}>
      <a className="brand" href="#" onClick={e=>{e.preventDefault();navigate('formulas');}}><span className="brand-mark"><Icon name="flask" size={25}/></span><span><strong>AI Perfumery Engine</strong><small>{t('CALCULATION DEMO','เดโมส่วนคำนวณ')}</small></span></a>
      <div className="org-card"><span className="org-avatar">A</span><span><strong>Demo Lab A</strong><small>{t('Synthetic workspace','พื้นที่ทำงานจำลอง')}</small></span><Icon name="lock" size={15}/></div>
      <nav><div className="nav-group"><div className="nav-label">{t('WORKSPACE','พื้นที่ทำงาน')}</div>{navItems.map(item=><button key={item.page} className={`nav-item ${page===item.page?'nav-active':''}`} aria-current={page===item.page?'page':undefined} onClick={()=>navigate(item.page)}><Icon name={item.icon} size={19}/>{t(item.en,item.th)}{item.page==='formulas'&&<span className="nav-count">{formulas.length}</span>}</button>)}</div></nav>
      <div className="sidebar-bottom"><div className="sidebar-help"><span className="help-mark"><Icon name="info"/></span><h3>{t('This demo shows one workflow','เดโมนี้แสดงงานเดียว')}</h3><p>{t('Open a formula, change a quantity, see the declared totals and the missing states.','เปิดสูตร แก้ปริมาณ แล้วดูผลรวมที่ประกาศและสถานะข้อมูลที่ขาด')}</p><button className="button secondary full-width" onClick={()=>setScopeInfo(true)}>{t('What is not here','สิ่งที่ยังไม่มีในเดโม')}<Icon name="arrow" size={16}/></button></div><div className="sidebar-footnote">ALPHA SLICE <span>W2</span></div></div>
    </aside>
    <header inert={mobileNav} className="topbar"><div className="topbar-left"><button ref={menuRef} className="icon-button mobile-menu" aria-label={t('Open navigation','เปิดเมนู')} aria-expanded={mobileNav} onClick={()=>setMobileNav(!mobileNav)}><Icon name="menu"/></button><span className="breadcrumb">{t('Workspace','พื้นที่ทำงาน')}<span>/</span><strong>{current?t(current.en,current.th):''}</strong></span></div><div className="topbar-actions"><button className="locale-button" onClick={()=>setLocale(locale==='en'?'th':'en')} aria-label={t('Switch language to Thai','เปลี่ยนภาษาเป็นอังกฤษ')}><Icon name="globe" size={15}/>{locale==='en'?'EN':'TH'}</button><button className="icon-button reset-button" aria-label={t('Reset demo','รีเซ็ตเดโม')} title={t('Reset demo','รีเซ็ตเดโม')} onClick={reset}><Icon name="refresh" size={18}/></button></div></header>
    <main inert={mobileNav} id="main-content" className="main-content" ref={mainRef} tabIndex={-1}><div className="demo-ribbon"><span><span className="demo-dot"/>{t('CALCULATION DEMO','เดโมส่วนคำนวณ')}<span className="ribbon-divider">/</span>{t('Synthetic data · no chemistry is computed · changes reset on refresh','ข้อมูลจำลอง · ไม่มีการคำนวณเคมีจริง · รีเฟรชแล้วข้อมูลกลับค่าเริ่มต้น')}</span><div className="ribbon-actions"><Dropdown className="preview-select" aria-label={t('Preview display state','ทดลองสถานะหน้าจอ')} value={viewState} onValueChange={value=>setViewState(value as 'ready'|'loading'|'error')}><option value="ready">{t('Ready view','หน้าจอพร้อม')}</option><option value="loading">{t('Loading preview','ตัวอย่างกำลังโหลด')}</option><option value="error">{t('Error preview','ตัวอย่างข้อผิดพลาด')}</option></Dropdown><button onClick={()=>setScopeInfo(true)}>{t('What you can try','ลองอะไรได้บ้าง')}<Icon name="info" size={14}/></button></div></div>
      <div className="page-content" key={epoch} hidden={viewState!=='ready'}>
        <div hidden={page!=='formulas'}><FormulaLibrary/></div>
        <div hidden={page!=='editor'}><FormulaEditor key={`${selectedId}-${editorEpoch}`}/></div>
      </div>
      {viewState!=='ready'&&<Panel className="request-preview">{viewState==='loading'?<><span className="empty-icon"><Icon name="clock" size={28}/></span><h2>{t('Loading · UI preview','กำลังโหลด · ตัวอย่างหน้าจอ')}</h2><p className="muted">{t('This is a deterministic loading illustration. No request is running.','ตัวอย่างสถานะกำลังโหลด ไม่มีการเรียกบริการจริง')}</p><div className="skeleton-lines" aria-hidden="true"><i/><i/><i/></div><button className="button secondary" onClick={()=>setViewState('ready')}>{t('Return to ready view','กลับหน้าจอพร้อม')}</button></>:<><span className="empty-icon error"><Icon name="alert" size={28}/></span><h2>{t('Could not load this view','โหลดหน้านี้ไม่สำเร็จ')}</h2><p className="muted">{t('Simulated request error. Records are hidden in this preview. Retry returns to the synthetic ready view.','จำลองข้อผิดพลาด ไม่มีการแสดงข้อมูลในสถานะนี้ ลองใหม่เพื่อกลับหน้าจอตัวอย่าง')}</p><button className="button primary" onClick={()=>setViewState('ready')}><Icon name="refresh" size={16}/>{t('Retry demo view','ลองเปิดเดโมใหม่')}</button></>}</Panel>}<footer className="page-footer"><span>AI PERFUMERY ENGINE <span className="footer-dot">·</span> {t('ALPHA SLICE','ส่วนที่ทำก่อน')}</span><span>{t('Synthetic prototype · no production service connected','ต้นแบบจำลอง · ยังไม่ได้เชื่อมบริการจริง')}</span></footer>
    </main>
    <div className="toast-region" role="status" aria-live="polite">{toast&&<div className="toast"><Icon name="check" size={18}/><span>{toast}</span><button className="icon-button" aria-label={t('Dismiss message','ปิดข้อความ')} onClick={()=>setToast('')}><Icon name="close" size={16}/></button></div>}</div>
    <Modal open={!!pendingAction} onClose={()=>setPendingAction(null)} title={t('Leave unsaved changes?','ออกโดยไม่บันทึกการแก้ไขหรือไม่?')}><p className="muted">{t('Your saved version stays intact. Unsaved editor and what-if inputs will be discarded.','เวอร์ชันที่บันทึกแล้วคงเดิม แต่การแก้ไขและข้อมูลทดลองที่ยังไม่บันทึกจะถูกทิ้ง')}</p><div className="modal-actions"><button className="button secondary" onClick={()=>setPendingAction(null)}>{t('Keep editing','แก้ไขต่อ')}</button><button className="button danger" onClick={()=>{const action=pendingAction;setPendingAction(null);setDirty(false);setEditorEpoch(x=>x+1);action?.();}}>{t('Discard & continue','ทิ้งการแก้ไขและดำเนินการต่อ')}</button></div></Modal>
    <Modal open={scopeInfo} onClose={()=>setScopeInfo(false)} title={t('What this demo covers','ขอบเขตของเดโมนี้')}><div className="stack"><p className="muted">{t('This is the slice locked for the alpha: the formula and its calculation. Every record is invented.','นี่คือส่วนที่ล็อกไว้สำหรับอัลฟา คือสูตรและการคำนวณ ข้อมูลทั้งหมดเป็นข้อมูลที่แต่งขึ้น')}</p><ol className="tour-list"><li>{t('Open a formula and read its declared composition.','เปิดสูตรและดูส่วนประกอบที่ประกาศไว้')}</li><li>{t('Change a quantity: declared amounts must total exactly 100% and are never normalised for you.','แก้ปริมาณ: ผลรวมต้องเป็น 100% พอดี และระบบจะไม่ปรับให้อัตโนมัติ')}</li><li>{t('Evaluate, and see which inputs are missing rather than a guessed result.','สั่งประเมินผล แล้วดูว่าขาดข้อมูลอะไร แทนที่จะได้ตัวเลขที่เดาขึ้นมา')}</li><li>{t('Save an immutable version; earlier versions never change.','บันทึกเป็นเวอร์ชันใหม่ เวอร์ชันเดิมจะไม่ถูกแก้')}</li></ol><Notice>{t('Not in this demo: sign-in, accounts, roles and team management, the laboratory and weighing workflow, documents, the tutorial, and the evaporation curve. They are in the backlog, not in this build. See scope-lock.md.','ยังไม่มีในเดโมนี้: การเข้าสู่ระบบ บัญชีผู้ใช้ บทบาทและการจัดการทีม งานแล็บและการชั่ง เอกสาร บทสอน และกราฟการระเหย ทั้งหมดอยู่ใน backlog แต่ไม่อยู่ในรอบนี้ ดู scope-lock.md')}</Notice><button className="button primary" onClick={()=>setScopeInfo(false)}>{t('Got it','เข้าใจแล้ว')}</button></div></Modal>
  </div></DemoContext>;
}
