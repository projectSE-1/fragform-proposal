// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useId} from 'react';
import type {FormulaVersion} from '../lib/model';
import {materials} from '../lib/model';
import {useDemo} from '../lib/demo-context';
import type {LimitFinding, LimitStatus} from '../lib/limit-check';
import {checkStandardLimit, checkSupplierCertificate, summarizeStandardLimits} from '../lib/limit-check';
import {demoLimitStandard, demoSuppliers} from '../lib/limit-check-fixtures';
import {officialSources} from './standards-overview';
import {Badge, Icon, Modal, Notice} from './ui';
import './limit-check.css';

// Text + icon + colour for every state (never colour alone). Mock wording on every label.
const statusCopy:Record<LimitStatus,{tone:'green'|'red'|'amber';icon:string;en:string;th:string;shortEn:string;shortTh:string}>={
  pass:{tone:'green',icon:'check',en:'Within the mock limit',th:'ผ่านเกณฑ์สมมติ',shortEn:'Within',shortTh:'ผ่าน'},
  exceed:{tone:'red',icon:'alert',en:'Exceeds the mock limit',th:'เกินเกณฑ์สมมติ',shortEn:'Exceeds',shortTh:'เกิน'},
  no_limit_defined:{tone:'amber',icon:'info',en:'No mock limit · insufficient data',th:'ไม่มีเกณฑ์สมมติ · ข้อมูลไม่เพียงพอ',shortEn:'No limit',shortTh:'ไม่มีเกณฑ์'},
  data_missing:{tone:'amber',icon:'info',en:'Insufficient data',th:'ข้อมูลไม่เพียงพอ',shortEn:'Insufficient data',shortTh:'ข้อมูลไม่เพียงพอ'},
};
const materialName=(id:string)=>materials.find(m=>m.id===id)?.name||id;

function LimitChip({status}:{status:LimitStatus}) {
  const {t}=useDemo();
  const copy=statusCopy[status];
  return <span className={`limit-chip limit-chip-${copy.tone}`}><Icon name={copy.icon} size={14}/>{t(copy.shortEn,copy.shortTh)}</span>;
}

export function LimitRowButton({draft,materialId,evaluated,onOpen}:{draft:FormulaVersion;materialId:string;evaluated:boolean;onOpen:(materialId:string)=>void}) {
  const {t}=useDemo();
  const status=evaluated?checkStandardLimit(draft,materialId).status:null;
  const name=materialName(materialId);
  const state=status?t(statusCopy[status].en,statusCopy[status].th):t('not evaluated yet','ยังไม่ได้ประเมิน');
  return <button type="button" className="limit-row-button" onClick={()=>onOpen(materialId)} aria-label={t(`FDA / IFRA mock check for ${name}: ${state}`,`อย. / IFRA ผลจำลองของ ${name}: ${state}`)}>
    {status?<LimitChip status={status}/>:<span className="limit-chip limit-chip-neutral"><Icon name="shield" size={14}/>{t('Check','ตรวจ')}</span>}<Icon name="arrow" size={14}/>
  </button>;
}

export function LimitSummary({draft,evaluated}:{draft:FormulaVersion;evaluated:boolean}) {
  const {t}=useDemo();
  const counts=evaluated?summarizeStandardLimits(draft):null;
  return <div role="status" className={counts?'limit-summary':undefined}>{counts&&<>
    <div className="limit-summary-heading"><span className="limit-mock-tag">MOCK</span><strong>{t('Mock limit check','ผลตรวจเกณฑ์สมมติ')}</strong><span className="muted">{draft.category}</span></div>
    <ul className="limit-summary-counts">{(Object.keys(counts) as LimitStatus[]).filter(status=>counts[status]>0).map(status=><li key={status}><LimitChip status={status}/><span>{counts[status]} {t(counts[status]===1?'material':'materials','รายการ')}</span></li>)}</ul>
    <p className="small muted">{t('Open a row in the FDA / IFRA column for the calculation. Fictional limits only; the actual evaluation stays insufficient data.','กดปุ่มในคอลัมน์ อย. / IFRA เพื่อดูการคำนวณ เกณฑ์ทั้งหมดเป็นค่าสมมติ ผลประเมินจริงยังเป็นข้อมูลไม่เพียงพอ')}</p>
  </>}</div>;
}

function LimitMeter({finding}:{finding:LimitFinding}) {
  const {t}=useDemo();
  // Display geometry only. The verdict above comes from the exact decimal comparison.
  const product=Number(finding.productPct),limit=Number(finding.limitPct);
  const scale=Math.max(limit*1.5,product*1.1)||1;
  const mark=Math.min(limit/scale*100,100);
  return <div className="limit-meter" aria-hidden="true">
    <div className="limit-meter-track"><span className={`limit-meter-fill limit-meter-fill-${statusCopy[finding.status].tone}`} style={{width:`${Math.min(product/scale*100,100)}%`}}/><span className="limit-meter-mark" style={{left:`${mark}%`}}/></div>
    <div className="limit-meter-labels"><span>0%</span><span className="limit-meter-limit" style={{left:`${mark}%`}}>{t('Limit','เกณฑ์')} {finding.limitPct}%</span></div>
  </div>;
}

function LimitResult({finding}:{finding:LimitFinding}) {
  const {t}=useDemo();
  const headingId=useId();
  const copy=statusCopy[finding.status];
  const name=materialName(finding.materialId);
  const {productPct:p,limitPct:l,application:app,dilutionPct:d,differencePct:diff,maxDeclaredPct:max}=finding;
  const rounded=finding.maxDeclaredExact?'':t(' (rounded down)',' (ปัดลง)');
  const sentence=finding.status==='pass'?t(`${name} is ${p}% of the finished product, not above the fictional ${l}% limit for ${app}.`,`${name} อยู่ในผลิตภัณฑ์ ${p}% ไม่เกินเกณฑ์สมมติ ${l}% ของ ${app}`)
    :finding.status==='exceed'?t(`${name} is ${p}% of the finished product, above the fictional ${l}% limit for ${app}.`,`${name} อยู่ในผลิตภัณฑ์ ${p}% เกินเกณฑ์สมมติ ${l}% ของ ${app}`)
    :finding.status==='no_limit_defined'?t(`The demo limit table has no row for ${name} in ${app}. A missing limit is not a pass.`,`ตารางเกณฑ์สมมติไม่มีแถวของ ${name} สำหรับ ${app} จึงสรุปไม่ได้ การไม่มีเกณฑ์ไม่ได้แปลว่าผ่าน`)
    :finding.missing==='not_in_formula'?t('This material is no longer in the formula.','วัตถุดิบนี้ไม่อยู่ในสูตรแล้ว')
    :t('The formula input is incomplete, so there is no finished-product value to compare.','ข้อมูลสูตรยังไม่ครบ จึงยังไม่มีค่าในผลิตภัณฑ์ให้เทียบ');
  return <section className={`limit-result limit-result-${copy.tone}`} aria-labelledby={headingId}>
    <div className="limit-result-head"><span className="limit-result-icon"><Icon name={copy.icon} size={22}/></span><div><span className="limit-result-eyebrow">{t('Mock result','ผลจำลอง')} · {demoLimitStandard.id} {demoLimitStandard.version} · {app}</span><h3 id={headingId}>{t(copy.en,copy.th)}</h3></div></div>
    <p className="limit-result-sentence">{sentence}</p>
    {finding.inputError&&<p className="limit-result-detail">{finding.inputError}</p>}
    {p&&l&&<LimitMeter finding={finding}/>}
    {p&&<dl className="limit-figures">
      <div><dt>{t('In formula','ในสูตร')}</dt><dd>{finding.declaredPct}%</dd></div>
      <div><dt>{t('Product dilution','การเจือจางในผลิตภัณฑ์')}</dt><dd>× {d}%</dd></div>
      <div><dt>{t('In finished product','ในผลิตภัณฑ์สำเร็จ')}</dt><dd>{p}%</dd></div>
      <div><dt>{t('Mock maximum','เกณฑ์สมมติสูงสุด')}</dt><dd>{l?`≤ ${l}%`:t('No row','ไม่มีแถว')}</dd></div>
    </dl>}
    {finding.status==='pass'&&<p className="limit-result-detail">{diff==='0'?t('Exactly at the limit. In this demo, equal to the limit counts as within.','เท่ากับเกณฑ์พอดี ในเดโมนี้ค่าที่เท่ากับเกณฑ์นับว่าผ่าน'):t(`Headroom: ${diff} percentage points below the limit.`,`ยังห่างจากเกณฑ์สมมติ ${diff} จุดเปอร์เซ็นต์`)}</p>}
    {finding.status==='exceed'&&<div className="limit-result-detail">
      <p>{t(`Over by ${diff} percentage points. At ${d}% dilution, this material would need to be at most ${max}% of the formula${rounded}; rebalance other materials so the formula still totals 100%.`,`เกิน ${diff} จุดเปอร์เซ็นต์ ที่การเจือจาง ${d}% ต้องใส่วัตถุดิบนี้ในสูตรไม่เกิน ${max}%${rounded} แล้วปรับวัตถุดิบอื่นให้รวมยังเป็น 100%`)}</p>
      <p>{t('This demo does not block saving. In the product, only a reviewed, sourced rule can define a hard block.','เดโมนี้ไม่บล็อกการบันทึก ในระบบจริง การบล็อกต้องมาจากกฎที่มีแหล่งอ้างอิงและผ่านการทบทวนแล้วเท่านั้น')}</p>
    </div>}
  </section>;
}

function LimitBasis({finding,snapshotLabel}:{finding:LimitFinding;snapshotLabel:string}) {
  const {t}=useDemo();
  return <details className="limit-disclosure"><summary>{t('Where do these numbers come from?','ตัวเลขนี้มาจากไหน?')}<Icon name="down" size={16}/></summary><dl>
    <dt>{t('Formula input','ข้อมูลสูตร')}</dt><dd>{snapshotLabel} · {finding.application}</dd>
    <dt>{t('Calculation','การคำนวณ')}</dt><dd>{finding.productPct?<>{finding.declaredPct}% × {finding.dilutionPct}% ÷ 100 = {finding.productPct}% <span className="muted">{t('(dilution applied once; exact decimals, no rounding)','(ใช้การเจือจางครั้งเดียว ทศนิยมตามที่กรอก ไม่ปัดเศษ)')}</span></>:t('Not calculated: formula input incomplete.','ยังคำนวณไม่ได้: ข้อมูลสูตรไม่ครบ')}</dd>
    <dt>{t('Limit row','แถวเกณฑ์')}</dt><dd>{finding.locator?<code>{finding.locator}</code>:t('No matching row','ไม่มีแถวที่ตรงกัน')}</dd>
    <dt>{t('Comparison','วิธีเทียบ')}</dt><dd>{t('Demo rule: at or below the limit = within; above = exceeds; no row = insufficient data. Real comparison and near-limit rules need domain review.','กติกาเดโม: ไม่เกินเกณฑ์ = ผ่าน, มากกว่าเกณฑ์ = เกิน, ไม่มีแถว = ข้อมูลไม่เพียงพอ กติกาเทียบจริงและช่วงใกล้เกณฑ์ต้องให้ผู้เชี่ยวชาญทบทวน')}</dd>
    <dt>{t('Origin','ที่มา')}</dt><dd>{t(`${demoLimitStandard.labelEn}. Hand-authored for this demo; no value from IFRA, Thai FDA or the owner dataset.`,`${demoLimitStandard.labelTh} แต่งขึ้นสำหรับเดโม ไม่มีค่าจาก IFRA อย. หรือชุดข้อมูลของเจ้าของ`)}</dd>
  </dl></details>;
}

function SupplierEvidence({draft,materialId}:{draft:FormulaVersion;materialId:string}) {
  const {t}=useDemo();
  const headingId=useId();
  return <section className="limit-suppliers" aria-labelledby={headingId}>
    <h3 id={headingId}>{t('Supplier documents (mock)','เอกสารจากผู้จำหน่าย (สมมติ)')}</h3>
    <p className="small muted">{t('One material can come from several suppliers, each with its own document set. Each source is shown separately and never merged into one overall pass.','วัตถุดิบเดียวกันมาจากผู้จำหน่ายได้หลายราย แต่ละรายส่งชุดเอกสารไม่เหมือนกัน ระบบแสดงแยกทีละแหล่ง ไม่รวมเป็นผลผ่านรวม')}</p>
    <ul>{demoSuppliers.map(supplier=>{
      const finding=checkSupplierCertificate(draft,materialId,supplier.id);
      const {productPct:p,limitPct:l,application:app}=finding;
      const sentence=finding.missing==='no_certificate'?t('No certificate of conformity in this supplier’s set, so the usage level cannot be checked against it.','ชุดเอกสารของผู้จำหน่ายรายนี้ไม่มีใบรับรองระดับการใช้ จึงเทียบระดับการใช้กับผู้จำหน่ายรายนี้ไม่ได้')
        :finding.missing==='not_listed'?t(`The certificate states no level for ${app}.`,`ใบรับรองไม่ได้ระบุระดับสำหรับ ${app}`)
        :finding.missing?t('Formula input incomplete.','ข้อมูลสูตรไม่ครบ')
        :t(`Certificate maximum ${l}% for ${app}; this formula puts ${p}% in the product.`,`ใบรับรองระบุสูงสุด ${l}% สำหรับ ${app} สูตรนี้มีในผลิตภัณฑ์ ${p}%`);
      return <li key={supplier.id}>
        <div className="limit-supplier-head"><strong>{supplier.name}</strong><code>{supplier.id}</code><LimitChip status={finding.status}/></div>
        <ul className="limit-supplier-docs" aria-label={t(`Documents from ${supplier.name}`,`เอกสารจาก ${supplier.name}`)}>{supplier.documents.map(doc=><li key={doc.en}>{t(doc.en,doc.th)}</li>)}</ul>
        <p>{sentence}{finding.locator&&<> <code>{finding.locator}</code></>}</p>
      </li>;
    })}</ul>
  </section>;
}

export function LimitCheckDialog({materialId,draft,evaluated,snapshotLabel,onClose,onEvaluate}:{materialId:string;draft:FormulaVersion;evaluated:boolean;snapshotLabel:string;onClose:()=>void;onEvaluate:()=>void}) {
  const {t}=useDemo();
  const finding=materialId&&evaluated?checkStandardLimit(draft,materialId):null;
  return <Modal open={!!materialId} onClose={onClose} title={`${t('FDA / IFRA','อย. / IFRA')} · ${materialName(materialId)}`}><div className="limit-dialog">
    <div className="limit-dialog-tags"><span className="limit-mock-tag">MOCK</span><code>{materialId}</code></div>
    <Notice>{t('Invented materials and fictional limits for presentation. The layout follows an IFRA-style category table and supplier certificates, but no number here is a real Thai FDA or IFRA limit, and nothing here confirms safety or compliance.','ใช้วัตถุดิบและเกณฑ์สมมติเพื่อพรีเซนต์ รูปแบบตารางเลียนแบบตารางหมวดผลิตภัณฑ์ของ IFRA และใบรับรองของผู้จำหน่าย แต่ตัวเลขทั้งหมดไม่ใช่เกณฑ์จริงของ อย. หรือ IFRA และไม่ยืนยันความปลอดภัยหรือการผ่านข้อกำหนด')}</Notice>
    {finding?<LimitResult finding={finding}/>:<section className="limit-ready">
      <Icon name="shield" size={26}/>
      <h3>{t('Ready to check this material','พร้อมตรวจวัตถุดิบรายการนี้')}</h3>
      <p>{t('Evaluate to compare this material with the fictional limit. Editing the formula clears the mock result; evaluate again to see the new result.','กดประเมินผลเพื่อเทียบวัตถุดิบนี้กับเกณฑ์สมมติ การแก้ข้อมูลจะล้างผลจำลองเดิม ให้ประเมินอีกครั้งเพื่อดูผลของข้อมูลใหม่')}</p>
      <button type="button" className="button primary" onClick={onEvaluate}><Icon name="chart" size={17}/>{t('Evaluate now','ประเมินผลตอนนี้')}</button>
    </section>}
    {finding&&<LimitBasis finding={finding} snapshotLabel={snapshotLabel}/>}
    {finding&&<SupplierEvidence draft={draft} materialId={materialId}/>}
    <div className="limit-actual"><span>{t('Actual evaluation','ผลประเมินจริง')}</span><Badge tone="amber">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge></div>
    <details className="limit-disclosure"><summary>{t('Official sources for further reading','แหล่งทางการสำหรับอ่านเพิ่ม')}<Icon name="down" size={16}/></summary><div className="limit-official">
      <p className="small muted">{t('Reading links only. These sites are not the source of the fictional limits above.','ลิงก์สำหรับอ่านเท่านั้น เว็บไซต์เหล่านี้ไม่ได้เป็นที่มาของเกณฑ์สมมติด้านบน')}</p>
      <a href={officialSources.thaiFDA} target="_blank" rel="noopener noreferrer">{t('Thai FDA cosmetic laws','กฎหมายเครื่องสำอางของ อย. ไทย')}<Icon name="arrow" size={16}/><span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span></a>
      <a href={officialSources.ifraLibrary} target="_blank" rel="noopener noreferrer">IFRA Standards Library<Icon name="arrow" size={16}/><span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span></a>
    </div></details>
  </div></Modal>;
}
