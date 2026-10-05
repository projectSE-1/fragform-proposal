// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useContext, useEffect, useRef, useId} from 'react';
import type {ReactNode} from 'react';
import {DemoContext} from '@/lib/demo-context';
export function Icon({name, size=20, className=''}:{name:string;size?:number;className?:string}) {
  const paths:Record<string,ReactNode> = {
    grid:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    flask:<><path d="M9 3h6M10 3v6L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9V3M7.5 14h9"/><path d="M9 17h1m4 1h1"/></>,
    layers:<><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></>,
    shield:<><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
    book:<><path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1v15Z"/></>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    users:<><circle cx="9" cy="8" r="3.5"/><path d="M2 21v-2a7 7 0 0 1 14 0v2m1-16a3.5 3.5 0 0 1 0 7m2 4a5 5 0 0 1 3 5"/></>,
    spark:<><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></>,
    plus:<path d="M12 5v14M5 12h14"/>,
    arrow:<path d="m9 6 6 6-6 6"/>,
    back:<path d="M20 12H4m6-6-6 6 6 6"/>,
    down:<path d="m6 9 6 6 6-6"/>,
    check:<path d="m5 12 4 4L19 6"/>,
    search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    close:<path d="m6 6 12 12M18 6 6 18"/>,
    menu:<path d="M4 6h16M4 12h16M4 18h16"/>,
    download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
    upload:<><path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chart:<><path d="M4 3v18h17M8 16v-5m5 5V6m5 10V9"/></>,
    info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></>,
    alert:<><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3v.1"/></>,
    lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></>,
    trash:<><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></>,
    file:<><path d="M14 3H5v18h14V8l-5-5Z M14 3v5h5M8 12h8M8 16h5"/></>,
    refresh:<><path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/></>,
    globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18"/></>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon:<path d="M20.8 13.1A9 9 0 0 1 10.9 3.2a9 9 0 1 0 9.9 9.9Z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name]||paths.file}</svg>;
}
// Thai month abbreviations for fixture date labels such as "04 Oct 2026" or "02 Oct", applied at render time only.
// The year stays CE; records, filters and downloads keep the English label. Other labels return undefined.
const monthsTh:Record<string,string>={Jan:'ม.ค.',Feb:'ก.พ.',Mar:'มี.ค.',Apr:'เม.ย.',May:'พ.ค.',Jun:'มิ.ย.',Jul:'ก.ค.',Aug:'ส.ค.',Sep:'ก.ย.',Oct:'ต.ค.',Nov:'พ.ย.',Dec:'ธ.ค.'};
export function thaiFixtureDate(label:string):string|undefined {
  const match=/^(\d{1,2}) ([A-Z][a-z]{2})( \d{4})?$/.exec(label);
  return match&&monthsTh[match[2]]?`${match[1]} ${monthsTh[match[2]]}${match[3]??''}`:undefined;
}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:'neutral'|'purple'|'green'|'amber'|'red'}) {return <span className={`badge badge-${tone}`}>{children}</span>;}
export function Panel({children,className=''}:{children:ReactNode;className?:string}) {return <section className={`panel ${className}`}>{children}</section>;}
export function PageHeader({eyebrow,title,description,actions}:{eyebrow?:string;title:string;description?:string;actions?:ReactNode}) {return <div className="page-heading"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description&&<p className="muted">{description}</p>}</div>{actions&&<div className="heading-actions">{actions}</div>}</div>;}
export function EmptyState({title,description,action}:{title:string;description:string;action?:ReactNode}) {return <div className="empty-state"><span className="empty-icon"><Icon name="layers" size={28}/></span><h3>{title}</h3><p>{description}</p>{action}</div>;}
export function Notice({children,tone='neutral'}:{children:ReactNode;tone?:'neutral'|'amber'|'red'|'green'}) {return <div className={`notice notice-${tone}`}><Icon name={tone==='red'||tone==='amber'?'alert':'info'} size={18}/><div>{children}</div></div>;}
export function Modal({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null);
  const titleId=useId();
  // Optional so the dialog still renders (in English) outside the demo provider.
  const t=useContext(DemoContext)?.t??((english:string)=>english);
  useEffect(()=>{const el=ref.current;if(!el)return;if(open&&!el.open)el.showModal();else if(!open&&el.open)el.close();},[open]);
  return <dialog ref={ref} className="modal" aria-labelledby={titleId} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label={t('Close dialog','ปิดหน้าต่าง')} onClick={onClose}><Icon name="close"/></button></div>{open&&children}</dialog>;
}
