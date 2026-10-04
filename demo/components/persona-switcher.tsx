// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';

import {useEffect, useId, useRef, useState} from 'react';
import type {KeyboardEvent} from 'react';
import {useDemo} from '@/lib/demo-context';
import type {Role} from '@/lib/model';
import {Icon} from './ui';
import './persona-switcher.css';

const personas: {role: Role; name: string; icon: string; en: string; th: string}[] = [
  {role: 'formulator', name: 'Formulator', icon: 'flask', en: 'Formula & lab workflows', th: 'งานสูตรและการชั่งในแล็บ'},
  {role: 'data_curator', name: 'Data Curator', icon: 'layers', en: 'Documents & reference review', th: 'เอกสารและการดูข้อมูลอ้างอิง'},
  {role: 'safety_assessor', name: 'Safety Assessor', icon: 'shield', en: 'Formula & evidence review', th: 'ดูสูตรและหลักฐานประกอบ'},
  {role: 'legal_reviewer', name: 'Legal Reviewer', icon: 'file', en: 'Documents & compliance review', th: 'ดูเอกสารและข้อกำหนด'},
  {role: 'approver', name: 'Approver', icon: 'check', en: 'Read-only formula review', th: 'ดูสูตรโดยไม่แก้ไข'},
  {role: 'org_admin', name: 'Org Admin', icon: 'users', en: 'Workspace & member management', th: 'จัดการพื้นที่ทำงานและสมาชิก'},
  {role: 'system_admin', name: 'System Admin', icon: 'lock', en: 'Administration walkthrough', th: 'ทดลองขั้นตอนผู้ดูแลระบบ'},
  {role: 'pending', name: 'Pending access', icon: 'clock', en: 'Account & guided tutorial', th: 'บัญชีและบทสอนเริ่มต้น'},
];

const groups = [
  {name: 'Internal Team', icon: 'flask', en: 'Perfumer, R&D & lab · explore role permissions', th: 'นักปรุงน้ำหอม, R&D และแล็บ · เลือกสิทธิ์ย่อย'},
  {name: 'SaaS Workspace', icon: 'layers', en: 'A separate workspace for each external organisation', th: 'พื้นที่ทำงานแยกสำหรับแต่ละองค์กรภายนอก'},
  {name: 'Client Portal', icon: 'users', en: 'Clients view their projects and shared documents', th: 'ลูกค้าดูโปรเจกต์และเอกสารที่แชร์ให้'},
];

export function PersonaSwitcher() {
  const {role, setRole, t} = useDemo();
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<'groups' | 'internal'>('groups');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeahead = useRef({text: '', time: 0});
  const menuId = useId();
  const internalMenuId = `${menuId}-internal`;
  const triggerContextId = `${menuId}-context`;
  const selected = personas.findIndex(persona => persona.role === role);
  const persona = personas[selected];
  const names = level === 'groups' ? groups.map(group => group.name) : ['Back', ...personas.map(item => item.name)];

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const option = optionRefs.current[active];
    option?.focus({preventScroll: true});
    option?.scrollIntoView({block: 'nearest'});
  }, [open, active, level]);

  function show(index = 0) {
    typeahead.current = {text: '', time: 0};
    setLevel('groups');
    setActive(index);
    setOpen(true);
  }

  function showInternal() {
    typeahead.current = {text: '', time: 0};
    setLevel('internal');
    setActive(selected + 1);
  }

  function showGroups() {
    typeahead.current = {text: '', time: 0};
    setLevel('groups');
    setActive(0);
  }

  function closeWithFocus() {
    setOpen(false);
    triggerRef.current?.focus({preventScroll: true});
  }

  function choose(next: Role) {
    // Focus before the guarded role change; a discard dialog must retain its own focus.
    closeWithFocus();
    if (next !== role) setRole(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next: number | undefined;
    if (event.key === 'ArrowDown') next = (active + 1) % names.length;
    else if (event.key === 'ArrowUp') next = (active + names.length - 1) % names.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = names.length - 1;
    else if (event.key === 'ArrowRight' && level === 'groups' && active === 0) {
      event.preventDefault(); showInternal(); return;
    } else if (event.key === 'ArrowLeft' && level === 'internal') {
      event.preventDefault(); showGroups(); return;
    }
    else if (event.key === 'Escape') {
      event.preventDefault();
      if (level === 'internal') showGroups();
      else closeWithFocus();
      return;
    } else if (event.key === 'Tab') {
      // Let Tab leave the popup naturally; focus-out then removes it.
      return;
    } else if (event.key.length === 1 && event.key !== ' ' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const now = Date.now();
      const previous = now - typeahead.current.time < 600 ? typeahead.current.text : '';
      const query = previous && [...previous].every(char => char === event.key.toLowerCase())
        ? event.key.toLowerCase() : previous + event.key.toLowerCase();
      typeahead.current = {text: query, time: now};
      for (let offset = 1; offset <= names.length; offset++) {
        const index = (active + offset) % names.length;
        if (names[index].toLowerCase().startsWith(query)) {next = index; break;}
      }
    }
    if (next !== undefined) {event.preventDefault(); setActive(next);}
  }

  return <div ref={rootRef} className="persona-switcher" onKeyUp={event => {
    // Shift+Tab lands on the trigger inside this root; close after native focus movement.
    if (event.key === 'Tab') setOpen(false);
  }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <button ref={triggerRef} type="button" className={`persona-trigger ${open ? 'is-open' : ''}`}
      aria-label={t(`Demo role: ${persona.name}`, `บทบาทจำลอง: ${persona.name}`)}
      aria-describedby={triggerContextId} title={`Internal Team · ${persona.name}`}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? level === 'groups' ? menuId : internalMenuId : undefined}
      onClick={() => open ? closeWithFocus() : show()}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); show(event.key === 'ArrowDown' ? 0 : groups.length - 1);
        }
      }}>
      <span className="persona-trigger-icon"><Icon name={persona.icon} size={18}/></span>
      <span className="persona-trigger-copy"><span id={triggerContextId} className="persona-trigger-label">INTERNAL TEAM</span><strong>{persona.name}</strong></span>
      <Icon name="down" size={15} className="persona-chevron"/>
    </button>
    {open && <div className="persona-popover">
      <div className="persona-popover-heading"><div><strong>{level === 'groups' ? t('User groups', 'กลุ่มผู้ใช้งาน') : 'Internal Team'}</strong><p>{level === 'groups' ? t('Three main groups. Permissions live inside.', '3 กลุ่มหลัก · แยกสิทธิ์ย่อยภายในแต่ละกลุ่ม') : t('Choose a permission profile for this demo.', 'เลือกสิทธิ์ย่อยสำหรับทดลองเดโม')}</p></div><span className="persona-demo-badge">DEMO</span></div>
      {level === 'groups' ? <div id={menuId} role="menu" aria-label={t('Demo user groups', 'กลุ่มผู้ใช้งานจำลอง')} className="persona-options persona-group-options" onKeyDown={onKeyDown}>
        {groups.map((group, index) => <button type="button" role="menuitem" key={group.name}
          aria-label={group.name} aria-describedby={`${menuId}-group-${index}`}
          aria-disabled={index > 0 ? true : undefined} aria-haspopup={index === 0 ? 'menu' : undefined}
          aria-expanded={index === 0 ? false : undefined}
          tabIndex={active === index ? 0 : -1} ref={element => {optionRefs.current[index] = element;}}
          className={`persona-option persona-group-option ${index === 0 ? 'is-selected' : 'is-planned'}`}
          onFocus={() => setActive(index)} onClick={() => {if (index === 0) showInternal();}}>
          <span className="persona-option-icon"><Icon name={group.icon} size={18}/></span>
          <span className="persona-option-copy"><strong>{group.name}</strong><span id={`${menuId}-group-${index}`}><small>{t(group.en, group.th)}</small>{index > 0 ? <span className="persona-planned-badge">{t('Planned · not available in this MVP', 'วางแผนไว้ · ยังไม่เปิดใน MVP นี้')}</span> : <small className="persona-current-profile">{t('Current profile', 'สิทธิ์ปัจจุบัน')}: {persona.name}</small>}</span></span>
          {index === 0 && <Icon name="arrow" size={16} className="persona-group-arrow"/>}
        </button>)}
      </div> : <div id={internalMenuId} role="menu" aria-label={t('Internal Team permissions', 'สิทธิ์ย่อยของ Internal Team')} className="persona-options" onKeyDown={onKeyDown}>
        <button type="button" role="menuitem" className="persona-back" tabIndex={active === 0 ? 0 : -1}
          ref={element => {optionRefs.current[0] = element;}} onFocus={() => setActive(0)} onClick={showGroups}>
          <span className="persona-back-icon" aria-hidden="true"><Icon name="arrow" size={16} className="persona-back-chevron"/></span>
          <span>{t('Back to user groups', 'กลับไป 3 กลุ่มหลัก')}</span>
        </button>
        {personas.map((item, index) => <div role="presentation" key={item.role}>
          {(index === 0 || index === 6 || index === 7) && <div className="persona-section-label" role="presentation">{index === 0 ? t('Team permission profiles', 'สิทธิ์ย่อยของทีมงาน') : index === 6 ? t('System administration', 'การดูแลระบบ') : t('Account status · not a role', 'สถานะบัญชี · ไม่ใช่บทบาท')}</div>}
          <button type="button" role="menuitemradio" aria-checked={item.role === role}
            aria-label={item.name} aria-describedby={`${menuId}-${item.role}`} tabIndex={active === index + 1 ? 0 : -1}
            ref={element => {optionRefs.current[index + 1] = element;}}
            className={`persona-option ${item.role === role ? 'is-selected' : ''}`}
            onFocus={() => setActive(index + 1)} onClick={() => choose(item.role)}>
            <span className="persona-option-icon"><Icon name={item.icon} size={18}/></span>
            <span className="persona-option-copy"><strong>{item.name}</strong><small id={`${menuId}-${item.role}`}>{item.role === 'pending' ? t('Awaiting access · account & guided tutorial only', 'รอสิทธิ์เข้าใช้ · เฉพาะบัญชีและบทสอนเริ่มต้น') : t(item.en, item.th)}</small></span>
            <span className="persona-option-check" aria-hidden="true">{item.role === role && <Icon name="check" size={14}/>}</span>
          </button>
        </div>)}
      </div>}
      <div className="persona-popover-footer"><span className="persona-footer-dot"/>{t('Preview only · no real access changes', 'มุมมองจำลอง · ไม่เปลี่ยนสิทธิ์จริง')}</div>
    </div>}
  </div>;
}
