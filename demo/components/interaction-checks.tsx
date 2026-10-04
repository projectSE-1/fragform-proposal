// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useId} from 'react';
import {useDemo} from '../lib/demo-context';
import {materials} from '../lib/model';
import {interactionExamples,interactionAssessmentMock} from '../lib/interaction-fixtures';
import {Badge,Icon} from './ui';
import {AnalysisExplainer} from './analysis-explainer';
import './interaction-checks.css';

export function InteractionChecks(){
  const {t,navigate}=useDemo();
  const headingId=useId();
  return <section className="panel interaction-preview" aria-labelledby={headingId}>
    <header className="interaction-preview-header">
      <span className="interaction-preview-icon"><Icon name="layers" size={20}/></span>
      <div><h2 id={headingId}>{t('Interaction checks','ตรวจสอบปฏิสัมพันธ์')}</h2><p className="small muted">{t('Explore sample pairs and material groups.','ดูตัวอย่างคู่และกลุ่มวัตถุดิบ')}</p></div>
      <Badge tone="purple">{t('Mock data','ข้อมูลจำลอง')}</Badge>
    </header>
    <p className="interaction-preview-note"><Icon name="info" size={16}/><span>{t('Synthetic pairs and a scripted mock report — independent of the selected formula. No real chemistry, safety or performance evaluation.','คู่ตัวอย่างและรายงานสมมติสำหรับพรีเซนต์ แยกจากสูตรที่เลือก ไม่มีการประเมินเคมี ความปลอดภัย หรือประสิทธิภาพจริง')}</span></p>
    <AnalysisExplainer topic="interactions"/>
    <div className="interaction-preview-grid">
      {interactionExamples.map(example=><article className="interaction-example" key={example.id} aria-labelledby={`${headingId}-${example.id}`}>
        <div className="interaction-example-heading"><Icon name={example.icon} size={18}/><h3 id={`${headingId}-${example.id}`}>{t(example.titleEn,example.titleTh)}</h3></div>
        <span className="interaction-example-label">{t('Illustrative only','ตัวอย่างการแสดงผลเท่านั้น')}</span>
        <div className="interaction-example-members">{example.memberIds.map(id=><div key={id}><strong>{materials.find(material=>material.id===id)?.name||id}</strong><span>{id}</span></div>)}</div>
        <p className="small muted">{t(example.descriptionEn,example.descriptionTh)}</p>
        <details className="interaction-example-details"><summary aria-label={t(`View ${example.titleEn.toLowerCase()} fixture details`,`ดูรายละเอียดข้อมูลจำลอง: ${example.titleTh}`)}>{t('Sample details','รายละเอียดตัวอย่าง')}<Icon name="down" size={15}/></summary><dl><dt>{t('Fixture ID','รหัสข้อมูลจำลอง')}</dt><dd><code>{example.id}</code></dd><dt>{t('Basis','ที่มา')}</dt><dd>{t('Hand-authored UI fixture; no sourced rule.','ข้อมูลสมมติสำหรับหน้าจอ ยังไม่มีกฎอ้างอิง')}</dd></dl></details>
      </article>)}
    </div>
    <section className="interaction-mock-report" aria-labelledby={`${headingId}-mock-report`}>
      <div className="interaction-mock-heading"><span className="interaction-preview-icon"><Icon name="chart" size={20}/></span><div><h3 id={`${headingId}-mock-report`}>{t('Scientific assessment · mock report','ผลประเมินวิทยาศาสตร์ · ตัวอย่างจำลอง')}</h3><p>{t('Read sample findings during your presentation.','ตัวอย่างผลพร้อมคำอธิบายสำหรับใช้พรีเซนต์')}</p></div><Badge tone="purple">MOCK</Badge></div>
      <p className="interaction-mock-boundary">{t('Fixed presentation script, not a calculation from your formula. No confidence score, chemical rule or safety conclusion is supplied.','เป็นรายงานสมมติคงที่ ไม่ได้คำนวณจากสูตรที่กรอก ไม่มีคะแนนความมั่นใจ กฎเคมี หรือข้อสรุปความปลอดภัย')}</p>
      <ol className="interaction-mock-findings">{interactionAssessmentMock.findings.map(finding=><li key={finding.id}>
        <span className="interaction-mock-finding-icon"><Icon name={finding.icon} size={18}/></span><div><h4>{t(finding.titleEn,finding.titleTh)}</h4><p>{t(finding.resultEn,finding.resultTh)}</p><p className="interaction-mock-explanation">{t(finding.explanationEn,finding.explanationTh)}</p><span className="interaction-mock-reference">{finding.id} · {t('UI example','ตัวอย่างหน้าจอ')} {finding.exampleId}</span></div>
      </li>)}</ol>
      <details className="interaction-mock-basis"><summary>{t('Where did this mock result come from?','ผลจำลองนี้มาจากไหน?')}<Icon name="down" size={16}/></summary><dl><dt>{t('Mock report','รายงานสมมติ')}</dt><dd>{interactionAssessmentMock.id} · v{interactionAssessmentMock.version}</dd><dt>{t('Basis','ที่มา')}</dt><dd>{t('Locally hand-authored presentation fixture. DEMO IDs are UI references, not scientific citations. No source dataset, model or measured evidence.','ตัวอย่างที่เขียนขึ้นสำหรับพรีเซนต์ในเครื่อง รหัส DEMO อ้างถึงหน้าจอ ไม่ใช่แหล่งวิทยาศาสตร์ ไม่มีชุดข้อมูล โมเดล หรือหลักฐานวัดจริง')}</dd><dt>{t('Isolation','ขอบเขต')}</dt><dd>{t('Fixed findings do not change with input, alter saved versions or enter Evaluate and snapshot exports.','ผลคงที่ ไม่เปลี่ยนตามสูตร ไม่แก้เวอร์ชันที่บันทึก และไม่รวมในประเมินผลหรือไฟล์สูตรที่ส่งออก')}</dd></dl></details>
    </section>
    <footer className="interaction-preview-footer"><span>{t('Actual evaluation','ผลประเมินจริง')}</span><Badge tone="amber">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge><button type="button" className="button secondary" onClick={()=>navigate('compliance')}><Icon name="shield" size={17}/>{t('Regulations & IFRA','ข้อกำหนด อย. / IFRA')}<Icon name="arrow" size={16}/></button></footer>
  </section>;
}
