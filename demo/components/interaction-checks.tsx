// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useId} from 'react';
import {useDemo} from '../lib/demo-context';
import {materials} from '../lib/model';
import {interactionExamples} from '../lib/interaction-fixtures';
import {Badge,Icon} from './ui';
import './interaction-checks.css';

export function InteractionChecks(){
  const {t}=useDemo();
  const headingId=useId();
  return <section className="panel interaction-preview" aria-labelledby={headingId}>
    <header className="interaction-preview-header">
      <span className="interaction-preview-icon"><Icon name="layers" size={20}/></span>
      <div><h2 id={headingId}>{t('Interaction checks','ตรวจสอบปฏิสัมพันธ์')}</h2><p className="small muted">{t('Explore sample pairs and material groups.','ดูตัวอย่างคู่และกลุ่มวัตถุดิบ')}</p></div>
      <Badge tone="purple">{t('Mock data','ข้อมูลจำลอง')}</Badge>
    </header>
    <p className="interaction-preview-note"><Icon name="info" size={16}/><span>{t('Synthetic UI examples — independent of the selected formula. No chemistry, safety or performance evaluation.','ตัวอย่างหน้าจอจำลอง แยกจากสูตรที่เลือก ไม่มีการประเมินเคมี ความปลอดภัย หรือประสิทธิภาพ')}</span></p>
    <div className="interaction-preview-grid">
      {interactionExamples.map(example=><article className="interaction-example" key={example.id} aria-labelledby={`${headingId}-${example.id}`}>
        <div className="interaction-example-heading"><Icon name={example.icon} size={18}/><h3 id={`${headingId}-${example.id}`}>{t(example.titleEn,example.titleTh)}</h3></div>
        <span className="interaction-example-label">{t('Illustrative only','ตัวอย่างการแสดงผลเท่านั้น')}</span>
        <div className="interaction-example-members">{example.memberIds.map(id=><div key={id}><strong>{materials.find(material=>material.id===id)?.name||id}</strong><span>{id}</span></div>)}</div>
        <p className="small muted">{t(example.descriptionEn,example.descriptionTh)}</p>
        <details className="interaction-example-details"><summary aria-label={t(`View ${example.titleEn.toLowerCase()} fixture details`,`ดูรายละเอียดข้อมูลจำลอง: ${example.titleTh}`)}>{t('Sample details','รายละเอียดตัวอย่าง')}<Icon name="down" size={15}/></summary><dl><dt>{t('Fixture ID','รหัสข้อมูลจำลอง')}</dt><dd><code>{example.id}</code></dd><dt>{t('Basis','ที่มา')}</dt><dd>{t('Hand-authored UI fixture; no sourced rule.','ข้อมูลสมมติสำหรับหน้าจอ ยังไม่มีกฎอ้างอิง')}</dd></dl></details>
      </article>)}
    </div>
    <footer className="interaction-preview-footer"><span>{t('Scientific evaluation','ผลประเมินวิทยาศาสตร์')}</span><Badge tone="amber">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge></footer>
  </section>;
}
