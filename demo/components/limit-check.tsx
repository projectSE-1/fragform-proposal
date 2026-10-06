// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useEffect, useId, useRef, useState} from 'react';
import type {ReactNode, RefObject} from 'react';
import type {FormulaVersion} from '../lib/model';
import {validateDemoContext} from '../lib/formula-validation';
import {useDemo} from '../lib/demo-context';
import type {LimitFinding, LimitStatus} from '../lib/limit-check';
import {checkActiveLimit, checkRules, checkSupplierCertificate, summarizeActiveLimits} from '../lib/limit-check';
import {rulesFor} from '../lib/reference';
import {useReference} from '../lib/use-reference';
import {demoLimitStandard, demoSuppliers} from '../lib/limit-check-fixtures';
import {officialSources} from '../lib/official-sources';
import {localizeValidationMessage} from '../lib/validation-messages';
import {Badge, Icon, Modal, Notice} from './ui';
import './limit-check.css';

// Every state has text + icon + colour (never colour alone). Verdicts name their single source
// (the fictional DEMO-STD table or one supplier certificate), never a combined FDA/IFRA pass.
const statusCopy:Record<LimitStatus,{tone:'green'|'red'|'amber';icon:string;en:string;th:string;shortEn:string;shortTh:string}>={
  pass:{tone:'green',icon:'check',en:'Within the limit',th:'ผ่านเกณฑ์',shortEn:'Within',shortTh:'ผ่าน'},
  exceed:{tone:'red',icon:'alert',en:'Exceeds the limit',th:'เกินเกณฑ์',shortEn:'Exceeds',shortTh:'เกิน'},
  no_limit_defined:{tone:'amber',icon:'info',en:'No limit data · insufficient data',th:'ไม่มีข้อมูลเกณฑ์ · ข้อมูลไม่เพียงพอ',shortEn:'No limit data',shortTh:'ไม่มีเกณฑ์'},
  data_missing:{tone:'amber',icon:'info',en:'Insufficient data',th:'ข้อมูลไม่เพียงพอ',shortEn:'Insufficient data',shortTh:'ข้อมูลไม่เพียงพอ'},
};
// Supplier rows describe the certificate, so their badges cannot be read as the material's verdict.
function certificateChip(finding:LimitFinding):[string,string] {
  if(finding.status==='pass') return ['Within certificate','ไม่เกินใบรับรอง'];
  if(finding.status==='exceed') return ['Above certificate','เกินใบรับรอง'];
  if(finding.missing==='no_certificate') return ['No certificate','ไม่มีใบรับรอง'];
  if(finding.missing==='not_listed') return ['Not listed','ไม่ระบุในใบรับรอง'];
  return ['Insufficient data','ข้อมูลไม่เพียงพอ'];
}

const mockSourceLabel=`${demoLimitStandard.id} ${demoLimitStandard.version}`;
// One short name for the fictional table everywhere; the Origin row keeps the fixture's full label.
const tableName:[string,string]=['IFRA-style table','ตารางคล้าย IFRA'];
// One wording for "the check could not run" in the strip, the dialog and the status phrase.
const cantCheck:[string,string]=["Can't check yet",'ยังตรวจไม่ได้'];

// The cause, styled the same under the table and in the dialog: amber alert icon + ink text.
function CauseLine({cause,className}:{cause:string;className:string}) {
  const {t}=useDemo();
  return <p className={className}><Icon name="alert" size={14}/><span>{t(`${cantCheck[0]}: ${cause}`,`${cantCheck[1]}: ${cause}`)}</span></p>;
}

// External-link glyph in the Icon set's stroke style (ui.tsx has no such icon), so new-tab links
// differ visibly from the in-app chevrons. The sr-only text still says it opens a new tab.
function ExternalIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>;
}

// Row tag: same scale as .formula-family in the table, pale tone background.
function LimitTag({status}:{status:LimitStatus}) {
  const {t}=useDemo();
  const copy=statusCopy[status];
  return <span className={`limit-tag limit-tag-${copy.tone}`}><Icon name={copy.icon} size={14}/>{t(copy.shortEn,copy.shortTh)}</span>;
}

// Every other status uses the template's <Badge>, with an icon so colour is never the only cue.
function StatusBadge({tone,icon,children}:{tone:'green'|'red'|'amber';icon:string;children:ReactNode}) {
  return <Badge tone={tone}><Icon name={icon} size={12}/>{children}</Badge>;
}

export function LimitRowButton({draft,materialId,evaluated,onOpen}:{draft:FormulaVersion;materialId:string;evaluated:boolean;onOpen:(materialId:string)=>void}) {
  const {t}=useDemo();
  const ref=useReference();
  const status=evaluated?checkActiveLimit(draft,materialId,ref.rules,ref.limitsLabel).status:null;
  const name=ref.materials.find(m=>m.id===materialId)?.name||materialId;
  // The visible tag text stays inside the accessible name (WCAG 2.5.3). The label is visible only in
  // the narrow inline layout (always on its own line above the tag), where the column header is hidden;
  // elsewhere it is screen-reader text.
  return <button type="button" className="limit-row-button" onClick={()=>onOpen(materialId)}>
    <span className="limit-row-label">{ref.limitsMock?t('Mock limit','เกณฑ์สมมติ'):t('Limit','เกณฑ์')}</span>
    <span className="sr-only">{t(` for ${name}:`,`ของ ${name}:`)} </span>
    {/* Tag and chevron stay together as one unit, so the chevron never ends up on its own line. */}
    <span className="limit-row-value">
      {status?<LimitTag status={status}/>:<span className="limit-tag limit-tag-neutral"><Icon name="shield" size={14}/>{t('Check','ตรวจ')}</span>}
      <span className="sr-only"> ({status?t(statusCopy[status].en,statusCopy[status].th):t('not evaluated yet','ยังไม่ได้ประเมิน')})</span>
      <Icon name="arrow" size={14} className="limit-row-chevron"/>
    </span>
  </button>;
}

// Most actionable state first, so an exceed is the first thing a presenter reads under the table.
const summaryOrder:LimitStatus[]=['exceed','no_limit_defined','data_missing','pass'];

export function LimitSummary({draft,evaluated}:{draft:FormulaVersion;evaluated:boolean}) {
  const {t,locale}=useDemo();
  const ref=useReference();
  const findings=evaluated?draft.ingredients.map(item=>checkActiveLimit(draft,item.materialId,ref.rules,ref.limitsLabel)):[];
  const counts=evaluated?summarizeActiveLimits(draft,ref.rules,ref.limitsLabel):null;
  // A formula-wide input error makes every row data_missing; name the cause instead of only counting rows.
  // With no rows there are no findings, so the cause comes from the same read-only input validation.
  const rawCause=!evaluated?null:findings.length?findings.find(f=>f.missing==='invalid_input')?.inputError??null
    :validateDemoContext(draft,()=>true)??'Add at least one demo material.';
  const cause=localizeValidationMessage(rawCause,locale);
  const statuses=counts?summaryOrder.filter(status=>counts[status]>0):[];
  // Counts carry a unit, so "เกิน 1" cannot be read as "over by 1".
  const countText=(s:LimitStatus)=>counts?t(`${statusCopy[s].shortEn}: ${counts[s]}`,`${statusCopy[s].shortTh} ${counts[s]} รายการ`):'';
  // One concise status phrase for screen readers; the visual strip below is static.
  const phrase=!counts?'':cause?t(`Mock limit check, ${cantCheck[0].toLowerCase()}: ${cause}`,`ผลตรวจเกณฑ์สมมติ ${cantCheck[1]}: ${cause}`)
    :t(`Mock limit check of ${findings.length} materials: ${statuses.map(s=>`${counts[s]} ${statusCopy[s].shortEn.toLowerCase()}`).join(', ')}.`,`ผลตรวจเกณฑ์สมมติ: ${statuses.map(countText).join(' ')} จาก ${findings.length} รายการ`);
  return <>
    <span className="sr-only" role="status" aria-atomic="true">{phrase}</span>
    {counts&&<div className="limit-summary">
      {/* The MOCK badge carries the marking, so the English title does not repeat "mock". */}
      <div className="limit-summary-title">{ref.limitsMock&&<Badge tone="purple">{t('MOCK','สมมติ')}</Badge>}<strong>{t('Limit check','ผลตรวจเกณฑ์')}</strong><span className="small muted">{ref.limitsLabel} · {draft.category}</span></div>
      {statuses.length>0&&<ul className="limit-summary-counts">{statuses.map(status=><li key={status}><StatusBadge tone={statusCopy[status].tone} icon={statusCopy[status].icon}>{countText(status)}</StatusBadge></li>)}</ul>}
      {cause&&<CauseLine cause={cause} className="limit-summary-cause"/>}
    </div>}
  </>;
}

// Bullet bar: value and target are printed as text directly above, so this is supplementary only.
function LimitBar({finding}:{finding:LimitFinding}) {
  // Display geometry only. The verdict comes from the exact decimal comparison.
  const product=Number(finding.productPct),limit=Number(finding.limitPct);
  const scale=Math.max(limit*1.5,product*1.1)||1;
  const mark=Math.min(limit/scale*100,100);
  const fill=Math.min(product/scale*100,100);
  const exceed=finding.status==='exceed';
  return <div className="limit-bar" aria-hidden="true">
    {/* Over the limit, the part beyond the marker is hatched so it reads without relying on hue. */}
    <span className={`limit-bar-fill limit-bar-fill-${exceed?'red':'green'}`} style={{width:`${exceed?mark:fill}%`}}/>
    {exceed&&<span className="limit-bar-excess" style={{left:`${mark}%`,width:`${fill-mark}%`}}/>}
    <span className="limit-bar-mark" style={{left:`${mark}%`}}/>
  </div>;
}

// Same layout before and after evaluation, so nothing jumps and focus lands on the same heading.
function LimitVerdict({finding,application,headingRef}:{finding:LimitFinding|null;application:string;headingRef:RefObject<HTMLHeadingElement|null>}) {
  const {t,locale}=useDemo();
  const ref=useReference();
  const headingId=useId();
  const sourceId=useId();
  const copy=finding?statusCopy[finding.status]:null;
  const tone=copy?.tone??'neutral';
  const detail=():ReactNode=>{
    if(!finding) return null;
    const {declaredPct:a,differencePct:diff,maxDeclaredPct:max}=finding;
    const points=t(`${diff} percentage point${diff==='1'?'':'s'}`,`${diff} จุดเปอร์เซ็นต์`);
    if(finding.status==='pass') return diff==='0'?t('Exactly at the limit (counts as within in this demo).','เท่ากับเกณฑ์พอดี (เดโมนี้นับว่าผ่าน)'):t(`${points} below the limit.`,`ต่ำกว่าเกณฑ์ ${points}`);
    if(finding.status==='exceed') {
      // One parenthetical; the maximum is tied to the mock limit so it never reads as a general allowance.
      const now=finding.maxDeclaredExact?t(`now ${a}%`,`ตอนนี้ ${a}%`):t(`rounded down; now ${a}%`,`ปัดลง · ตอนนี้ ${a}%`);
      return t(`${points} over · to stay within this limit, use at most ${max}% in the formula (${now}).`,`เกิน ${points} · ถ้าจะให้อยู่ในเกณฑ์สมมติ ใส่ในสูตรได้ไม่เกิน ${max}% (${now})`);
    }
    if(finding.status==='no_limit_defined') return finding.ruleType==='specification'?t(`${finding.sourceId} lists a specification for this material in ${application}, not a numeric limit. That is not a pass.`,`${finding.sourceId} ระบุเป็นข้อกำหนดคุณภาพของวัตถุดิบนี้ใน ${application} ไม่ใช่เกณฑ์ตัวเลข จึงไม่ได้แปลว่าผ่าน`):t(`${ref.limitsLabel} has no limit for this material in ${application}. A missing limit is not a pass.`,`${ref.limitsLabel} ไม่มีเกณฑ์ของวัตถุดิบนี้ใน ${application} การไม่มีเกณฑ์ไม่ได้แปลว่าผ่าน`);
    if(finding.missing==='not_in_formula') return t('This material is no longer in the formula.','วัตถุดิบนี้ไม่อยู่ในสูตรแล้ว');
    return t(`${cantCheck[0]}: the formula input is not valid.`,`${cantCheck[1]}: ข้อมูลสูตรไม่ถูกต้อง`);
  };
  const inputError=finding?localizeValidationMessage(finding.inputError,locale):null;
  return <section className="limit-verdict" aria-labelledby={headingId}>
    <div className="limit-verdict-head">
      <span className={`limit-verdict-icon limit-verdict-icon-${tone}`}><Icon name={copy?.icon??'shield'} size={20}/></span>
      <div>
        <p className="limit-source" id={sourceId}>{ref.limitsMock&&<Badge tone="purple">{t('MOCK','สมมติ')}</Badge>}<span>{ref.limitsMock?t(...tableName):(finding?.sourceId??ref.limitsLabel)} · {ref.limitsMock?mockSourceLabel:(finding?.sourceVersion&&finding.sourceVersion!=='—'?finding.sourceVersion:ref.limitsLabel)} · {application}</span></p>
        <h3 id={headingId} ref={headingRef} tabIndex={-1} aria-describedby={sourceId}>{copy?t(copy.en,copy.th):t('Not evaluated yet','ยังไม่ได้ประเมิน')}</h3>
      </div>
    </div>
    {!finding?<p className="limit-detail limit-detail-muted">{t('Evaluate to compare with the active limits. Any edit clears the result.','กดประเมินผลเพื่อเทียบกับเกณฑ์ที่ใช้งานอยู่ ถ้าแก้สูตรต้องประเมินใหม่')}</p>:<>
      {finding.productPct&&<dl className="limit-figures">
        <div><dt>{t('In product','ในผลิตภัณฑ์')}</dt><dd>{finding.productPct}%</dd></div>
        <div><dt>{ref.limitsMock?t('Mock limit','เกณฑ์สมมติ'):t('Limit','เกณฑ์')}</dt><dd className={finding.limitPct?undefined:'limit-none'}>{finding.limitPct?`≤ ${finding.limitPct}%`:t('None','ไม่มี')}</dd></div>
      </dl>}
      {finding.productPct&&finding.limitPct&&<LimitBar finding={finding}/>}
      {/* An input error replaces the generic line with the actionable cause, styled as under the table. */}
      {inputError?<CauseLine cause={inputError} className="limit-detail limit-detail-cause"/>:<p className="limit-detail">{detail()}</p>}
    </>}
  </section>;
}

// One grouped accordion item, following the .analysis-explainer disclosure pattern.
function MoreItem({icon,label,hint,children}:{icon:string;label:string;hint?:string;children:ReactNode}) {
  return <details className="limit-more-item">
    <summary><span className="limit-more-label"><Icon name={icon} size={17}/>{label}{hint&&<span className="limit-more-hint">{hint}</span>}</span><Icon name="down" size={16} className="limit-more-chevron"/></summary>
    <div className="limit-more-body">{children}</div>
  </details>;
}

function LimitBasis({finding,snapshotLabel}:{finding:LimitFinding;snapshotLabel:string}) {
  const {t}=useDemo();
  const ref=useReference();
  return <MoreItem icon="info" label={t('Where do these numbers come from?','ตัวเลขนี้มาจากไหน?')}><dl className="limit-basis">
    <div><dt>{t('Formula input','ข้อมูลสูตร')}</dt><dd>{snapshotLabel} · {finding.application}</dd></div>
    <div><dt>{t('Calculation','การคำนวณ')}</dt><dd>{finding.productPct?<>{finding.declaredPct} × {finding.dilutionPct} ÷ 100 = {finding.productPct}%<span className="limit-basis-note">{t('(% in formula × % dilution ÷ 100; dilution applied once; no rounding)','(% ในสูตร × % การเจือจาง ÷ 100 คิดการเจือจางครั้งเดียว ไม่ปัดเศษ)')}</span></>:t('Not calculated: formula input not valid.','ยังคำนวณไม่ได้: ข้อมูลสูตรไม่ถูกต้อง')}</dd></div>
    <div><dt>{t('Limit row','แถวเกณฑ์')}</dt><dd>{finding.locator?<code>{finding.locator}</code>:t('No matching row','ไม่มีแถวที่ตรงกัน')}</dd></div>
    <div><dt>{t('Comparison','วิธีเทียบ')}</dt><dd>{t('At or below = within · above = exceeds · no row = insufficient data. A demo rule pending expert review; it does not block saving.','ไม่เกินเกณฑ์ = ผ่าน · เกินเกณฑ์ = เกิน · ไม่มีแถว = ข้อมูลไม่เพียงพอ เป็นกติกาเดโมที่ยังต้องให้ผู้เชี่ยวชาญทบทวน และไม่บล็อกการบันทึก')}</dd></div>
    <div><dt>{t('Origin','ที่มา')}</dt><dd>{ref.limitsMock?t(`${demoLimitStandard.labelEn} · ${mockSourceLabel}. Hand-authored for this demo; no value from IFRA, Thai FDA or the owner dataset.`,`${demoLimitStandard.labelTh} · ${mockSourceLabel} · แต่งขึ้นเองสำหรับเดโม ไม่มีค่าจาก IFRA, อย. หรือชุดข้อมูลของเจ้าของ`):t(`${finding.sourceId}, as uploaded in ${ref.limitsLabel}. Checked for format on upload; this tool does not verify it against the published source.`,`${finding.sourceId} ตามที่อัปโหลดใน ${ref.limitsLabel} ตรวจรูปแบบตอนอัปโหลดแล้ว แต่เครื่องมือนี้ไม่ได้ตรวจเทียบกับแหล่งที่เผยแพร่`)}</dd></div>
  </dl></MoreItem>;
}

// Per supplier, never merged into an overall pass. No icon disc or heading, so a supplier row
// cannot be mistaken for the material verdict above.
function SupplierEvidence({draft,materialId}:{draft:FormulaVersion;materialId:string}) {
  const {t}=useDemo();
  const count=demoSuppliers.length;
  return <MoreItem icon="file" label={t('Supplier documents (mock)','เอกสารผู้จำหน่าย (สมมติ)')} hint={t(`${count} suppliers`,`${count} ราย`)}>
    <p className="limit-more-note">{t('Shown per supplier, never combined into a pass, and never overriding the mock result above. Which source governs is a domain decision.','แสดงแยกทีละราย ไม่รวมเป็นผลผ่าน และไม่ลบล้างผลเกณฑ์สมมติด้านบน แหล่งใดใช้ตัดสินต้องให้ผู้เชี่ยวชาญกำหนด')}</p>
    <ul className="limit-suppliers">{demoSuppliers.map(supplier=>{
      const finding=checkSupplierCertificate(draft,materialId,supplier.id);
      const {productPct:p,limitPct:l,application:app}=finding;
      const copy=statusCopy[finding.status];
      const [chipEn,chipTh]=certificateChip(finding);
      const sentence=finding.missing==='no_certificate'?t('No usage-level certificate in this set, so it cannot be compared.','ชุดเอกสารนี้ไม่มีใบรับรองระดับการใช้ จึงเทียบไม่ได้')
        :finding.missing==='not_listed'?t(`The certificate states no level for ${app}.`,`ใบรับรองไม่ได้ระบุระดับสำหรับ ${app}`)
        :finding.missing?t(`${cantCheck[0]}: the formula input is not valid.`,`${cantCheck[1]}: ข้อมูลสูตรไม่ถูกต้อง`)
        :t(`Certificate maximum ${l}% · this formula ${p}% in product.`,`ใบรับรองระบุสูงสุด ${l}% · สูตรนี้ ${p}% ในผลิตภัณฑ์`);
      return <li key={supplier.id}>
        <div className="limit-supplier-head"><strong>{supplier.name}</strong><StatusBadge tone={copy.tone} icon={copy.icon}>{t(chipEn,chipTh)}</StatusBadge></div>
        <ul className="limit-supplier-docs" aria-label={t(`Documents from ${supplier.name}`,`เอกสารจาก ${supplier.name}`)}>{supplier.documents.map(doc=><li key={doc.en}>{t(doc.en,doc.th)}</li>)}</ul>
        <p className="limit-supplier-finding">{sentence}{finding.locator&&<code>{finding.locator}</code>}</p>
      </li>;
    })}</ul>
  </MoreItem>;
}

// Every rule in the active limits that names this substance, in any category and from any source.
// Rules for this formula's category show their result; the rest are listed for reference.
function AllRules({draft,materialId,evaluated}:{draft:FormulaVersion;materialId:string;evaluated:boolean}) {
  const {t}=useDemo();
  const ref=useReference();
  const rules=rulesFor(materialId,ref.rules);
  const results=evaluated?checkRules(draft,materialId,ref.rules):[];
  return <MoreItem icon="shield" label={t('Every rule for this substance','เกณฑ์ทั้งหมดของสารนี้')} hint={t(`${rules.length} in ${ref.limitsLabel}`,`${rules.length} รายการใน ${ref.limitsLabel}`)}>
    {rules.length===0?<p className="limit-more-note">{t(`No limit data for this substance in ${ref.limitsLabel}. That is not a pass: no rule has been recorded.`,`ไม่มีข้อมูลเกณฑ์ของสารนี้ใน ${ref.limitsLabel} ไม่ได้แปลว่าผ่าน แต่หมายถึงยังไม่มีการบันทึกเกณฑ์`)}</p>
    :<div className="table-wrap"><table className="data-table limit-all-rules"><thead><tr><th>{t('Source','แหล่งที่มา')}</th><th>{t('Product category','หมวดผลิตภัณฑ์')}</th><th>{t('Restriction','ข้อจำกัด')}</th><th>{t('Max % in product','สูงสุด % ในผลิตภัณฑ์')}</th><th>{t('This formula','สูตรนี้')}</th></tr></thead>
      <tbody>{rules.map((r,i)=>{const applies=r.category===draft.category;const f=results.find(x=>x.sourceId===r.source&&x.sourceVersion===(r.amendment||'—'));
        return <tr key={i} className={applies?'limit-rule-applies':''}><td>{r.source}{r.amendment&&<span className="small muted"> · {r.amendment}</span>}</td><td>{r.category}</td><td>{r.type}</td><td>{r.maxPct??'—'}</td>
          <td>{!applies?<span className="small muted">{t('Other category','หมวดอื่น')}</span>:!evaluated?<span className="small muted">{t('Evaluate first','กดประเมินก่อน')}</span>:f?<LimitTag status={f.status}/>:'—'}</td></tr>;})}</tbody></table></div>}
  </MoreItem>;
}

function OfficialSources() {
  const {t}=useDemo();
  const newTab=<span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span>;
  return <MoreItem icon="globe" label={t('Official sources (reading only)','แหล่งทางการ (อ่านประกอบ)')}>
    <p className="limit-more-note">{t('Not the source of the mock limits here.','ไม่ใช่ที่มาของเกณฑ์สมมติในหน้านี้')}</p>
    <div className="limit-official">
      <a href={officialSources.thaiFDA} target="_blank" rel="noopener noreferrer">{t('Thai FDA cosmetic laws','กฎหมายเครื่องสำอางของ อย. ไทย')}<ExternalIcon/>{newTab}</a>
      <a href={officialSources.ifraLibrary} target="_blank" rel="noopener noreferrer">{t('IFRA Standards Library','คลังมาตรฐาน IFRA')}<ExternalIcon/>{newTab}</a>
    </div>
  </MoreItem>;
}

export function LimitCheckDialog({materialId,draft,evaluated,snapshotLabel,onClose,onEvaluate,onEditAmount}:{materialId:string;draft:FormulaVersion;evaluated:boolean;snapshotLabel:string;onClose:()=>void;onEvaluate:()=>void;onEditAmount?:(materialId:string)=>void}) {
  const {t}=useDemo();
  const ref=useReference();
  const finding=materialId&&evaluated?checkActiveLimit(draft,materialId,ref.rules,ref.limitsLabel):null;
  const resultHeading=useRef<HTMLHeadingElement>(null);
  const [focusResult,setFocusResult]=useState(false);
  // "Evaluate now" replaces the focused button with the result; move focus to its heading.
  useEffect(()=>{if(focusResult&&finding){resultHeading.current?.focus();setFocusResult(false);}},[focusResult,finding]);
  const name=ref.materials.find(m=>m.id===materialId)?.name||materialId;
  const insufficient=<StatusBadge tone="amber" icon="info">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</StatusBadge>;
  return <Modal open={!!materialId} onClose={onClose} title={`${t('Limits','เกณฑ์')} · ${name}`}><div className="stack limit-dialog">
    {ref.limitsMock?<Notice>{t('All limits are fictional, not Thai FDA or IFRA values, and confirm neither safety nor compliance.','เกณฑ์ทั้งหมดเป็นค่าสมมติ ไม่ใช่ของ อย. หรือ IFRA และไม่ได้รับรองความปลอดภัยหรือการปฏิบัติตามกฎหมาย')}</Notice>
      :<Notice>{t(`Limits from ${ref.limitsLabel}. Uploaded reference data: it confirms neither safety nor compliance, and a missing rule is not a pass.`,`เกณฑ์จาก ${ref.limitsLabel} เป็นข้อมูลอ้างอิงที่อัปโหลด ไม่ได้รับรองความปลอดภัยหรือการปฏิบัติตามกฎหมาย และการไม่มีเกณฑ์ไม่ได้แปลว่าผ่าน`)}</Notice>}
    <LimitVerdict finding={finding} application={draft.category} headingRef={resultHeading}/>
    {/* Thai FDA and the actual evaluation stay separate rows; never merged with the IFRA-style result. */}
    {ref.limitsMock&&<ul className="limit-status">
      <li><div><strong>{t('Thai FDA (TH)','อย. ไทย (TH)')}</strong><span className="limit-status-note">{t(`Not mocked in this demo · never combined with the ${tableName[0]}`,`ไม่ได้จำลองในเดโม · ไม่รวมกับ${tableName[1]}`)}</span></div>{insufficient}</li>
      <li><div><strong>{t('Actual evaluation','ผลประเมินจริง')}</strong><span className="limit-status-note">{t('No approved real limits yet','ยังไม่มีเกณฑ์จริงที่อนุมัติ')}</span></div>{insufficient}</li>
    </ul>}
    <div className="limit-more">
      {finding&&<LimitBasis finding={finding} snapshotLabel={snapshotLabel}/>}
      <AllRules draft={draft} materialId={materialId} evaluated={evaluated}/>
      {finding&&ref.limitsMock&&<SupplierEvidence draft={draft} materialId={materialId}/>}
      <OfficialSources/>
    </div>
    <div className="formula-modal-actions">
      <button type="button" className="button secondary" onClick={onClose}>{t('Close','ปิด')}</button>
      {!finding?<button type="button" className="button primary" onClick={()=>{onEvaluate();setFocusResult(true);}}><Icon name="chart" size={17}/>{t('Evaluate now','ประเมินผลตอนนี้')}</button>
        :finding.status==='exceed'&&onEditAmount?<button type="button" className="button primary" onClick={()=>onEditAmount(finding.materialId)}>{t(`Edit ${name} amount`,`แก้สัดส่วนของ ${name}`)}</button>:null}
    </div>
  </div></Modal>;
}
