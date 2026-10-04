// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useEffect,useState} from 'react';
import {useDemo} from '../lib/demo-context';
import type {IngredientRegulationMockAssessment,IngredientRegulationMockFinding,IngredientRegulationMockReport} from '../lib/ingredient-regulation-mock';
import {ingredientRegulationPreviews} from '../lib/ingredient-regulation-preview';
import {Badge,Icon,Modal,Notice} from './ui';
import './ingredient-regulation-check.css';

function outcomeTone(assessment:IngredientRegulationMockAssessment){
  return assessment.outcome==='exceeds_mock_limit'?'red':assessment.outcome==='within_mock_limit'?'green':'amber';
}
function displayPercent(value:number){return `${value.toLocaleString('en-US',{maximumSignificantDigits:17})}%`;}

export function IngredientRegulationTrigger({name,finding,onOpen}:{name:string;finding?:IngredientRegulationMockFinding;onOpen:()=>void}){
  const {t}=useDemo();
  return <button type="button" className="ingredient-regulation-trigger" onClick={onOpen} aria-label={t(`Inspect FDA / IFRA mock for ${name}`,`ดูผล อย. / IFRA จำลองของ ${name}`)} aria-haspopup="dialog">
    <span><Icon name="shield" size={15}/>{t('FDA / IFRA','อย. / IFRA')}<span className="ingredient-regulation-mock-label">MOCK</span><Icon name="arrow" size={14}/></span>
    {finding?<span className="ingredient-regulation-mini-results">{(['th','ifra'] as const).map(key=>{
      const assessment=finding[key];
      return <span key={key} className={`ingredient-regulation-status status-${outcomeTone(assessment)}`}><Icon name={assessment.outcome==='within_mock_limit'?'check':assessment.outcome==='exceeds_mock_limit'?'alert':'info'} size={13}/>{key==='th'?'TH':'IFRA'} · {assessment.outcome==='within_mock_limit'?t('Within mock limit','ผ่านสมมติ'):assessment.outcome==='exceeds_mock_limit'?t('Above mock limit','เกินสมมติ'):t('Missing data','ข้อมูลขาด')}</span>;
    })}</span>:<span className="ingredient-regulation-waiting">{t('View pass / exceed examples','ดูตัวอย่างผ่าน / เกินเกณฑ์')}</span>}
  </button>;
}

export function IngredientRegulationDetails({open,onClose,name,materialId,report:currentReport,finding:currentFinding,inputLabel:currentInputLabel}:{open:boolean;onClose:()=>void;name:string;materialId:string;report:IngredientRegulationMockReport|null;finding?:IngredientRegulationMockFinding;inputLabel:string}){
  const {t}=useDemo();
  const [mode,setMode]=useState<'current'|'pass'|'exceed'>('current');
  useEffect(()=>{if(open)setMode(currentFinding?'current':'pass');},[open,!!currentFinding]);
  const report=mode==='current'?currentReport:ingredientRegulationPreviews[mode];
  const finding=mode==='current'?currentFinding:report?.ingredients.find(item=>item.rowId==='preview-primary');
  const inputLabel=mode==='current'?currentInputLabel:t('Fixed screen example · Citrus study 01 (DEMO-M01) · independent of your formula','ตัวอย่างหน้าจอคงที่ · Citrus study 01 (DEMO-M01) · แยกจากสูตรที่กรอก');
  const resultName=mode==='current'?name:t('Example · Citrus study 01','ตัวอย่าง · Citrus study 01');
  return <Modal open={open} onClose={onClose} title={t(`FDA / IFRA · ${resultName}`,`อย. / IFRA · ${resultName}`)}>
    <div className="ingredient-regulation-details">
      <div className="row"><Badge tone="purple">MOCK</Badge><span className="small muted">{mode==='current'?materialId:'DEMO-M01'}</span>{mode!=='current'&&<span className="small muted">{t(`Opened from: ${name} (${materialId})`,`เปิดจาก: ${name} (${materialId})`)}</span>}</div>
      <Notice>{t('Invented materials and limits for presentation only. These numbers are not Thai FDA or IFRA limits, and do not establish safety or compliance.','ใช้วัตถุดิบและเกณฑ์สมมติเพื่อพรีเซนต์ ตัวเลขนี้ไม่ใช่เกณฑ์จริงของ อย. หรือ IFRA และไม่ยืนยันความปลอดภัยหรือการผ่านข้อกำหนด')}</Notice>
      <div className="ingredient-regulation-preview-controls" role="group" aria-label={t('Choose mock result view','เลือกมุมมองผลจำลอง')}>{([
        ['current',t('Current input','ผลตามสูตร')],['pass',t('Pass example','ตัวอย่างผ่าน')],['exceed',t('Exceed example','ตัวอย่างเกินเกณฑ์')],
      ] as const).map(([value,label])=><button type="button" key={value} className={`button ${mode===value?'primary':'secondary'}`} aria-pressed={mode===value} onClick={()=>setMode(value)}>{value==='pass'?<Icon name="check" size={16}/>:value==='exceed'?<Icon name="alert" size={16}/>:<Icon name="flask" size={16}/>} {label}</button>)}</div>
      {mode!=='current'&&<p className="ingredient-regulation-preview-note"><Badge tone={mode==='pass'?'green':'red'}>{mode==='pass'?t('Pass layout sample','รูปแบบผลผ่าน'):t('Exceed layout sample','รูปแบบผลเกินเกณฑ์')}</Badge><span>{t(`This fixed example uses Citrus study 01 to demonstrate the display. It is not the result for ${name} or your current formula.`,`ใช้ Citrus study 01 เป็นตัวอย่างคงที่เพื่อแสดงหน้าตาผล ไม่ใช่ผลของ ${name} หรือสูตรที่กำลังกรอก`)}</span></p>}
      {!finding||!report?<div className="ingredient-regulation-pending"><Icon name="shield" size={26}/><h3>{t('Ready to inspect this ingredient','พร้อมตรวจวัตถุดิบรายการนี้')}</h3><p>{t('Close this window and choose Evaluate in Material composition. Editing an input clears the previous mock findings; evaluate again to inspect the new input.','ปิดหน้าต่างนี้แล้วกดประเมินผลในส่วนประกอบสูตร การแก้ข้อมูลจะล้างผลจำลองเดิม ให้ประเมินอีกครั้งเพื่อดูผลของข้อมูลใหม่')}</p></div>:<>
        <div className="ingredient-regulation-assessments">{(['th','ifra'] as const).map(key=>{
          const assessment=finding[key];
          return <section key={key} className={`ingredient-regulation-assessment assessment-${outcomeTone(assessment)}`}>
            <div className="ingredient-regulation-assessment-heading"><h3>{key==='th'?t('Thai FDA · mock lane','อย. ไทย · ช่องผลจำลอง'):t('IFRA · mock industry standard','IFRA · มาตรฐานอุตสาหกรรมจำลอง')}</h3><Badge tone={outcomeTone(assessment)}>{assessment.outcome==='within_mock_limit'?t('Within mock limit','ผ่านเกณฑ์สมมติ'):assessment.outcome==='exceeds_mock_limit'?t('Above mock limit','สูงกว่าเกณฑ์สมมติ'):t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge></div>
            {finding.finishedProductPercent!==null&&assessment.capPercent!==null&&<p className="ingredient-regulation-comparison"><strong>{displayPercent(finding.finishedProductPercent)}</strong><Icon name="arrow" size={16}/><span>{t('Invented maximum','เพดานสมมติ')} <strong>{displayPercent(assessment.capPercent)}</strong></span></p>}
            <p>{t(assessment.explanationEn,assessment.explanationTh)}</p>
            <dl><dt>{t('Fixture reference','อ้างอิงข้อมูลจำลอง')}</dt><dd>{assessment.sourceId||t('No mock rule supplied','ไม่มีเกณฑ์จำลอง')}</dd><dt>{t('Fixture version','เวอร์ชันจำลอง')}</dt><dd>{assessment.ruleVersion||t('Not supplied','ไม่มีข้อมูล')}</dd></dl>
          </section>;
        })}</div>
        <div className="ingredient-regulation-input"><h3>{t('Input used by this mock check','ข้อมูลที่ใช้ตรวจจำลองครั้งนี้')}</h3><p>{inputLabel}</p><dl><dt>{t('Declared in formula','สัดส่วนในสูตร')}</dt><dd>{finding.declaredAmountText}% w/w</dd><dt>{t('Product dilution','ความเข้มข้นผลิตภัณฑ์')}</dt><dd>{report.snapshot.dilutionText}%</dd><dt>{t('Finished-product sample','ตัวอย่างในผลิตภัณฑ์สำเร็จ')}</dt><dd>{finding.finishedProductPercent===null?t('Insufficient data','ข้อมูลไม่เพียงพอ'):`${displayPercent(finding.finishedProductPercent)} w/w`}</dd><dt>{t('Application / vehicle','หมวด / ตัวพา')}</dt><dd>{report.snapshot.category} / {report.snapshot.vehicle}</dd></dl><span>{t('Mock method: declared formula share × declared dilution ÷ 100, applied once. Numbers reflect the mock comparison; they are not production precision or a measured result.','วิธีจำลอง: สัดส่วนในสูตร × ความเข้มข้นผลิตภัณฑ์ ÷ 100 ใช้ครั้งเดียว ตัวเลขแสดงตามผลเปรียบเทียบจำลอง ไม่ใช่นโยบายความแม่นยำระบบจริงหรือผลวัด')}</span></div>
      </>}
      <div className="ingredient-regulation-official"><span>{t('Actual evaluation','ผลประเมินจริง')}</span><Badge tone="amber">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge></div>
      <details className="ingredient-regulation-reading"><summary>{t('Official sources to read','แหล่งทางการสำหรับอ่านเพิ่ม')}<Icon name="down" size={16}/></summary><p>{t('Reading links only. These sites are not the source of the invented limits above.','ลิงก์สำหรับอ่านเท่านั้น เว็บไซต์เหล่านี้ไม่ได้เป็นที่มาของเกณฑ์สมมติด้านบน')}</p><a href="https://cosmetic.fda.moph.go.th/interesting-law/category/cosmetic-laws/" target="_blank" rel="noopener noreferrer">{t('Thai FDA cosmetic laws','กฎหมายเครื่องสำอางของ อย. ไทย')}<Icon name="arrow" size={15}/><span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span></a><a href="https://ifrafragrance.org/standards-library" target="_blank" rel="noopener noreferrer">IFRA Standards Library<Icon name="arrow" size={15}/><span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span></a></details>
      <button type="button" className="button secondary" onClick={onClose}>{t('Close details','ปิดรายละเอียด')}</button>
    </div>
  </Modal>;
}
