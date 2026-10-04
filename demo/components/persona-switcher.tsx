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

export function PersonaSwitcher() {
  const {role, setRole, t} = useDemo();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeahead = useRef({text: '', time: 0});
  const menuId = useId();
  const selected = personas.findIndex(persona => persona.role === role);
  const persona = personas[selected];

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
  }, [open, active]);

  function show(index = selected) {
    typeahead.current = {text: '', time: 0};
    setActive(index);
    setOpen(true);
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
    if (event.key === 'ArrowDown') next = (active + 1) % personas.length;
    else if (event.key === 'ArrowUp') next = (active + personas.length - 1) % personas.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = personas.length - 1;
    else if (event.key === 'Escape') {
      event.preventDefault();
      closeWithFocus();
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
      for (let offset = 1; offset <= personas.length; offset++) {
        const index = (active + offset) % personas.length;
        if (personas[index].name.toLowerCase().startsWith(query)) {next = index; break;}
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
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
      onClick={() => open ? closeWithFocus() : show()}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); show(event.key === 'ArrowDown' ? 0 : personas.length - 1);
        }
      }}>
      <span className="persona-trigger-icon"><Icon name={persona.icon} size={18}/></span>
      <span className="persona-trigger-copy"><span className="persona-trigger-label">{t('DEMO PERSONA', 'บทบาทจำลอง')}</span><strong>{persona.name}</strong></span>
      <Icon name="down" size={15} className="persona-chevron"/>
    </button>
    {open && <div className="persona-popover">
      <div className="persona-popover-heading"><div><strong>{t('Explore as a…', 'ทดลองในบทบาท…')}</strong><p>{t('Choose a view of the workspace.', 'เลือกมุมมองของพื้นที่ทำงาน')}</p></div><span className="persona-demo-badge">DEMO</span></div>
      <div id={menuId} role="menu" aria-label={t('Demo role', 'เลือกบทบาทจำลอง')} className="persona-options" onKeyDown={onKeyDown}>
        {personas.map((item, index) => <button type="button" role="menuitemradio" aria-checked={item.role === role}
          aria-label={item.name} aria-describedby={`${menuId}-${item.role}`} tabIndex={active === index ? 0 : -1}
          ref={element => {optionRefs.current[index] = element;}} key={item.role}
          className={`persona-option ${item.role === role ? 'is-selected' : ''} ${index === 5 || index === 7 ? 'starts-group' : ''}`}
          onFocus={() => setActive(index)} onClick={() => choose(item.role)}>
          <span className="persona-option-icon"><Icon name={item.icon} size={18}/></span>
          <span className="persona-option-copy"><strong>{item.name}</strong><small id={`${menuId}-${item.role}`}>{t(item.en, item.th)}</small></span>
          <span className="persona-option-check" aria-hidden="true">{item.role === role && <Icon name="check" size={14}/>}</span>
        </button>)}
      </div>
      <div className="persona-popover-footer"><span className="persona-footer-dot"/>{t('Preview only · no real access changes', 'มุมมองจำลอง · ไม่เปลี่ยนสิทธิ์จริง')}</div>
    </div>}
  </div>;
}
