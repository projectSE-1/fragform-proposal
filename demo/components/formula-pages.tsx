// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useEffect, useId, useState} from 'react';
import type {ReactNode} from 'react';
import type {Ingredient, FormulaVersion, Formula} from '../lib/model';
import {can, downloadDemo, materials, weightedProfile} from '../lib/model';
import {useReference} from '../lib/use-reference';
import type {MaterialRef} from '../lib/reference';
import type {Weighting} from '../lib/model';
import {referenceCondition, simulate} from '../lib/evaporation';
import type {EvaporationModel} from '../lib/evaporation';
import {validateDemoContext as validateContext} from '../lib/formula-validation';
export {validateDemoDeclaration} from '../lib/formula-validation';
import {useDemo} from '../lib/demo-context';
import type {DemoContextValue} from '../lib/demo-context';
import {localizeValidationMessage} from '../lib/validation-messages';
import {Badge, EmptyState, Icon, Modal, Notice, PageHeader, Panel, thaiFixtureDate} from './ui';
import './formula-pages.css';
import {Dropdown} from './dropdown';
import {AnalysisExplainer} from './analysis-explainer';
import {LimitCheckDialog, LimitRowButton, LimitSummary} from './limit-check';
import {productShare} from '../lib/limit-check';

// Exact decimal product share and batch mass, using the limit check's own arithmetic so the
// table and the eligibility chip can never disagree in the last digit.
const DECIMAL_TEXT=/^\d+(\.\d+)?$/;
function exactShare(a:string,b:string):string|null{return DECIMAL_TEXT.test(a)&&DECIMAL_TEXT.test(b)?productShare(a,b):null;}

function cloneVersion(version:FormulaVersion):FormulaVersion {return {...version,ingredients:version.ingredients.map(item=>({...item}))};}
// Render-time Thai for seeded fixture labels from lib/model.ts (lib data stays English).
type Translate=DemoContextValue['t'];
const seededNotesTh:Record<string,string>={
  'Initial study':'สูตรเริ่มต้น',
  'Updated study':'สูตรที่ปรับปรุง',
  'Review-ready demo snapshot':'สแนปช็อตจำลองพร้อมตรวจทาน',
  'First synthetic study':'สูตรจำลองแรก',
  'Second synthetic study':'สูตรจำลองที่สอง',
  'Initial demo version':'เวอร์ชันเดโมแรก',
  'Initial synthetic version':'เวอร์ชันจำลองแรก',
};
const timeLabelsTh:Record<string,string>={'Today':'วันนี้','Yesterday':'เมื่อวาน','This session':'เซสชันนี้','Just now':'เมื่อสักครู่'};
function timeLabel(value:string,t:Translate):string {const thai=timeLabelsTh[value]??thaiFixtureDate(value);return thai?t(value,thai):value;}
// [English, Thai] kept in state, so a message re-renders in the current language after the toggle.
type Copy=readonly [english:string,thai:string];
// Validators return English (tests assert it); keep the Thai wording beside it from validation-messages.ts.
const validationCopy=(message:string):Copy=>[message,localizeValidationMessage(message,'th')??message];
// Notes typed by the user (versions saved this session after v1) are shown exactly as entered.
function versionNote(version:FormulaVersion,t:Translate):string {
  if(version.createdLabel==='This session'&&version.number>1) return version.note;
  const thai=seededNotesTh[version.note];return thai?t(version.note,thai):version.note;
}
function freshDraft():FormulaVersion {
  return {id:'draft',number:1,createdLabel:'This session',note:'Initial demo version',vehicle:'Ethanol 96% (hydroalcoholic)',category:'Fine fragrance (demo category)',dilution:'20',ingredients:[{id:'new-row-1',materialId:materials[0].id,amount:'100'}]};
}
type DraftFieldsProps={draft:FormulaVersion;onChange:(draft:FormulaVersion)=>void;readOnly?:boolean;prefix:string;limitCell?:(materialId:string)=>ReactNode};
function ContextFields({draft,onChange,readOnly=false,prefix}:DraftFieldsProps) {
  const {t}=useDemo();
  // Ethanol 96% (hydroalcoholic)/B and Fine fragrance (demo category)/B stay English: they are lookup keys in lib/limit-check-fixtures.ts.
  return <div className="formula-context">
    <div className="field"><label className="field-label" htmlFor={`${prefix}-vehicle`}>{t('Vehicle','พาหะ')}</label><Dropdown className="select" aria-label={t('Vehicle','พาหะ')} id={`${prefix}-vehicle`} value={draft.vehicle} disabled={readOnly} onValueChange={value=>onChange({...draft,vehicle:value})}><option>Ethanol 96% (hydroalcoholic)</option><option>Dipropylene glycol (DPG)</option></Dropdown><span className="small muted">{t('Synthetic hydroalcoholic context','บริบทไฮโดรแอลกอฮอล์จำลอง')}</span></div>
    <div className="field"><label className="field-label" htmlFor={`${prefix}-application`}>{t('Application','การใช้งาน')}</label><Dropdown className="select" aria-label={t('Application','การใช้งาน')} id={`${prefix}-application`} value={draft.category} disabled={readOnly} onValueChange={value=>onChange({...draft,category:value})}><option>Fine fragrance (demo category)</option><option>Body lotion (demo category)</option></Dropdown><span className="small muted">{t('Illustrative category labels','ชื่อหมวดหมู่ประกอบการสาธิต')}</span></div>
    <div className="field"><label className="field-label" htmlFor={`${prefix}-dilution`}>{t('Product dilution','การเจือจางในผลิตภัณฑ์')}</label><div className="formula-input-unit"><input className="input" id={`${prefix}-dilution`} inputMode="decimal" value={draft.dilution} disabled={readOnly} onChange={e=>onChange({...draft,dilution:e.target.value})}/><span>%</span></div><span className="small muted">{t('Declared input · no hidden default','ค่าที่ระบุเอง · ไม่มีค่าเริ่มต้นแฝง')}</span></div>
  </div>;
}
function IngredientFields({draft,onChange,readOnly=false,prefix,limitCell}:DraftFieldsProps) {
  const {t}=useDemo();
  const ref=useReference();
  const materials=ref.materials;
  const unused=materials.filter(m=>!draft.ingredients.some(i=>i.materialId===m.id));
  const replace=(id:string,patch:Partial<Ingredient>)=>onChange({...draft,ingredients:draft.ingredients.map(item=>item.id===id?{...item,...patch}:item)});
  const [batch,setBatch]=useState('');
  const batchOn=DECIMAL_TEXT.test(batch)&&Number(batch)>0;
  return <>
    <div className="formula-table-footer"><span className="small muted">{t('A formula is declared in weight percent and must total exactly 100%. Grams appear once you declare a batch size, because a mass needs a target before it is a mass.','สูตรระบุเป็นเปอร์เซ็นต์โดยน้ำหนักและต้องรวมได้ 100% พอดี ค่ากรัมจะแสดงเมื่อกำหนดขนาดแบตช์ เพราะมวลต้องมีเป้าหมายก่อนจึงจะคำนวณได้')}</span><div className="field"><label className="field-label" htmlFor={`${prefix}-batch`}>{t('Batch size','ขนาดแบตช์')}</label><div className="formula-input-unit"><input className="input formula-amount-input" id={`${prefix}-batch`} inputMode="decimal" placeholder="50" value={batch} onChange={e=>setBatch(e.target.value)}/><span>g</span></div></div></div>
    <div className="table-wrap"><table className="data-table formula-ingredient-table"><caption className="sr-only">{t('Synthetic material declarations. Amounts are weight percentages in the formula.','รายการวัตถุดิบจำลองที่ระบุ สัดส่วนเป็นเปอร์เซ็นต์โดยน้ำหนักในสูตร')}</caption><thead><tr><th scope="col">{t('Material','วัตถุดิบ')}</th><th scope="col">{t('Family','หมวดกลิ่น')}</th><th scope="col">{t('Declared w/w','สัดส่วนที่ระบุ (% w/w)')}</th><th scope="col">{t('% of product','% ในผลิตภัณฑ์')}</th>{batchOn&&<th scope="col">{t('Mass','มวล')}</th>}{limitCell&&<th scope="col" className="formula-limit-col">{t('Limit','เกณฑ์')}</th>}{!readOnly&&<th scope="col"><span className="sr-only">{t('Remove row','ลบแถว')}</span></th>}</tr></thead><tbody>{draft.ingredients.map((item,index)=>{
      const material=materials.find(m=>m.id===item.materialId);
      const rowName=material?.name||t(`row ${index+1}`,`แถวที่ ${index+1}`);
      return <tr key={item.id}><td><div className="formula-material-cell"><span className="formula-material-dot" style={{background:material?.color}}/><div>{readOnly?<strong>{material?.name||t('Missing demo material','ขาดวัตถุดิบจำลอง')}</strong>:<><label className="sr-only" htmlFor={`${prefix}-material-${item.id}`}>{t(`Material for row ${index+1}`,`วัตถุดิบแถวที่ ${index+1}`)}</label><Dropdown className="formula-material-select" aria-label={t(`Material for row ${index+1}`,`วัตถุดิบแถวที่ ${index+1}`)} id={`${prefix}-material-${item.id}`} value={item.materialId} onValueChange={value=>replace(item.id,{materialId:value})}>{!material&&<option value={item.materialId}>{t(`${item.materialId} (not in active data)`,`${item.materialId} (ไม่มีในข้อมูลที่ใช้งาน)`)}</option>}{materials.filter(m=>m.id===item.materialId||!draft.ingredients.some(i=>i.materialId===m.id)).map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</Dropdown></>}<span className="small muted formula-material-id">{!material?t(`Not in active material data · ${item.materialId}`,`ไม่มีในข้อมูลวัตถุดิบที่ใช้งาน · ${item.materialId}`):material.cas?`CAS ${material.cas}`:item.materialId}</span>{limitCell&&<span className="formula-limit-inline">{limitCell(item.materialId)}</span>}</div></div></td><td><span className="formula-family">{material?.family||t('No data','ไม่มีข้อมูล')}</span></td><td>{readOnly?<span className="formula-amount">{item.amount}<span className="muted"> %</span></span>:<div className="formula-input-unit formula-amount-input"><label className="sr-only" htmlFor={`${prefix}-amount-${item.id}`}>{t(`Declared amount for ${rowName} in percent`,`สัดส่วนที่ระบุของ ${rowName} เป็นเปอร์เซ็นต์`)}</label><input className="input" id={`${prefix}-amount-${item.id}`} inputMode="decimal" value={item.amount} onChange={e=>replace(item.id,{amount:e.target.value})}/><span>%</span></div>}</td><td className="formula-amount">{exactShare(item.amount,draft.dilution)??<span className="muted">—</span>}</td>{batchOn&&<td className="formula-amount">{(()=>{const g=exactShare(item.amount,batch);return g?`${g} g`:<span className="muted">—</span>;})()}</td>}{limitCell&&<td className="formula-limit-col">{limitCell(item.materialId)}</td>}{!readOnly&&<td><button className="icon-button formula-remove" aria-label={t(`Remove ${rowName}`,`ลบ ${rowName}`)} onClick={()=>onChange({...draft,ingredients:draft.ingredients.filter(i=>i.id!==item.id)})}><Icon name="close" size={16}/></button></td>}</tr>;
    })}</tbody></table></div>
    <div className="formula-table-footer"><span className="small muted">{t('Decimal declarations stay as entered. No automatic normalisation.','ค่าทศนิยมคงไว้ตามที่กรอก ระบบไม่ปรับค่าให้อัตโนมัติ')}</span>{!readOnly&&<button className="button ghost" disabled={!unused.length} onClick={()=>{if(unused[0])onChange({...draft,ingredients:[...draft.ingredients,{id:`row-${Date.now()}`,materialId:unused[0].id,amount:'0'}]});}}><Icon name="plus" size={16}/>{t('Add material','เพิ่มวัตถุดิบ')}</button>}</div>
  </>;
}

export function FormulaLibrary() {
  const {formulas,createFormula,selectFormula,navigate,role,t,notify,setDirty}=useDemo();
  const ref=useReference();
  const [busy,setBusy]=useState(false);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('all');
  const [creating,setCreating]=useState(false);
  const [name,setName]=useState('');
  const [draft,setDraft]=useState<FormulaVersion>(freshDraft);
  const [error,setError]=useState<Copy|null>(null);
  const write=can(role,'formula.write');
  const filtered=formulas.filter(formula=>(`${formula.name} ${formula.code}`).toLowerCase().includes(query.toLowerCase())&&(filter!=='multiple'||formula.versions.length>1));
  const close=()=>{setCreating(false);setDirty(false);setError(null);};
  const create=async()=>{
    if(!can(role,'formula.write')||busy) return;
    if(!name.trim()){setError(['Enter a name for this demo formula.','ใส่ชื่อของสูตรจำลองนี้']);return;}
    const problem=validateContext(draft,ref.known);
    if(problem){setError(validationCopy(problem));return;}
    setBusy(true);const result=await createFormula(name.trim(),cloneVersion(draft));setBusy(false);
    if(!result.ok){setError(result.error);return;}
    close();selectFormula(result.value.id);navigate('editor');notify(t('New synthetic formula created.','สร้างสูตรจำลองแล้ว'));
  };
  return <>
    <PageHeader eyebrow={t('YOUR WORKSPACE','พื้นที่ทำงานของคุณ')} title={t('Formula library','คลังสูตร')} description={t('Your studies, saved as immutable versions.','สูตรของคุณ บันทึกเป็นเวอร์ชันที่แก้ไขไม่ได้')} actions={write&&<button className="button primary" onClick={()=>{setName('');setDraft(freshDraft());setCreating(true);}}><Icon name="plus" size={18}/>{t('New formula','สร้างสูตร')}</button>}/>
    <div className="formula-library-summary"><div><span className="formula-summary-value">{formulas.length}</span><span className="muted">{t('Synthetic formulas','สูตรจำลอง')}</span></div><div><span className="formula-summary-value">{formulas.reduce((sum,x)=>sum+x.versions.length,0)}</span><span className="muted">{t('Immutable snapshots','สแนปช็อตที่แก้ไขไม่ได้')}</span></div><div><Badge tone="purple">{t('Demo workspace','พื้นที่ทำงานเดโม')}</Badge><span className="muted">{t('Session only · resets on reload','เฉพาะเซสชันนี้ · รีเซ็ตเมื่อโหลดหน้าใหม่')}</span></div></div>
    <Panel className="formula-library-panel"><div className="formula-library-toolbar"><div className="formula-search"><Icon name="search" size={19}/><label htmlFor="formula-search" className="sr-only">{t('Search formulas','ค้นหาสูตร')}</label><input className="input" id="formula-search" type="search" placeholder={t('Search name or formula code…','ค้นหาชื่อหรือรหัสสูตร…')} value={query} onChange={e=>setQuery(e.target.value)}/></div><label className="sr-only" htmlFor="formula-library-filter">{t('Filter formulas','กรองสูตร')}</label><Dropdown id="formula-library-filter" aria-label={t('Filter formulas','กรองสูตร')} className="select" value={filter} onValueChange={value=>setFilter(value)}><option value="all">{t('All formulas','สูตรทั้งหมด')}</option><option value="multiple">{t('Multiple versions','มีหลายเวอร์ชัน')}</option></Dropdown></div>
    {filtered.length?<div className="table-wrap"><table className="data-table formula-library-table"><caption className="sr-only">{t('Saved synthetic formulas','สูตรจำลองที่บันทึกไว้')}</caption><thead><tr><th scope="col">{t('Formula','สูตร')}</th><th scope="col">{t('Latest version','เวอร์ชันล่าสุด')}</th><th scope="col">{t('Materials','วัตถุดิบ')}</th><th scope="col">{t('Updated','อัปเดตล่าสุด')}</th><th scope="col"><span className="sr-only">{t('Open','เปิด')}</span></th></tr></thead><tbody>{filtered.map(formula=>{const latest=formula.versions[formula.versions.length-1];return <tr key={formula.id}><td><button className="formula-title-link" onClick={()=>{selectFormula(formula.id);navigate('editor');}}>{formula.name}</button><span className="small muted formula-material-id">{formula.code} · {t('Synthetic study','สูตรศึกษาจำลอง')}</span></td><td><Badge tone="purple">v{latest.number}</Badge><span className="small muted formula-version-count">{t(`${formula.versions.length} snapshots`,`สแนปช็อต ${formula.versions.length} รายการ`)}</span></td><td>{latest.ingredients.length}</td><td className="muted">{timeLabel(formula.updatedLabel,t)}</td><td><button className="button ghost" aria-label={t(`Open ${formula.name}`,`เปิด ${formula.name}`)} onClick={()=>{selectFormula(formula.id);navigate('editor');}}>{t('Open','เปิด')}<Icon name="arrow" size={17}/></button></td></tr>;})}</tbody></table></div>:<EmptyState title={t('No matching formulas','ไม่พบสูตรที่ตรงกัน')} description={t('Try another search or show all formulas.','ลองค้นหาใหม่หรือแสดงสูตรทั้งหมด')} action={<button className="button secondary" onClick={()=>{setQuery('');setFilter('all');}}>{t('Clear filters','ล้างตัวกรอง')}</button>}/>}
    </Panel><p className="small muted formula-bottom-note">{t('Every material, formula and identity in this demo is invented. No owner dataset is included.','วัตถุดิบ สูตร และตัวตนทั้งหมดในเดโมนี้เป็นข้อมูลจำลอง ไม่มีชุดข้อมูลของเจ้าของรวมอยู่')}</p>
    {!write&&<Notice>{t('Your selected role can view formula snapshots. Formula creation and version saving require a formulation role.','บทบาทที่คุณเลือกไว้ดูสแนปช็อตสูตรได้ การสร้างสูตรและการบันทึกเวอร์ชันต้องใช้บทบาทที่แก้ไขสูตรได้')}</Notice>}
    <Modal open={creating} onClose={close} title={t('Create a demo formula','สร้างสูตรจำลอง')}><div className="stack"><Notice>{t('Use invented names and materials only. Formulas are saved to a file on this computer; owner formulas do not belong here.','ใช้ชื่อและวัตถุดิบจำลองเท่านั้น สูตรจะถูกบันทึกเป็นไฟล์ในเครื่องนี้ ห้ามใส่สูตรจริงของเจ้าของ')}</Notice><div className="field"><label className="field-label" htmlFor="new-formula-name">{t('Formula name','ชื่อสูตร')}</label><input className="input" id="new-formula-name" value={name} placeholder={t('e.g. Evening Study','เช่น Evening Study')} maxLength={100} onChange={e=>{setName(e.target.value);setDirty(true);}}/></div><ContextFields draft={draft} prefix="new" onChange={value=>{setDraft(value);setDirty(true);}}/><IngredientFields draft={draft} prefix="new" onChange={value=>{setDraft(value);setDirty(true);}}/>{error&&<div role="alert"><Notice tone="red">{t(...error)}</Notice></div>}<div className="formula-modal-actions"><button className="button secondary" onClick={close}>{t('Cancel','ยกเลิก')}</button><button className="button primary" onClick={create}>{t('Create formula','สร้างสูตร')}</button></div></div></Modal>
  </>;
}

// A small "i" that explains a control on hover or keyboard focus. The text is also the button's description.
function InfoTip({text}:{text:string}) {
  const {t}=useDemo();
  const id=useId();
  return <span className="formula-info"><button type="button" className="formula-info-button" aria-label={t('What is this?','นี่คืออะไร')} aria-describedby={id}><Icon name="info" size={14}/></button><span role="tooltip" id={id} className="formula-info-bubble">{text}</span></span>;
}
// Toolbar controls above both charts. A radio group, so assistive technology reads "1 of 3, selected".
function Segmented<T extends string|number>({label,value,options,onChange,tip}:{label:string;value:T;options:[T,string][];onChange:(value:T)=>void;tip?:string}) {
  return <div className="formula-segmented" role="radiogroup" aria-label={label}><span className="formula-segmented-label">{label}{tip&&<InfoTip text={tip}/>}</span><div>{options.map(([option,text])=><button key={String(option)} type="button" role="radio" aria-checked={value===option} className={value===option?'active':''} onClick={()=>onChange(option)}>{text}</button>)}</div></div>;
}
type ChartProps={draft:FormulaVersion;weighting:Weighting;setWeighting:(w:Weighting)=>void};
function WeightingToggle({weighting,setWeighting}:{weighting:Weighting;setWeighting:(w:Weighting)=>void}) {
  const {t}=useDemo();
  return <Segmented label={t('Weighting','การถ่วงน้ำหนัก')} value={weighting} onChange={setWeighting}
    tip={t('Weighting decides how tall each bar or line is. By perceived strength: an odour activity value (OAV), the amount divided by the detection threshold, so a tiny amount of a powerful material reads as large; 1 means just smellable. This is the measure the fragrance literature uses. By mass: the share of the formula by weight, which says what is in the bottle, not what you smell.','การถ่วงน้ำหนักกำหนดความสูงของแท่งหรือเส้น ตามความแรงที่รับรู้: ค่ากิจกรรมกลิ่น (OAV) คือปริมาณหารด้วยค่าความเข้มข้นต่ำสุดที่ได้กลิ่น วัตถุดิบกลิ่นแรงแม้ใส่น้อยจะดูใหญ่ ค่า 1 คือเพิ่งได้กลิ่น เป็นค่าที่งานวิจัยด้านกลิ่นใช้ ตามมวล: สัดส่วนโดยน้ำหนักในสูตร บอกว่าในขวดมีอะไร ไม่ใช่ได้กลิ่นอะไร')}
    options={[['odour_units',t('By perceived strength (OAV)','ตามความแรงที่รับรู้ (OAV)')],['mass',t('By mass','ตามมวล')]]}/>;
}
// What each weighting still needs from the real dataset. Shown by name, never replaced by another weighting's numbers.
const weightingNeeds:Record<Weighting,[string,string]|null>={
  mass:null,
  odour_units:['A detection threshold for at least one material in this formula. None of them has one in the active material data.','ค่าความเข้มข้นต่ำสุดที่ได้กลิ่นของวัตถุดิบอย่างน้อยหนึ่งชนิดในสูตรนี้ ยังไม่มีวัตถุดิบใดมีค่านี้ในข้อมูลวัตถุดิบที่ใช้งาน'],
};
const unitLabel=(w:Weighting,t:DemoContextValue['t'])=>w==='mass'?'%':t(' OU',' หน่วยกลิ่น');
const fmt=(n:number)=>n>=100?n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2);
type Scale='linear'|'fit'|'log';
function barWidth(value:number,max:number,scale:Scale):number {
  if(scale==='fit')return max>0?value/max*100:0;
  if(scale==='log')return max>0?Math.log10(1+value)/Math.log10(1+max)*100:0;
  return Math.min(value,100);
}
function CompositionChart({draft,weighting,setWeighting}:ChartProps) {
  const {t}=useDemo();
  const ref=useReference();
  const profile=weightedProfile(draft,weighting,ref.materials);
  const [table,setTable]=useState(false);
  const [scale,setScale]=useState<Scale>('linear');
  // Percentages fit 0-100; odour units do not, so their default reading is Fit.
  const shownScale:Scale=weighting!=='mass'&&scale==='linear'?'fit':scale;
  const max=Math.max(0,...profile.bars.map(b=>b.value??0));
  const needs=weightingNeeds[weighting];
  const unit=unitLabel(weighting,t);
  return <><div className="formula-chart-title"><div><h3>{t('Composition by odour family','สัดส่วนตามหมวดกลิ่น')}<InfoTip text={t('Odour family decides which bars exist: Citrus, Floral, Woody and so on. Weighting decides how tall they are. "Built from 1 of 2" means one material in that family has no input for this weighting, so it is listed but left out of the height.','หมวดกลิ่นกำหนดว่ามีแท่งอะไรบ้าง เช่น Citrus, Floral, Woody ส่วนการถ่วงน้ำหนักกำหนดความสูง "คำนวณจาก 1 จาก 2" หมายถึงวัตถุดิบหนึ่งชนิดในหมวดนั้นไม่มีข้อมูลสำหรับการถ่วงน้ำหนักนี้ จึงแสดงชื่อแต่ไม่นำมาคิดความสูง')}/></h3><p className="small muted">{weighting==='mass'?t('Share of the concentrate by weight, computed from your declared amounts','สัดส่วนโดยน้ำหนักในหัวน้ำหอม คำนวณจากค่าที่คุณกรอก'):t('Odour activity value: amount divided by detection threshold, so a trace material that is easy to smell reads as large','ค่ากิจกรรมกลิ่น: ปริมาณหารด้วยค่าความเข้มข้นต่ำสุดที่ได้กลิ่น วัตถุดิบปริมาณน้อยแต่ได้กลิ่นง่ายจะแสดงเป็นแท่งใหญ่')}</p></div><div className="row">{profile.available&&profile.bars.length>0&&<button className="button ghost" onClick={()=>setTable(!table)} aria-expanded={table}>{table?t('Hide data','ซ่อนข้อมูล'):t('View data','ดูข้อมูล')}</button>}</div></div>
  <div className="formula-chart-toolbar"><WeightingToggle weighting={weighting} setWeighting={setWeighting}/>{profile.available&&<Segmented label={t('Scale','สเกล')} value={shownScale} onChange={setScale} tip={t('Zoom for the bars. 0–100%: bar length is the percentage. Fit: the largest bar fills the row, to compare small values. Log: squeezes big differences, useful for odour units, where values can differ thousands of times. Scale changes the drawing, never the numbers.','ซูมของแท่งกราฟ 0–100%: ความยาวแท่งคือเปอร์เซ็นต์ ขยายพอดี: แท่งที่ยาวที่สุดเต็มแถว ใช้เทียบค่าเล็ก ลอการิทึม: ย่อความต่างที่มาก เหมาะกับหน่วยกลิ่นที่ค่าต่างกันเป็นพันเท่า สเกลเปลี่ยนเฉพาะการวาด ไม่เปลี่ยนตัวเลข')} options={weighting==='mass'?[['linear','0–100%'],['fit',t('Fit','ขยายพอดี')],['log',t('Log','ลอการิทึม')]]:[['fit',t('Fit','ขยายพอดี')],['log',t('Log','ลอการิทึม')]]}/>}</div>
  {profile.bars.length===0?<EmptyState title={t('No materials declared','ยังไม่มีวัตถุดิบ')} description={t('Add a material to see its family share.','เพิ่มวัตถุดิบเพื่อดูสัดส่วนของหมวดกลิ่น')}/>
  :!profile.available?<><Notice tone="amber"><span>{t('Not available for this formula with the active material data, so nothing is drawn. Mass is not shown in its place, because two charts built from different arithmetic must never look alike.','ใช้กับสูตรนี้ไม่ได้ด้วยข้อมูลวัตถุดิบที่ใช้งานอยู่ จึงไม่วาดกราฟ และไม่แสดงค่าตามมวลแทน เพราะกราฟสองแบบที่คำนวณต่างกันต้องไม่ดูเหมือนกัน')}<br/><strong>{t('Needs:','ต้องมี:')}</strong> {needs&&t(...needs)}</span></Notice>
    <div className="formula-profile-chart formula-profile-missing">{profile.bars.map(bar=><div className="formula-profile-row weighted" key={bar.family}><span>{bar.family}</span><div className="formula-bar-track formula-bar-missing"><span className="small muted">{bar.materials.map(m=>m.name).join(', ')}</span></div><span className="muted">{t(`0 of ${bar.total}`,`0 จาก ${bar.total}`)}</span></div>)}</div></>
  :table?<table className="data-table"><caption>{t('Height by odour family under the selected weighting.','ความสูงตามหมวดกลิ่นภายใต้การถ่วงน้ำหนักที่เลือก')}</caption><thead><tr><th>{t('Odour family','หมวดกลิ่น')}</th><th>{t('Height','ความสูง')}</th><th>{t('Built from','คำนวณจาก')}</th></tr></thead><tbody>{profile.bars.map(bar=><tr key={bar.family}><td>{bar.family}</td><td>{bar.value===null?t('Insufficient data','ข้อมูลไม่เพียงพอ'):`${fmt(bar.value)}${unit}`}</td><td>{bar.materials.map(m=>m.included?m.name:t(`${m.name} (left out: no input)`,`${m.name} (ไม่นำมาคิด: ไม่มีข้อมูล)`)).join(', ')}</td></tr>)}</tbody></table>
  :<div className="formula-profile-chart" role="img" aria-label={t('Composition by odour family under the selected weighting.','สัดส่วนตามหมวดกลิ่นภายใต้การถ่วงน้ำหนักที่เลือก')}>{profile.bars.map(bar=><div className="formula-profile-row weighted" key={bar.family} title={bar.materials.map(m=>m.included?m.name:`${m.name} (no input)`).join(', ')}><span>{bar.family}</span>{bar.value===null?<div className="formula-bar-track formula-bar-missing"><span className="small muted">{t('No input for this weighting','ไม่มีข้อมูลสำหรับการถ่วงน้ำหนักนี้')}</span></div>:<div className="formula-bar-track"><span style={{width:`${barWidth(bar.value,max,shownScale)}%`,background:bar.color}}/></div>}<span className="muted">{bar.value===null?'–':`${fmt(bar.value)}${unit}`} <span className={`small ${bar.used<bar.total?'formula-partial':''}`}>· {t(`${bar.used} of ${bar.total}`,`${bar.used} จาก ${bar.total}`)}</span></span></div>)}</div>}
  <div className="formula-chart-caption"><span className="formula-chart-dot"/>{weighting==='mass'?t('Weighting: composition share by mass. Not perceived strength.','การถ่วงน้ำหนัก: สัดส่วนโดยมวล ไม่ใช่ความแรงของกลิ่นที่รับรู้'):t(`Perceived strength as odour activity value, from ${ref.materialsLabel}. It grows in a straight line with the amount, a first approximation; the engine never switches weighting on its own.`,`ความแรงที่รับรู้เป็นค่ากิจกรรมกลิ่น จาก ${ref.materialsLabel} เพิ่มขึ้นเป็นเส้นตรงตามปริมาณ ซึ่งเป็นค่าประมาณเบื้องต้น ระบบไม่เปลี่ยนการถ่วงน้ำหนักเอง`)}{profile.available&&shownScale!=='linear'&&<> {t('Scale changes how bars are drawn, not the numbers.','สเกลเปลี่ยนเฉพาะการวาดแท่ง ไม่เปลี่ยนตัวเลข')}</>}</div></>;
}
type Range=0.25|1|8|24;
type YScale='linear'|'log';
type EvoModel=EvaporationModel|'tenacity';
const timeLabel2=(h:number,t:DemoContextValue['t'])=>h>0&&h<1?t(`${Math.round(h*60)} min`,`${Math.round(h*60)} นาที`):t(`${Number.isInteger(h)?h:h.toFixed(1)} h`,`${Number.isInteger(h)?h:h.toFixed(1)} ชม.`);
function EvolutionPanel({draft,weighting,setWeighting}:ChartProps) {
  const {t}=useDemo();
  const ref=useReference();
  const [range,setRange]=useState<Range>(1);
  const [yScale,setYScale]=useState<YScale>('linear');
  const [model,setModel]=useState<EvoModel>('raoult');
  const ticks=[0,.25,.5,.75,1].map(f=>f*range);
  const yLabel=weighting==='mass'?t('Remaining, % of concentrate','ที่เหลือ % ของหัวน้ำหอม'):t('Odour units (OAV)','หน่วยกลิ่น (OAV)');
  // Built-in sample inputs are invented (lib/mock-odour.ts); the screen names the version, not the word.
  const tenacity=model==='tenacity';
  const W=600,H=250,L=52,R=16,T=14,B=34;
  const xOf=(h:number)=>L+(Math.min(h,range)/range)*(W-L-R);
  // Real textbook equations (evaporation.ts) on whatever the ACTIVE material data supplies.
  const steps=60;
  const matOf=(id:string)=>ref.materials.find(m=>m.id===id);
  const rows=draft.ingredients.map(item=>({item,m:matOf(item.materialId)}));
  // Which inputs each material lacks for the chosen model and weighting. Empty means it can be drawn.
  const lacks=(m:MaterialRef|undefined):[string,string][]=>{
    if(!m) return [['not in active material data','ไม่มีในข้อมูลวัตถุดิบที่ใช้งาน']];
    if(tenacity) return m.tenacityHours===null?[['tenacity hours','ชั่วโมงความคงทน']]:[];
    const out:[string,string][]=[];
    if(m.psat25===null) out.push(['vapour pressure at 25 °C','ความดันไอที่ 25 °C']);
    if(m.mw===null) out.push(['molecular weight','น้ำหนักโมเลกุล']);
    if(weighting==='odour_units'&&m.threshold===null) out.push(['detection threshold','ค่าความเข้มข้นต่ำสุดที่ได้กลิ่น']);
    return out;
  };
  const physicsReady=rows.filter(({m})=>m&&m.psat25!==null&&m.mw!==null);
  // A mixture needs every material: leaving one out would change everyone else's mole fraction.
  const mixtureBlocked=model==='raoult'&&physicsReady.length<rows.length;
  const sim=!tenacity&&!mixtureBlocked&&physicsReady.length?simulate(physicsReady.map(({item,m})=>({id:item.id,pct:Number(item.amount)||0,mw:m!.mw!,psatPa:m!.psat25!})),model as EvaporationModel,range,steps):[];
  const series=sim.map(s=>{const {item,m}=rows.find(r=>r.item.id===s.id)!;
    const pts=s.points.map(v=>weighting==='mass'?v:m!.threshold!==null&&m!.threshold>0?v/m!.threshold:null);
    return {item,material:m,points:pts.some(p=>p===null)?null:pts as number[]};});
  const all=series.flatMap(s=>s.points??[]);
  const drawn=tenacity?rows.some(({m})=>m?.tenacityHours!=null):all.length>0;
  const yMax=Math.max(weighting==='odour_units'?2:1,...all)*1.05;
  const yMin=yScale==='log'?Math.max(0.01,Math.min(1,...all.filter(v=>v>0))):0;
  const yOf=(v:number)=>{const f=yScale==='log'?(Math.log10(Math.max(v,yMin))-Math.log10(yMin))/(Math.log10(yMax)-Math.log10(yMin)):v/yMax;return H-B-f*(H-T-B);};
  const rowH=Math.min(30,(H-T-B)/Math.max(1,draft.ingredients.length));
  const cond=referenceCondition;
  const missingNames=rows.filter(({m})=>lacks(m).length).map(({item,m})=>m?.name||item.materialId);
  return <><div className="formula-chart-title"><div><h3>{t('Evolution over time','การเปลี่ยนแปลงตามเวลา')}<InfoTip text={t('How each material fades after the perfume is applied. By mass: how much is left. By odour units: how much you can still smell; under the dashed line at 1 the nose can no longer detect it, even though some is still there. Top notes drop in the first minutes, base notes last all day.','วัตถุดิบแต่ละชนิดจางลงอย่างไรหลังใช้ ตามมวล: เหลืออยู่เท่าไร ตามหน่วยกลิ่น: ยังได้กลิ่นแค่ไหน ใต้เส้นประที่ 1 จมูกจะไม่ได้กลิ่นแล้วแม้ยังมีสารเหลืออยู่ โน้ตบนลดลงในไม่กี่นาทีแรก ส่วนโน้ตฐานอยู่ได้ทั้งวัน')}/></h3><p className="small muted">{tenacity?t('One bar per material: how long it stays smellable.','หนึ่งแท่งต่อวัตถุดิบ: ได้กลิ่นนานแค่ไหน'):t('One line per material in this formula.','หนึ่งเส้นต่อวัตถุดิบหนึ่งชนิดในสูตรนี้')} · {t(`Materials: ${ref.materialsLabel}`,`วัตถุดิบ: ${ref.materialsLabel}`)}</p></div></div>
  <div className="formula-chart-toolbar">
    <Segmented<EvoModel> label={t('Model','โมเดล')} value={model} onChange={setModel} tip={t('Each alone: every material evaporates as if it were on its own, driven by its vapour pressure. Mixture (Raoult): materials share the surface, so each one evaporates in proportion to its share of the molecules; a fast material is slowed down by the slow ones around it. Tenacity: no equation, just the measured "smellable for" hours per material.','แยกกัน: วัตถุดิบแต่ละชนิดระเหยเหมือนอยู่ลำพัง ขึ้นกับความดันไอ ส่วนผสม (Raoult): วัตถุดิบใช้พื้นผิวร่วมกัน แต่ละชนิดระเหยตามสัดส่วนโมเลกุลของตัวเอง ตัวที่ระเหยเร็วจะช้าลงเพราะตัวที่ช้าอยู่รอบ ๆ ความคงทน: ไม่ใช้สมการ ใช้จำนวนชั่วโมงที่ยังได้กลิ่นซึ่งวัดไว้ของแต่ละวัตถุดิบ')} options={[['independent',t('Each alone','แยกกัน')],['raoult',t('Mixture (Raoult)','ส่วนผสม (Raoult)')],['tenacity',t('Tenacity','ความคงทน')]]}/>
    {!tenacity&&<WeightingToggle weighting={weighting} setWeighting={setWeighting}/>}
    <Segmented<Range> label={t('Time range','ช่วงเวลา')} value={range} onChange={setRange} tip={t('Zoom the time axis. Top notes change within minutes; base notes over a whole day.','ซูมแกนเวลา โน้ตบนเปลี่ยนในไม่กี่นาที โน้ตฐานเปลี่ยนตลอดทั้งวัน')} options={[[0.25,t('15 min','15 นาที')],[1,t('1 h','1 ชม.')],[8,t('8 h','8 ชม.')],[24,t('24 h','24 ชม.')]]}/>
    {!tenacity&&<Segmented<YScale> label={t('Y axis','แกน Y')} value={yScale} onChange={setYScale} tip={t('Log spreads out small values, so a fading top note stays readable next to a strong base note.','ลอการิทึมขยายค่าที่เล็ก ให้อ่านโน้ตบนที่กำลังจางได้ แม้อยู่ข้างโน้ตฐานที่แรง')} options={[['linear',t('Linear','เชิงเส้น')],['log',t('Log','ลอการิทึม')]]}/>}
  </div>
  <div className="formula-evolution-frame"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={drawn?t(`Chart against 0 to ${range} hours.`,`กราฟเทียบกับเวลา 0 ถึง ${range} ชั่วโมง`):t(`Empty chart against 0 to ${range} hours. Insufficient data.`,`กราฟว่างเทียบกับเวลา 0 ถึง ${range} ชั่วโมง ข้อมูลไม่เพียงพอ`)}>
    {ticks.map(h=><g key={h}><line x1={xOf(h)} x2={xOf(h)} y1={T} y2={H-B} className="evo-grid"/><text x={xOf(h)} y={H-B+18} textAnchor="middle" className="evo-tick">{timeLabel2(h,t)}</text></g>)}
    <line x1={L} x2={L} y1={T} y2={H-B} className="evo-axis"/><line x1={L} x2={W-R} y1={H-B} y2={H-B} className="evo-axis"/>
    {tenacity?rows.map(({item,m},i)=>{const y=T+i*rowH+rowH*.2;const hours=m?.tenacityHours;if(hours==null)return <text key={item.id} x={L+6} y={y+rowH*.45} className="evo-tick">{m?.name||item.materialId} · {t('no data','ไม่มีข้อมูล')}</text>;return <g key={item.id}><rect x={L} y={y} width={xOf(hours)-L} height={rowH*.6} rx={3} fill={m!.color}/><text x={Math.min(xOf(hours)+6,W-R-4)} y={y+rowH*.45} textAnchor={hours>=range?'end':'start'} className="evo-tick evo-bar-label">{m!.name} · {hours>=range?`${hours} h →`:`${hours} h`}</text></g>;})
    :<>{[0,.5,1].map(f=><line key={f} x1={L} x2={W-R} y1={T+f*(H-T-B)} y2={T+f*(H-T-B)} className="evo-grid"/>)}
      {drawn&&[yMax/1.05,yScale==='log'?yMin:0].map((v,i)=><text key={i} x={L-6} y={yOf(v)+4} textAnchor="end" className="evo-tick">{fmt(v)}</text>)}
      <text x={14} y={(H-B+T)/2} transform={`rotate(-90 14 ${(H-B+T)/2})`} textAnchor="middle" className="evo-tick">{yLabel}</text>
      {drawn&&weighting==='odour_units'&&<g><line x1={L} x2={W-R} y1={yOf(1)} y2={yOf(1)} className="evo-threshold"/><text x={W-R-4} y={yOf(1)-5} textAnchor="end" className="evo-threshold-label">{t('1 OU · smellable','1 หน่วยกลิ่น · เริ่มได้กลิ่น')}</text></g>}
      {drawn?series.map(s=>s.points&&<polyline key={s.item.id} fill="none" stroke={s.material?.color} strokeWidth={2.2} points={s.points.map((v,i)=>`${xOf(i/steps*range).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ')}/>)
        :<text x={(W+L)/2} y={(H-B+T)/2} textAnchor="middle" className="evo-empty">{t('No curve drawn: insufficient data','ไม่วาดเส้น: ข้อมูลไม่เพียงพอ')}</text>}</>}
  </svg></div>
  <Notice tone="amber"><span>{tenacity?t(`Tenacity hours as recorded in ${ref.materialsLabel}. No equation is involved.`,`ชั่วโมงความคงทนตามที่บันทึกใน ${ref.materialsLabel} ไม่มีสมการเกี่ยวข้อง`)
    :<>{t(`Real equation, inputs from ${ref.materialsLabel}. Flux = k × vapour pressure ÷ (R × T)${model==='raoult'?', with vapour pressure scaled by each material\'s mole fraction (Raoult\'s law)':', each material as a pure film'}. One assumed reference condition: paper blotter, still air (k = ${cond.k} m/s), ${(cond.tempK-273.15).toFixed(0)} °C, 1 mg/cm². It sets the time scale; skin and airflow are not modelled. Not validated and not a prediction.`,`สมการจริง ข้อมูลนำเข้าจาก ${ref.materialsLabel} อัตราการระเหย = k × ความดันไอ ÷ (R × T)${model==='raoult'?' โดยปรับความดันไอตามสัดส่วนโมล (กฎของ Raoult)':' โดยคิดแต่ละวัตถุดิบแยกกัน'} สภาวะอ้างอิงที่สมมติหนึ่งแบบ: แถบกระดาษ อากาศนิ่ง (k = ${cond.k} m/s) ${(cond.tempK-273.15).toFixed(0)} °C 1 มก./ตร.ซม. ใช้กำหนดสเกลเวลา ไม่ได้จำลองผิวหรือการไหลของอากาศ ยังไม่ได้ตรวจสอบและไม่ใช่การทำนาย`)}{weighting==='odour_units'&&<> {t('Odour units here divide the amount left on the surface by the threshold, a simplification: the strict version uses the concentration in the air above it.','หน่วยกลิ่นตรงนี้ใช้ปริมาณที่เหลือบนพื้นผิวหารด้วยค่าเกณฑ์ ซึ่งเป็นการลดรูป แบบเคร่งครัดใช้ความเข้มข้นในอากาศเหนือพื้นผิว')}</>}</>}
    {mixtureBlocked&&<><br/><strong>{t('No mixture curve:','ไม่วาดเส้นแบบส่วนผสม:')}</strong> {t(`a mixture needs vapour pressure and molecular weight for every material, and ${missingNames.join(', ')} lack one. Leaving them out would change every other line.`,`แบบส่วนผสมต้องมีความดันไอและน้ำหนักโมเลกุลของทุกวัตถุดิบ แต่ ${missingNames.join(', ')} ยังขาด ถ้าตัดออกเส้นอื่นทั้งหมดจะเปลี่ยนไป`)}</>}</span></Notice>
  <div className="table-wrap"><table className="data-table"><caption className="sr-only">{t('Per-material evolution inputs.','ข้อมูลนำเข้ารายวัตถุดิบ')}</caption><thead><tr><th scope="col">{t('Material','วัตถุดิบ')}</th><th scope="col">{t('Share of concentrate','สัดส่วนในหัวน้ำหอม')}</th><th scope="col">{t('Inputs used','ข้อมูลที่ใช้')}</th></tr></thead><tbody>{rows.map(({item,m})=>{const gaps=lacks(m);const ok=!gaps.length&&!(mixtureBlocked&&!tenacity);return <tr key={item.id}><td><span className={`formula-evo-swatch ${ok?'solid':''}`} style={{borderColor:m?.color}}/><strong>{m?.name||item.materialId}</strong><span className="formula-material-id small muted">{!m?t('Not in active material data','ไม่มีในข้อมูลวัตถุดิบที่ใช้งาน'):m.cas?`CAS ${m.cas}`:item.materialId}</span></td><td className="formula-amount">{item.amount}%</td><td>{!gaps.length&&m?<><span className="formula-material-id small muted">{tenacity?t(`tenacity ${m.tenacityHours} h`,`ความคงทน ${m.tenacityHours} ชม.`):`${t('vapour pressure','ความดันไอ')} ${m.psat25} Pa · MW ${m.mw}${weighting==='odour_units'?` · ${t('threshold','เกณฑ์')} ${m.threshold}`:''}`}</span></>:<><Badge tone="amber">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge><span className="formula-material-id small muted">{t(`missing: ${gaps.map(g=>g[0]).join(', ')}`,`ขาด: ${gaps.map(g=>g[1]).join(', ')}`)}</span></>}</td></tr>;})}</tbody></table></div></>;
}
// Which reference-data versions the charts and limits are using right now, with a way to change it.
function DataInUse() {
  const {t,navigate,role}=useDemo();
  const ref=useReference();
  return <div className="formula-data-in-use">
    <span>{t('Materials','วัตถุดิบ')}: <strong>{ref.materialsLabel}</strong></span>
    <span>{t('Limits','เกณฑ์')}: <strong>{ref.limitsLabel}</strong></span>
    {role==='system_admin'&&<button className="button ghost" onClick={()=>navigate('references')}>{t('Reference data','ข้อมูลอ้างอิง')}<Icon name="arrow" size={14}/></button>}
  </div>;
}
type AnalysisTab='overview'|'composition'|'evolution'|'error-budget'|'provenance';
function AnalysisPanels({draft,formula}:{draft:FormulaVersion;formula:Formula;fixture:boolean;stale:boolean;onShowFixture:()=>void}) {
  const {t,presenter}=useDemo();
  const ref=useReference();
  const [tab,setTab]=useState<AnalysisTab>('overview');
  // One weighting choice for both charts, so they never disagree about what a height means. Perceived strength (OAV) is the default (owner, 2026-10-06).
  const [weighting,setWeighting]=useState<Weighting>('odour_units');
  const [tree,setTree]=useState(false);
  return <Panel className="formula-analysis"><div className="panel-heading formula-analysis-heading"><div><span className="eyebrow">{t('UNDERSTAND THE RESULT','อธิบายผลให้เข้าใจ')}</span><h2>{t('Understand the formula','อ่านผลของสูตร')}</h2></div><DataInUse/></div><div className="tabs formula-analysis-tabs" aria-label={t('Analysis views','มุมมองการวิเคราะห์')}>{([['overview','Overview','ภาพรวม'],['composition','Composition','สัดส่วนตามหมวดกลิ่น'],['evolution','Time evolution','กราฟตามเวลา'],['error-budget','Uncertainty','ความไม่แน่นอน'],['provenance','Sources','ที่มาของข้อมูล']] as [AnalysisTab,string,string][]).map(([value,en,th])=><button className={`tab ${tab===value?'active':''}`} key={value} aria-pressed={tab===value} onClick={()=>setTab(value)}>{t(en,th)}</button>)}</div><div className="formula-analysis-content">
    {presenter&&<AnalysisExplainer topic={tab==='composition'?'profile':tab}/>}
    {tab==='provenance'?<><div className="formula-chart-title"><div><h3>{t('Sources and missing evidence','ที่มาของข้อมูลและหลักฐานที่ยังขาด')}</h3><p className="small muted">{t('Every input and every gap stays visible.','แสดงข้อมูลนำเข้าและสิ่งที่ยังขาดไว้ทั้งหมด')}</p></div><button className="button secondary" onClick={()=>setTree(!tree)}>{tree?t('List view','มุมมองรายการ'):t('Tree view','มุมมองต้นไม้')}</button></div><div className={tree?'formula-provenance-tree':'formula-provenance-list'}><div><Icon name="layers" size={18}/><span><strong>{t('Input snapshot','ข้อมูลสูตรที่ใช้')}</strong><br/><code>{formula.code} / {draft.id}</code><br/><span className="small muted">{t('Declared decimal strings, vehicle, category and product dilution, exactly as entered.','สัดส่วนตามที่กรอก พาหะ หมวดการใช้งาน และการเจือจาง ตามที่กรอกทุกประการ')}</span></span></div><div><Icon name="file" size={18}/><span><strong>{t('Composition and product share','สัดส่วนและส่วนในผลิตภัณฑ์')}</strong><br/><span className="small muted">{t('Exact arithmetic on the declared percentages. No model, no measurement.','คำนวณแบบแม่นยำจากเปอร์เซ็นต์ที่กรอก ไม่มีโมเดล ไม่มีการวัด')}</span></span></div><div><Icon name="shield" size={18}/><span><strong>{t('Regulatory limits','เกณฑ์ตามกฎหมาย')}</strong><br/><code>{ref.limitsLabel}</code><br/><span className="small muted">{ref.limitsMock?t('Built-in sample limits. Real rows are uploaded on the Reference data page.','เกณฑ์ตัวอย่างในตัว ข้อมูลจริงอัปโหลดในหน้าข้อมูลอ้างอิง'):t('Uploaded reference data, checked for format on upload; each rule names its source.','ข้อมูลอ้างอิงที่อัปโหลด ตรวจรูปแบบแล้ว และทุกเกณฑ์ระบุแหล่งที่มา')}</span></span></div><div><Icon name="layers" size={18}/><span><strong>{t('Material data','ข้อมูลวัตถุดิบ')}</strong><br/><code>{ref.materialsLabel}</code><br/><span className="small muted">{t('Odour family, detection threshold, vapour pressure, molecular weight and tenacity for the charts.','หมวดกลิ่น ค่าความเข้มข้นต่ำสุดที่ได้กลิ่น ความดันไอ น้ำหนักโมเลกุล และความคงทน สำหรับกราฟ')}</span></span></div><div><Icon name="alert" size={18}/><span><strong>{t('Not validated: evaporation model','ยังไม่ได้ตรวจสอบ: โมเดลการระเหย')}</strong><br/><span className="small muted">{t('Textbook equations at one assumed reference condition (blotter, still air, 25 °C). Skin and airflow are not modelled, and no curve has been checked against a measurement.','ใช้สมการตามตำราที่สภาวะอ้างอิงที่สมมติหนึ่งแบบ (แถบกระดาษ อากาศนิ่ง 25 °C) ไม่ได้จำลองผิวหรือการไหลของอากาศ และยังไม่มีเส้นใดตรวจเทียบกับการวัดจริง')}</span></span></div></div></>:tab==='error-budget'?<><h3>{t('Uncertainty','ความไม่แน่นอน')}</h3><Notice tone="amber">{t('Unquantified. An uncertainty policy and supporting measurements are required before intervals or contributor percentages can be reported.','ยังไม่ได้ประเมิน ต้องมีนโยบายความไม่แน่นอนและข้อมูลการวัดก่อนจึงจะแสดงช่วงค่าหรือสัดส่วนของแต่ละสาเหตุได้')}</Notice><div className="formula-missing-grid"><div><span>{t('Model uncertainty','ความไม่แน่นอนของโมเดล')}</span><Badge tone="amber">{t('No data','ไม่มีข้อมูล')}</Badge></div><div><span>{t('Observation uncertainty','ความไม่แน่นอนของการสังเกต')}</span><Badge tone="amber">{t('Not measured','ยังไม่ได้วัด')}</Badge></div><div><span>{t('Calibration evidence','หลักฐานการสอบเทียบ')}</span><Badge tone="amber">{t('Needs calibration','ต้องสอบเทียบ')}</Badge></div><div><span>{t('Contributor shares','สัดส่วนของแต่ละสาเหตุ')}</span><Badge tone="amber">{t('Unquantified','ยังไม่ได้ประเมิน')}</Badge></div></div></>:tab==='composition'?<CompositionChart draft={draft} weighting={weighting} setWeighting={setWeighting}/>:tab==='evolution'?<EvolutionPanel draft={draft} weighting={weighting} setWeighting={setWeighting}/>:<div className="formula-chart-grid"><div><CompositionChart draft={draft} weighting={weighting} setWeighting={setWeighting}/></div><div><EvolutionPanel draft={draft} weighting={weighting} setWeighting={setWeighting}/></div></div>}
  </div></Panel>;
}

export function FormulaEditor() {
  const {formulas,saveVersion,selectedId,role,t,navigate,notify,setDirty,dirty}=useDemo();
  const ref=useReference();
  const [saving,setSaving]=useState(false);
  const formula=formulas.find(x=>x.id===selectedId)||formulas[0];
  const latest=formula?.versions[formula.versions.length-1];
  const [versionId,setVersionId]=useState(latest?.id||'');
  const saved=formula?.versions.find(version=>version.id===versionId)||latest;
  const [draft,setDraft]=useState<FormulaVersion>(()=>cloneVersion(latest||freshDraft()));
  const [trial,setTrial]=useState(false);
  const [fixture,setFixture]=useState(true);
  const [evaluated,setEvaluated]=useState(false);
  const [saveOpen,setSaveOpen]=useState(false);
  const [note,setNote]=useState('');
  const [error,setError]=useState<Copy|null>(null);
  const [pendingVersion,setPendingVersion]=useState('');
  const [modelChanged,setModelChanged]=useState(false);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [limitMaterialId,setLimitMaterialId]=useState('');
  const [focusAmountRow,setFocusAmountRow]=useState('');
  // Runs after the dialog's own effect has closed it and restored focus, so the amount field wins.
  useEffect(()=>{if(!limitMaterialId&&focusAmountRow){document.getElementById(`editor-amount-${focusAmountRow}`)?.focus();setFocusAmountRow('');}},[limitMaterialId,focusAmountRow]);
  const writer=can(role,'formula.write');
  const reader=can(role,'read');
  const historical=saved?.id!==latest?.id;
  const readOnly=trial?!reader:(!writer||historical);
  useEffect(()=>{if(saved){setDraft(cloneVersion(saved));setTrial(false);setDirty(false);}},[role]); // shell confirms role changes; unchanged roles keep their permitted transient trial
  if(!formula||!saved) return <EmptyState title={t('No formula selected','ยังไม่ได้เลือกสูตร')} description={t('Choose a synthetic formula to open the workspace.','เลือกสูตรจำลองเพื่อเปิดพื้นที่สูตร')} action={<button className="button primary" onClick={()=>navigate('formulas')}>{t('Open library','เปิดคลังสูตร')}</button>}/>;
  const nextNumber=Math.max(...formula.versions.map(x=>x.number))+1;
  const change=(value:FormulaVersion)=>{if(readOnly)return;setDraft(value);setDirty(true);setEvaluated(false);};
  const discard=()=>{setDraft(cloneVersion(saved));setDirty(false);setTrial(false);setError(null);setEvaluated(false);setFixture(true);notify(t('Unsaved input discarded. The saved snapshot is unchanged.','ทิ้งข้อมูลที่ยังไม่บันทึกแล้ว สแนปช็อตที่บันทึกไว้ไม่เปลี่ยนแปลง'));};
  const switchVersion=(id:string)=>{const next=formula.versions.find(x=>x.id===id);if(!next)return;setVersionId(id);setDraft(cloneVersion(next));setDirty(false);setTrial(false);setFixture(true);setEvaluated(false);setError(null);setPendingVersion('');};
  const startTrial=()=>{if(!reader)return;setDraft(cloneVersion(saved));setTrial(true);setDirty(false);setEvaluated(false);setFixture(false);notify(t('What-if started. Trial input is transient until you explicitly save a new version.','เริ่ม What-if แล้ว ข้อมูลทดลองเป็นข้อมูลชั่วคราวจนกว่าคุณจะกดบันทึกเวอร์ชันใหม่เอง'));};
  const evaluate=()=>{if(!can(role,'read'))return;const problem=validateContext(draft,ref.known);setError(problem?validationCopy(problem):null);setFixture(false);setEvaluated(true);notify(problem?t('Review the highlighted input error.','ตรวจข้อผิดพลาดของข้อมูลที่ไฮไลต์ไว้'):t('Evaluation: insufficient data. No scientific output has been fabricated.','ผลประเมิน: ข้อมูลไม่เพียงพอ ไม่มีการแต่งผลลัพธ์ทางวิทยาศาสตร์ขึ้นมา'));};
  const beginSave=()=>{if(!writer)return;const problem=validateContext(draft,ref.known);if(problem){setError(validationCopy(problem));return;}setError(null);setNote('');setSaveOpen(true);};
  const save=async()=>{if(!can(role,'formula.write')||saving)return;if(!note.trim()){setError(['Add a version note explaining this synthetic change.','เพิ่มหมายเหตุเวอร์ชันเพื่ออธิบายการเปลี่ยนแปลงจำลองนี้']);return;}const problem=validateContext(draft,ref.known);if(problem){setError(validationCopy(problem));return;}setSaving(true);const result=await saveVersion(formula.id,draft,note.trim());setSaving(false);if(!result.ok){setError(result.error);return;}const version=result.value;setVersionId(version.id);setDraft(cloneVersion(version));setSaveOpen(false);setDirty(false);setTrial(false);setEvaluated(false);setFixture(false);setError(null);notify(t(`Saved ${formula.code} v${version.number}. Earlier snapshots remain unchanged.`,`บันทึก ${formula.code} v${version.number} แล้ว สแนปช็อตก่อนหน้ายังคงเดิม`));};
  return <>
    <div className="formula-breadcrumb"><button className="button ghost" onClick={()=>navigate('formulas')}><Icon name="back" size={17}/>{t('Formula library','คลังสูตร')}</button><span>/</span><span>{formula.code}</span></div>
    <PageHeader eyebrow={t('FORMULA WORKSPACE','พื้นที่สูตร')} title={formula.name} description={t('A careful space to formulate, experiment and understand.','พื้นที่สร้างสูตร ทดลอง และตรวจสอบผล')} actions={<button className="button secondary" onClick={()=>downloadDemo(`${formula.code}-v${saved.number}-synthetic.json`,{demo:true,warning:'Synthetic demonstration only. No scientific or regulatory result.',formulaCode:formula.code,formulaName:formula.name,snapshot:saved,analysis:{status:'insufficient_data',missing:['approved models','uncertainty policy','source rules']}})}><Icon name="download" size={17}/>{t('Export snapshot','ส่งออกสแนปช็อต')}</button>}/>
    <div className="formula-status-bar"><div className="row"><Badge tone={dirty?'amber':'purple'}>{dirty?(trial?t('Unsaved what-if','What-if ที่ยังไม่บันทึก'):t('Unsaved changes','การแก้ไขที่ยังไม่บันทึก')):t(`Saved v${saved.number}`,`บันทึกแล้ว v${saved.number}`)}</Badge><Badge>{t('Synthetic data','ข้อมูลจำลอง')}</Badge>{historical&&<Badge>{t('Historical snapshot','สแนปช็อตย้อนหลัง')}</Badge>}</div><div className="formula-version-picker"><label htmlFor="formula-version">{t('Version','เวอร์ชัน')}</label><Dropdown id="formula-version" aria-label={t('Version','เวอร์ชัน')} className="select" value={saved.id} onValueChange={value=>dirty?setPendingVersion(value):switchVersion(value)}>{[...formula.versions].reverse().map(version=><option value={version.id} key={version.id}>v{version.number}{version.id===latest?.id?t(' · Latest',' · ล่าสุด'):''}</option>)}</Dropdown><button className="button ghost" onClick={()=>setHistoryOpen(!historyOpen)} aria-expanded={historyOpen}><Icon name="clock" size={17}/>{t('History','ประวัติ')}</button></div></div>
    {historyOpen&&<Panel className="formula-history"><div className="panel-heading"><h2>{t('Immutable version history','ประวัติเวอร์ชันที่แก้ไขไม่ได้')}</h2><span className="small muted">{t('Select a snapshot to view','เลือกสแนปช็อตเพื่อดู')}</span></div>{[...formula.versions].reverse().map(version=><button key={version.id} className={`formula-history-item ${version.id===saved.id?'selected':''}`} onClick={()=>dirty?setPendingVersion(version.id):switchVersion(version.id)}><span className="formula-history-version">v{version.number}</span><span><strong>{versionNote(version,t)}</strong><br/><span className="small muted">{timeLabel(version.createdLabel,t)}</span></span><Icon name="arrow" size={17}/></button>)}</Panel>}
    <Panel className="formula-context-panel"><ContextFields draft={draft} prefix="editor" onChange={change} readOnly={readOnly}/></Panel>
    <div className="formula-freshness"><span><i className={dirty?'changed':''}/><strong>{t('Input:','ข้อมูลนำเข้า:')}</strong> {dirty?t('changed since saved snapshot','เปลี่ยนจากสแนปช็อตที่บันทึกไว้'):t('saved snapshot selected','เลือกสแนปช็อตที่บันทึกไว้')}</span><span><i className={modelChanged?'changed':''}/><strong>{t('Model:','โมเดล:')}</strong> {modelChanged?t('fixture revision changed','รุ่นของข้อมูลตัวอย่างเปลี่ยนแล้ว'):t('no approved model','ไม่มีโมเดลที่อนุมัติ')}</span><button className="button ghost" onClick={()=>{setModelChanged(!modelChanged);setFixture(false);setEvaluated(false);notify(t('Model-change scenario toggled. This changes only a demonstration status, not your formula.','สลับสถานการณ์ “โมเดลเปลี่ยน” แล้ว เปลี่ยนเฉพาะสถานะการสาธิต ไม่ได้เปลี่ยนสูตรของคุณ'));}}>{t('Try model-change state','ลองสถานะเมื่อโมเดลเปลี่ยน')}</button></div>
    {trial&&<Notice tone="amber"><strong>{t('What-if workspace.','พื้นที่ What-if')}</strong> {t('Changes are temporary. Evaluate does not save them; saving creates a separate immutable version.','การเปลี่ยนแปลงเป็นแบบชั่วคราว การกดประเมินผลไม่ได้บันทึกการเปลี่ยนแปลง การบันทึกจะสร้างเวอร์ชันใหม่ที่แก้ไขไม่ได้แยกต่างหาก')}</Notice>}
    {error&&!saveOpen&&<div role="alert"><Notice tone="red">{t(...error)}</Notice></div>}
    <div className="formula-workspace-grid"><Panel className="formula-material-panel"><div className="panel-heading"><div><h2>{t('Material composition','ส่วนประกอบสูตร')}</h2><p className="small muted">{t('Declared formula percentages · w/w','สัดส่วนในสูตรที่ระบุ · w/w')}</p></div><Badge>{t(`${draft.ingredients.length} materials`,`วัตถุดิบ ${draft.ingredients.length} รายการ`)}</Badge></div><IngredientFields draft={draft} prefix="editor" onChange={change} readOnly={readOnly} limitCell={materialId=><LimitRowButton draft={draft} materialId={materialId} evaluated={evaluated} onOpen={setLimitMaterialId}/>}/><LimitSummary draft={draft} evaluated={evaluated}/><div className="formula-editor-actions"><div>{!readOnly&&<button className="button secondary" onClick={discard} disabled={!dirty&&!trial}>{t('Discard','ทิ้งการแก้ไข')}</button>}{reader&&!trial&&<button className="button secondary" onClick={startTrial} disabled={dirty}>{t('Start what-if','เริ่มทดลองแบบ What-if')}</button>}</div><div><button className="button secondary" onClick={evaluate}><Icon name="chart" size={17}/>{t('Evaluate','ประเมินผล')}</button>{writer&&(!historical||trial)&&<button className="button primary" onClick={beginSave} disabled={!dirty}><Icon name="check" size={17}/>{t('Save new version','บันทึกเวอร์ชันใหม่')}</button>}</div></div>{historical&&!trial&&<p className="small muted formula-readonly-note">{t('Historical snapshots are read only. Start a what-if to try temporary changes.','สแนปช็อตย้อนหลังดูได้อย่างเดียว กดเริ่มทดลองแบบ What-if เพื่อลองแก้ไขชั่วคราว')}</p>}{!writer&&<p className="small muted formula-readonly-note">{t('This role can explore transient what-if input and evaluate it. A formulation role is needed to save a new version.','บทบาทนี้ทดลองข้อมูล What-if ชั่วคราวและประเมินผลได้ ต้องใช้บทบาทที่แก้ไขสูตรได้จึงจะบันทึกเวอร์ชันใหม่ได้')}</p>}</Panel>
    <Panel className="formula-evidence-panel"><div className="formula-evidence-heading"><span className="formula-evidence-icon"><Icon name="spark" size={21}/></span><h2>{t('Why this result','เหตุผลของผลลัพธ์')}</h2></div><Badge tone="amber">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge><p>{t('No approved chemistry is included in this demonstration.','การสาธิตนี้ไม่มีข้อมูลเคมีที่อนุมัติแล้ว')}</p><div className="formula-evidence-items"><div><Icon name="layers" size={18}/><span><strong>{t('Input snapshot','ข้อมูลสูตรที่ใช้')}</strong><span>{formula.code} · v{saved.number}{dirty?t(' + unsaved input',' + ข้อมูลที่ยังไม่บันทึก'):''}</span></span></div><div><Icon name="book" size={18}/><span><strong>{t('Model evidence','หลักฐานโมเดล')}</strong><span>{t('Missing profile definitions and physical models.','ยังขาดนิยามโปรไฟล์และโมเดลทางกายภาพ')}</span></span></div><div><Icon name="shield" size={18}/><span><strong>{t('Rule evidence','หลักฐานกฎ')}</strong><span>{t('No approved interaction or regulatory rules.','ไม่มีกฎปฏิสัมพันธ์หรือกฎด้านข้อกำหนดที่อนุมัติแล้ว')}</span></span></div></div><div className="formula-evidence-foot">{evaluated?t('Input was checked. Scientific evaluation stopped at missing evidence.','ตรวจข้อมูลนำเข้าแล้ว การประเมินทางวิทยาศาสตร์หยุดที่หลักฐานที่ยังขาด'):t('Evaluation returns missing-data reasons, never guessed predictions.','การประเมินแสดงเหตุผลที่ข้อมูลยังขาด ไม่มีการเดาผลทำนาย')}</div><button className="button ghost" onClick={()=>navigate('compliance')}>{t('Document vault','คลังเอกสาร')}<Icon name="arrow" size={16}/></button></Panel></div>
    <AnalysisPanels draft={draft} formula={formula} fixture={fixture} stale={dirty||modelChanged} onShowFixture={()=>setFixture(true)}/>
    <LimitCheckDialog materialId={limitMaterialId} draft={draft} evaluated={evaluated} snapshotLabel={`${formula.code} · v${saved.number}${dirty?t(' + unsaved input',' + ข้อมูลที่ยังไม่บันทึก'):''}`} onClose={()=>setLimitMaterialId('')} onEvaluate={evaluate} onEditAmount={readOnly?undefined:id=>{setFocusAmountRow(draft.ingredients.find(item=>item.materialId===id)?.id||'');setLimitMaterialId('');}}/>
    <Modal open={saveOpen} onClose={()=>{setSaveOpen(false);setError(null);}} title={t('Save an immutable version','บันทึกเวอร์ชันใหม่ที่แก้ไขไม่ได้')}><div className="stack"><Notice>{t(`Creates v${nextNumber}. Existing snapshots remain unchanged. This saves demo input, without scientific validation.`,`จะสร้าง v${nextNumber} โดยสแนปช็อตเดิมไม่เปลี่ยนแปลง การบันทึกนี้เก็บข้อมูลเดโมโดยไม่มีการตรวจสอบทางวิทยาศาสตร์`)}</Notice><div className="field"><label htmlFor="version-note" className="field-label">{t('Version note','หมายเหตุเวอร์ชัน')}</label><textarea className="input" id="version-note" rows={3} maxLength={240} placeholder={t('Describe this synthetic formulation change…','อธิบายการเปลี่ยนแปลงสูตรจำลองนี้…')} value={note} onChange={e=>setNote(e.target.value)}/></div>{error&&<div role="alert"><Notice tone="red">{t(...error)}</Notice></div>}<div className="formula-modal-actions"><button className="button secondary" onClick={()=>{setSaveOpen(false);setError(null);}}>{t('Cancel','ยกเลิก')}</button><button className="button primary" onClick={save}>{t(`Save v${nextNumber}`,`บันทึก v${nextNumber}`)}</button></div></div></Modal>
    <Modal open={!!pendingVersion} onClose={()=>setPendingVersion('')} title={t('Discard unsaved input?','ทิ้งข้อมูลที่ยังไม่บันทึกหรือไม่?')}><div className="stack"><p>{trial?t('Switching snapshots will discard your unsaved what-if input. Saved versions remain unchanged.','การสลับสแนปช็อตจะทิ้งข้อมูล What-if ที่ยังไม่บันทึก เวอร์ชันที่บันทึกแล้วยังคงเดิม'):t('Switching snapshots will discard your unsaved formula input. Saved versions remain unchanged.','การสลับสแนปช็อตจะทิ้งข้อมูลสูตรที่ยังไม่บันทึก เวอร์ชันที่บันทึกแล้วยังคงเดิม')}</p><div className="formula-modal-actions"><button className="button secondary" onClick={()=>setPendingVersion('')}>{t('Keep editing','แก้ไขต่อ')}</button><button className="button danger" onClick={()=>switchVersion(pendingVersion)}>{t('Discard and switch','ทิ้งการแก้ไขและสลับ')}</button></div></div></Modal>
  </>;
}
