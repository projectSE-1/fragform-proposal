// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useEffect,useState} from 'react';
import {useDemo} from '@/lib/demo-context';
import {THEME_STORAGE_KEY} from '@/lib/theme';
import type {Theme} from '@/lib/theme';
import {Icon} from './ui';

export function ThemeToggle(){
  const {t}=useDemo();
  const [theme,setTheme]=useState<Theme>('light');
  useEffect(()=>{
    setTheme(document.documentElement.dataset.theme==='dark'?'dark':'light');
    const sync=(event:StorageEvent)=>{
      if(event.storageArea!==window.localStorage)return;
      if(event.key!==THEME_STORAGE_KEY&&event.key!==null)return;
      const next=event.newValue==='dark'?'dark':'light';
      document.documentElement.dataset.theme=next;
      setTheme(next);
    };
    window.addEventListener('storage',sync);
    return()=>window.removeEventListener('storage',sync);
  },[]);
  const dark=theme==='dark';
  const name=dark?t('Switch to light mode','เปลี่ยนเป็นโหมดสว่าง'):t('Switch to dark mode','เปลี่ยนเป็นโหมดมืด');
  function toggle(){
    const next:Theme=dark?'light':'dark';
    document.documentElement.dataset.theme=next;
    setTheme(next);
    try{localStorage.setItem(THEME_STORAGE_KEY,next);}catch{/* Keep working when browser storage is unavailable. */}
  }
  return <button className="icon-button theme-toggle" aria-label={name} aria-pressed={dark} title={name} onClick={toggle}><Icon name={dark?'sun':'moon'} size={18}/></button>;
}
