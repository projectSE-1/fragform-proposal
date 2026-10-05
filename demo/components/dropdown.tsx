// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';

import {Children, Fragment, isValidElement, useContext, useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import type {ButtonHTMLAttributes, KeyboardEvent, ReactNode} from 'react';
import {DemoContext} from '@/lib/demo-context';
import {Icon} from './ui';
import './dropdown.css';

type Option = {value: string; label: string; disabled: boolean};
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange' | 'children'> & {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
};

function textContent(children: ReactNode): string {
  return Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    return isValidElement<{children?: ReactNode}>(child) ? textContent(child.props.children) : '';
  }).join('');
}

function readOptions(children: ReactNode): Option[] {
  const options: Option[] = [];
  Children.forEach(children, child => {
    if (!isValidElement<{value?: string | number; label?: string; disabled?: boolean; children?: ReactNode}>(child)) return;
    if (child.type === Fragment) options.push(...readOptions(child.props.children));
    else if (child.type === 'option') {
      const label = child.props.label ?? textContent(child.props.children);
      options.push({value: String(child.props.value ?? textContent(child.props.children)), label, disabled: !!child.props.disabled});
    }
  });
  return options;
}

export function Dropdown({value, onValueChange, children, id, className = '', disabled, style, ...buttonProps}: Props) {
  const options = readOptions(children);
  const selected = options.findIndex(option => option.value === value);
  const usable = options.map((option, index) => option.disabled ? -1 : index).filter(index => index !== -1);
  const unavailable = disabled || !usable.length;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({text: '', time: 0});
  const generatedId = useId();
  const triggerId = id ?? `${generatedId}-trigger`;
  const listId = `${generatedId}-list`;
  // Optional so the control still renders (in English) outside the demo provider.
  const t = useContext(DemoContext)?.t ?? ((english: string) => english);

  function show(index = selected) {
    if (unavailable) return;
    setActive(usable.includes(index) ? index : usable[0]);
    typeahead.current = {text: '', time: 0};
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled || unavailable) return;
    setOpen(false);
    // Focus before callbacks which can open a version/discard dialog.
    triggerRef.current?.focus({preventScroll: true});
    if (option.value !== value) onValueChange(option.value);
  }

  useLayoutEffect(() => {
    if (!open || unavailable) return;
    const trigger = triggerRef.current, popup = popupRef.current;
    if (!trigger || !popup) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 12, gap = 7;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(Math.max(rect.width, 216), viewportWidth - margin * 2);
    const desiredHeight = Math.min(options.length * 44 + 14, 286);
    const below = viewportHeight - rect.bottom - gap - margin;
    const above = rect.top - gap - margin;
    const upward = below < Math.min(desiredHeight, 144) && above > below;
    const height = Math.max(44, Math.min(desiredHeight, upward ? above : below));
    popup.style.width = `${width}px`;
    popup.style.maxHeight = `${height}px`;
    popup.style.left = `${Math.max(margin, Math.min(rect.left, viewportWidth - width - margin))}px`;
    // Keep the shorter menu snug against its trigger when opening upwards.
    popup.style.top = upward ? 'auto' : `${rect.bottom + gap}px`;
    popup.style.bottom = upward ? `${viewportHeight - rect.top + gap}px` : 'auto';
    if (typeof popup.showPopover === 'function' && !popup.matches(':popover-open')) popup.showPopover();
    return () => {if (typeof popup.hidePopover === 'function' && popup.matches(':popover-open')) popup.hidePopover();};
  }, [open, unavailable, options.length]);

  useEffect(() => {
    if (!open) return;
    if (unavailable) {setOpen(false); return;}
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function scrolling(event: Event) {
      if (!(event.target instanceof Node) || !popupRef.current?.contains(event.target)) setOpen(false);
    }
    const resize = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('scroll', scrolling, true);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('scroll', scrolling, true);
      window.removeEventListener('resize', resize);
    };
  }, [open, unavailable]);

  useEffect(() => {
    if (!open) return;
    const popup = popupRef.current;
    const option = popup?.querySelector<HTMLElement>(`[data-option-index="${active}"]`);
    if (!popup || !option) return;
    const menuRect = popup.getBoundingClientRect(), optionRect = option.getBoundingClientRect();
    // Scroll this list only; scrolling an ancestor dialog would dismiss the popup.
    if (optionRect.top < menuRect.top + 6) popup.scrollTop -= menuRect.top + 6 - optionRect.top;
    else if (optionRect.bottom > menuRect.bottom - 6) popup.scrollTop += optionRect.bottom - menuRect.bottom + 6;
  }, [open, active]);

  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (unavailable) return;
    if (event.key === 'Escape' && open) {
      event.preventDefault(); event.stopPropagation(); setOpen(false); return;
    }
    if (event.key === 'Tab') {setOpen(false); return;}
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); open ? choose(active) : show(); return;
    }
    let next: number | undefined;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {show(); return;}
      const position = usable.indexOf(active), delta = event.key === 'ArrowDown' ? 1 : -1;
      next = usable[(position + delta + usable.length) % usable.length];
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); next = event.key === 'Home' ? usable[0] : usable.at(-1);
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const now = Date.now();
      const previous = now - typeahead.current.time < 600 ? typeahead.current.text : '';
      const character = event.key.toLowerCase();
      const query = previous && [...previous].every(char => char === character) ? character : previous + character;
      typeahead.current = {text: query, time: now};
      for (let offset = 1; offset <= options.length; offset++) {
        const index = ((open ? active : selected) + offset + options.length) % options.length;
        if (!options[index].disabled && options[index].label.toLowerCase().startsWith(query)) {next = index; break;}
      }
      if (next !== undefined) event.preventDefault();
    }
    if (next !== undefined) {setActive(next); setOpen(true);}
  }

  return <div ref={rootRef} className={`dropdown ${className}`} style={style}>
    <button {...buttonProps} id={triggerId} ref={triggerRef} type="button" role="combobox"
      aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
      aria-activedescendant={open ? `${listId}-${active}` : undefined} disabled={unavailable}
      className={`dropdown-trigger ${open ? 'is-open' : ''}`} onKeyDown={keyDown}
      onBlur={() => setOpen(false)} onClick={() => open ? setOpen(false) : show()}>
      <span className="dropdown-value">{options[selected]?.label ?? t('Choose an option', 'เลือกตัวเลือก')}</span><Icon name="down" size={16}/>
    </button>
    {open && <div ref={popupRef} id={listId} role="listbox" aria-label={buttonProps['aria-label'] ?? t('Options', 'ตัวเลือก')}
      popover="manual" className="dropdown-popup" onMouseDown={event => event.preventDefault()}>
      {options.map((option, index) => <div key={`${option.value}-${index}`} role="option" id={`${listId}-${index}`}
        aria-selected={option.value === value} aria-disabled={option.disabled || undefined} data-option-index={index}
        className={`dropdown-option ${active === index ? 'is-active' : ''} ${option.value === value ? 'is-selected' : ''}`}
        onMouseMove={() => {if (!option.disabled) setActive(index);}}
        onClick={event => {event.preventDefault(); event.stopPropagation(); choose(index);}}>
        <span>{option.label}</span><span className="dropdown-check" aria-hidden="true">{option.value === value && <Icon name="check" size={15}/>}</span>
      </div>)}
    </div>}
  </div>;
}
