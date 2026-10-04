// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useId, useState} from 'react';
import {useDemo} from '@/lib/demo-context';
import {pendingAccessGuide, presentationGuides} from '@/lib/presentation-guide';
import {Icon} from './ui';
import './presentation-guide.css';

export function PresentationGuide(){
  const {page,role,t}=useDemo();
  const [expanded,setExpanded]=useState(true);
  const headingId=useId();
  const guide=page==='dashboard'&&role==='pending'?pendingAccessGuide:presentationGuides[page];
  return <details className="presentation-guide" open={expanded} onToggle={event=>setExpanded(event.currentTarget.open)}>
    <summary aria-label={`${t('Presentation guide','คู่มือพรีเซนต์')}: ${t(...guide.title)}`}>
      <span className="presentation-guide-icon"><Icon name="book" size={20}/></span>
      <span className="presentation-guide-title"><span className="presentation-guide-kicker">{t('PRESENTATION GUIDE','คู่มือพรีเซนต์')}</span><strong id={headingId}>{t(...guide.title)}</strong></span>
      <span className="presentation-guide-toggle">{expanded?t('Collapse','ย่อคำอธิบาย'):t('Explain this page','อธิบายหน้านี้')}<Icon name="down" size={18}/></span>
    </summary>
    <div className="presentation-guide-body" role="region" aria-labelledby={headingId}>
      <div className="presentation-guide-overview">
        <div><h2>{t('What is it?','คืออะไร?')}</h2><p>{t(...guide.purpose)}</p></div>
        <div><h2>{t('How does it help?','ช่วยอะไร?')}</h2><p>{t(...guide.benefit)}</p></div>
      </div>
      <div className="presentation-guide-demo"><h2>{t('Show it in three steps','สาธิตใน 3 ขั้นตอน')}</h2><ol>{guide.steps.map((step,index)=><li key={index}><span aria-hidden="true">{index+1}</span><p>{t(...step)}</p></li>)}</ol></div>
      <div className="presentation-guide-boundary"><Icon name="info" size={17}/><p><strong>{t('Demo boundary: ','ขอบเขตเดโม: ')}</strong>{t(...guide.boundary)}</p></div>
    </div>
  </details>;
}
