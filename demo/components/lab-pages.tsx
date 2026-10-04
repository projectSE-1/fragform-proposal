// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Invented, in-memory demonstration records only. No chemical model or legal threshold is encoded.
'use client';
import {useEffect, useRef, useState} from 'react';
import type {SetStateAction} from 'react';
import {useDemo} from '../lib/demo-context';
import {can, downloadDemo, materials} from '../lib/model';
import type {FormulaVersion} from '../lib/model';
import {Badge, EmptyState, Icon, Modal, Notice, PageHeader, Panel} from './ui';
import {Dropdown} from './dropdown';
import './lab-pages.css';

type Scenario = 'normal' | 'warn' | 'block';
type Reading = {id:number; materialId:string; value:string; unit:string; instrument:string; lot:string; scenario:Scenario; reason:string; at:string};
type DemoBatch = {id:string; formulaId:string; formulaName:string; version:FormulaVersion; target:string; unit:string; instrument:string; lots:Record<string,string>};
type BatchTrail = {readings:Reading[]; hardBlocked:boolean; remediations:string[]; preps:string[]};
const emptyBatchTrail=():BatchTrail=>({readings:[],hardBlocked:false,remediations:[],preps:[]});
const instruments = [{id:'DEMO-I01',name:'Balance A · display fixture'},{id:'DEMO-I02',name:'Balance B · display fixture'}];
const lotFor = (id:string) => `DEMO-LOT-${id.replace('DEMO-M','')}`;
const fixtureReadings:Record<string,string> = {'DEMO-M01':'40.000','DEMO-M02':'30.000','DEMO-M03':'20.000','DEMO-M04':'10.000','DEMO-M05':'5.000','DEMO-M06':'5.000'};

function RoleBoundary({lab=false}:{lab?:boolean}) {
  const {t,role}=useDemo();
  return <Notice tone="amber">{t('This persona has read-only access here.','บทบาทนี้ดูข้อมูลหน้านี้ได้อย่างเดียว')} {lab&&role==='org_admin'&&t('An organisation administrator needs a separate formulator grant to record lab work.','ผู้ดูแลองค์กรต้องมีสิทธิ์ formulator เพิ่มจึงจะบันทึกงานแล็บได้')}</Notice>;
}

export function LabPage() {
  const {t,role,formulas,selectedId,notify}=useDemo();
  const first=formulas.find(f=>f.id===selectedId)||formulas[0];
  const [formulaId,setFormulaId]=useState(first?.id||'');
  const currentFormula=formulas.find(f=>f.id===formulaId)||formulas[0];
  const [versionId,setVersionId]=useState(first?.versions.at(-1)?.id||'');
  const currentVersion=currentFormula?.versions.find(v=>v.id===versionId)||currentFormula?.versions.at(-1);
  const [target,setTarget]=useState('100');
  const [unit,setUnit]=useState('g');
  const [instrument,setInstrument]=useState('');
  const [lots,setLots]=useState<Record<string,string>>({});
  const [scenario,setScenario]=useState<Scenario>('normal');
  const [batches,setBatches]=useState<DemoBatch[]>(()=>first?.versions.at(-1)?[{id:'DEMO-B001',formulaId:first.id,formulaName:first.name,version:structuredClone(first.versions.at(-1)!),target:'100',unit:'g',instrument:'',lots:{}}]:[]);
  const [activeBatchId,setActiveBatchId]=useState('DEMO-B001');
  const batch=batches.find(b=>b.id===activeBatchId)||null;
  const [batchTrails,setBatchTrails]=useState<Record<string,BatchTrail>>({});
  const trail=batchTrails[activeBatchId]||emptyBatchTrail();
  const {readings,hardBlocked,remediations,preps}=trail;
  const setTrailField=<K extends keyof BatchTrail>(key:K,value:SetStateAction<BatchTrail[K]>)=>setBatchTrails(old=>{
    const existing=old[activeBatchId]||emptyBatchTrail();
    const next=typeof value==='function'?(value as (previous:BatchTrail[K])=>BatchTrail[K])(existing[key]):value;
    return {...old,[activeBatchId]:{...existing,[key]:next}};
  });
  const setReadings=(next:SetStateAction<Reading[]>)=>setTrailField('readings',next);
  const setHardBlocked=(next:SetStateAction<boolean>)=>setTrailField('hardBlocked',next);
  const setRemediations=(next:SetStateAction<string[]>)=>setTrailField('remediations',next);
  const setPreps=(next:SetStateAction<string[]>)=>setTrailField('preps',next);
  const [remediationOpen,setRemediationOpen]=useState(false);
  const [remediationChecked,setRemediationChecked]=useState(false);
  const [reweighId,setReweighId]=useState('');
  const [reason,setReason]=useState('');
  const [prepOpen,setPrepOpen]=useState(false);
  const [prepMaterial,setPrepMaterial]=useState('DEMO-M01');
  const [prepRatio,setPrepRatio]=useState('1:10');
  const [sheet,setSheet]=useState<'mixing'|'label'|null>(null);
  const [error,setError]=useState('');
  const writable=can(role,'lab.write');
  if(!can(role,'read'))return <EmptyState title={t('Lab access is pending','กำลังรอสิทธิ์ใช้งานแล็บ')} description={t('Try the isolated tutorial or switch to an authorised demo persona.','ลองบทสอนจำลองหรือเปลี่ยนเป็นบทบาทเดโมที่มีสิทธิ์')}/>;

  const deny=()=>{notify(t('This demo persona cannot record laboratory work.','บทบาทเดโมนี้บันทึกงานแล็บไม่ได้'));};
  const createBatch=()=>{
    if(!writable){deny();return;}
    if(hardBlocked){setError(t('Resolve the active demo block before creating another batch.','แก้ไขสถานะบล็อกจำลองก่อนสร้างแบตช์ใหม่'));return;}
    if(!/^\d+(\.\d+)?$/.test(target)||!Number.isFinite(Number(target))||Number(target)<=0){setError(t('Enter a positive decimal target.','กรอกปริมาณเป้าหมายเป็นเลขทศนิยมบวก'));return;}
    if(!currentFormula||!currentVersion){setError(t('Choose a saved formula version.','เลือกเวอร์ชันสูตรที่บันทึกแล้ว'));return;}
    if(!instrument){setError(t('Choose an instrument explicitly.','เลือกเครื่องมือด้วยตนเอง'));return;}
    if(currentVersion.ingredients.some(i=>!lots[i.materialId])){setError(t('Select a synthetic lot for every component.','เลือกล็อตจำลองของส่วนผสมทุกรายการ'));return;}
    const nextBatch:DemoBatch={id:`DEMO-B${String(batches.length+1).padStart(3,'0')}`,formulaId:currentFormula.id,formulaName:currentFormula.name,version:structuredClone(currentVersion),target,unit,instrument,lots:{...lots}};
    setBatches(old=>[...old,nextBatch]);setActiveBatchId(nextBatch.id);setScenario('normal');setError('');
    notify(t('Created an in-memory batch pinned to the saved version.','สร้างแบตช์จำลองที่อ้างอิงเวอร์ชันที่บันทึกแล้ว'));
  };
  const record=(materialId:string,reweigh=false)=>{
    if(!writable){deny();return;}
    if(hardBlocked){setError(t('Recording is blocked. Review the demo remediation first.','ระบบบล็อกการบันทึก ตรวจวิธีแก้ไขจำลองก่อน'));return;}
    if(!batch||!instrument||!lots[materialId]){setError(t('Choose a batch, instrument and component lot before recording.','เลือกแบตช์ เครื่องมือ และล็อตก่อนบันทึก'));return;}
    if(reweigh&&!reason.trim()){setError(t('A reason is required for a reweigh.','ต้องระบุเหตุผลสำหรับการชั่งซ้ำ'));return;}
    const next:Reading={id:Date.now(),materialId,value:fixtureReadings[materialId]||'5.000',unit:'g',instrument,lot:lots[materialId],scenario,reason:reweigh?reason.trim():'Initial demo reading',at:`Entry ${readings.length+1}`};
    setBatches(old=>old.map(b=>b.id===batch.id?{...b,instrument,lots:{...lots}}:b));
    setReadings(old=>[...old,next]);setError('');setReweighId('');setReason('');
    if(scenario==='block')setHardBlocked(true);
    notify(t('Appended a synthetic reading. Earlier entries remain unchanged.','เพิ่มผลชั่งจำลองโดยไม่แก้ไขรายการเดิม'));
  };
  const reviewRemediation=()=>{
    if(!writable){deny();return;}
    if(!remediationChecked)return;
    setRemediations(old=>[...old,`DEMO-REMEDIATION-${old.length+1}: reviewed fixture; next reading uses the normal UI scenario`]);
    setHardBlocked(false);setScenario('normal');setRemediationOpen(false);setRemediationChecked(false);setError('');
    notify(t('Remediation walkthrough recorded. Historical blocked readings remain visible.','บันทึกขั้นตอนแก้ไขจำลองแล้ว ผลชั่งที่บล็อกยังอยู่ในประวัติ'));
  };
  const downloadSheet=(kind:'mixing'|'label')=>{
    if(!batch)return;
    downloadDemo(`DEMO-${batch.id}-${kind}.txt`,`${kind==='mixing'?'SYNTHETIC MIXING SHEET':'SYNTHETIC LAB LABEL'}\nNot for production or safety decisions.\nBatch: ${batch.id}\nFormula: ${batch.formulaName} / v${batch.version.number}\nDeclared target: ${batch.target} ${batch.unit}\nComponent targets: insufficient data (no approved conversion model)\n${kind==='mixing'?`Saved synthetic inputs:\n${batch.version.ingredients.map(i=>`${i.materialId}: ${i.amount} declared w/w %`).join('\n')}\n\nAppend-only exercise readings:\n${readings.map(r=>`${r.at}: ${r.materialId}, ${r.value} ${r.unit}, ${r.scenario}, ${r.instrument}, ${r.lot}, ${r.reason}`).join('\n')}`:'Opaque demo identifier only; no confidential QR or storage URL.'}`);
    notify(t('Downloaded the synthetic text preview.','ดาวน์โหลดตัวอย่างข้อความจำลองแล้ว'));
  };
  return <div className="stack lab-page">
    <PageHeader eyebrow={t('FORMULA → LAB','สูตร → แล็บ')} title={t('Lab workspace','พื้นที่ทำงานแล็บ')} description={t('Pin a saved version, practise recording and keep the weighing trail.','เลือกเวอร์ชันสูตร ฝึกบันทึก และเก็บประวัติการชั่ง')} actions={<Badge tone="purple">{t('Synthetic exercise','แบบฝึกจำลอง')}</Badge>}/>
    <Notice>{t('Targets, readings and precision scenarios are display fixtures. No quantities, instrument tolerance or chemical preparation are calculated.','เป้าหมาย ผลชั่ง และสถานะความแม่นยำเป็นข้อมูลตัวอย่าง ไม่มีการคำนวณปริมาณ ความคลาดเคลื่อนเครื่องมือ หรือการเตรียมสาร')}</Notice>
    {!writable&&<RoleBoundary lab/>}
    <Panel className="lab-history-selector"><label className="field"><span className="field-label">{t('Browse saved demo batches','ดูแบตช์จำลองที่บันทึกไว้')}</span><Dropdown className="select" aria-label={t('Browse saved demo batches','ดูแบตช์จำลองที่บันทึกไว้')} value={activeBatchId} onValueChange={value=>{const selected=batches.find(b=>b.id===value);if(!selected)return;setActiveBatchId(selected.id);setFormulaId(selected.formulaId);setVersionId(selected.version.id);setTarget(selected.target);setUnit(selected.unit);setInstrument(selected.instrument);setLots({...selected.lots});setScenario('normal');setError('');}}>{batches.map(b=><option key={b.id} value={b.id}>{b.id} · {b.formulaName} · v{b.version.number}</option>)}</Dropdown></label><p className="small muted">{t('Each batch keeps its pinned version, recorded readings and block history for this demo session. Creating another batch does not erase previous entries.','แต่ละแบตช์เก็บเวอร์ชัน ผลชั่ง และประวัติการบล็อกในรอบเดโมนี้ การสร้างแบตช์ใหม่ไม่ลบรายการก่อนหน้า')}</p></Panel>
    {hardBlocked&&<Notice tone="red"><strong>{t('Hard block · recording paused','บล็อก · หยุดการบันทึก')}</strong><p>{t('The BLOCK display scenario has been recorded. Switching the scenario does not clear this state. No actual safety rule has been evaluated.','บันทึกสถานะ BLOCK จำลองแล้ว การเปลี่ยนตัวเลือกไม่ยกเลิกการบล็อก และไม่มีการประเมินกฎความปลอดภัยจริง')}</p>{writable&&<button className="button secondary" onClick={()=>setRemediationOpen(true)}>{t('Review demo remediation','ดูขั้นตอนแก้ไขจำลอง')}</button>}</Notice>}
    <div className="lab-layout">
      <Panel>
        <div className="panel-heading"><div><span className="eyebrow">01 · {t('BATCH SETUP','ตั้งค่าแบตช์')}</span><h2>{t('Saved version & context','เวอร์ชันและข้อมูลแบตช์')}</h2></div><Icon name="layers"/></div>
        <div className="grid-2">
          <label className="field"><span className="field-label">{t('Formula','สูตร')}</span><Dropdown className="select" aria-label={t('Formula','สูตร')} value={formulaId} onValueChange={value=>{setFormulaId(value);setVersionId(formulas.find(f=>f.id===value)?.versions.at(-1)?.id||'');setLots({});}}>{formulas.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</Dropdown></label>
          <label className="field"><span className="field-label">{t('Saved version','เวอร์ชันที่บันทึก')}</span><Dropdown className="select" aria-label={t('Saved version','เวอร์ชันที่บันทึก')} value={currentVersion?.id||''} onValueChange={value=>setVersionId(value)}>{currentFormula?.versions.map(v=><option key={v.id} value={v.id}>v{v.number} · {v.createdLabel}</option>)}</Dropdown></label>
          <label className="field"><span className="field-label">{t('Declared batch target','ปริมาณเป้าหมาย')}</span><input className="input" inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)} disabled={!writable}/></label>
          <label className="field"><span className="field-label">{t('Target unit','หน่วยเป้าหมาย')}</span><Dropdown className="select" aria-label={t('Target unit','หน่วยเป้าหมาย')} value={unit} onValueChange={value=>setUnit(value)} disabled={!writable}><option value="g">g</option><option value="mL">mL</option></Dropdown></label>
        </div>
        <label className="field lab-spaced"><span className="field-label">{t('Instrument · explicit selection required','เครื่องมือ · ต้องเลือกด้วยตนเอง')}</span><Dropdown className="select" aria-label={t('Instrument · explicit selection required','เครื่องมือ · ต้องเลือกด้วยตนเอง')} value={instrument} onValueChange={value=>setInstrument(value)} disabled={!writable}><option value="">{t('Choose a demo instrument','เลือกเครื่องมือจำลอง')}</option>{instruments.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</Dropdown></label>
        <div className="lab-lots">{currentVersion?.ingredients.map(item=><label className="field" key={item.id}><span className="field-label">{materials.find(m=>m.id===item.materialId)?.name||item.materialId} · {t('lot','ล็อต')}</span><Dropdown className="select" aria-label={(materials.find(m=>m.id===item.materialId)?.name||item.materialId)+' · '+t('lot','ล็อต')} value={lots[item.materialId]||''} onValueChange={value=>setLots(old=>({...old,[item.materialId]:value}))} disabled={!writable}><option value="">{t('Choose a synthetic lot','เลือกล็อตจำลอง')}</option><option value={lotFor(item.materialId)}>{lotFor(item.materialId)}</option></Dropdown></label>)}</div>
        <div className="lab-panel-footer"><p className="small muted">{t('The pinned snapshot stays unchanged when a new formula version is saved.','เวอร์ชันที่อ้างอิงจะไม่เปลี่ยนเมื่อบันทึกสูตรเวอร์ชันใหม่')}</p><button className="button primary" disabled={!writable||hardBlocked} onClick={createBatch}><Icon name="plus" size={17}/>{t('Create demo batch','สร้างแบตช์จำลอง')}</button></div>
      </Panel>
      <Panel className="lab-batch-summary">
        <span className="eyebrow">{t('ACTIVE BATCH','แบตช์ที่เปิด')}</span>
        {batch?<><h2>{batch.formulaName}</h2><div className="row"><Badge tone="purple">v{batch.version.number}</Badge><span className="small muted">{batch.id}</span></div><div className="lab-target"><strong>{batch.target}</strong><span>{batch.unit}</span></div><span className="small muted">{t('Declared target · no conversion','เป้าหมายที่ระบุ · ไม่มีการแปลงหน่วย')}</span><hr/><div className="lab-summary-line"><span>{t('Recorded entries','รายการชั่ง')}</span><strong>{readings.length}</strong></div><div className="lab-summary-line"><span>{t('Preparation exercises','แบบฝึกเตรียมตัวอย่าง')}</span><strong>{preps.length}</strong></div><div className="lab-summary-line"><span>{t('Calculation status','สถานะการคำนวณ')}</span><Badge tone="amber">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge></div><div className="stack lab-spaced"><button className="button secondary" onClick={()=>setSheet('mixing')}><Icon name="file"/>{t('Mixing sheet preview','ตัวอย่างใบผสม')}</button><button className="button ghost" onClick={()=>setSheet('label')}><Icon name="file"/>{t('Lab label preview','ตัวอย่างฉลากแล็บ')}</button></div></>:<EmptyState title={t('No batch yet','ยังไม่มีแบตช์')} description={t('Choose a saved version to begin the exercise.','เลือกเวอร์ชันสูตรเพื่อเริ่มแบบฝึก')}/>}
      </Panel>
    </div>
    {error&&<div role="alert"><Notice tone="red">{error}</Notice></div>}
    <Panel>
      <div className="panel-heading"><div><span className="eyebrow">02 · {t('WEIGHING EXERCISE','แบบฝึกชั่ง')}</span><h2>{t('Component readings','ผลชั่งส่วนผสม')}</h2></div><label className="field lab-scenario"><span className="field-label">{t('Preset UI scenario','สถานะหน้าจอจำลอง')}</span><Dropdown className="select" aria-label={t('Preset UI scenario','สถานะหน้าจอจำลอง')} value={scenario} onValueChange={value=>setScenario(value as Scenario)} disabled={!writable}><option value="normal">NORMAL · display fixture</option><option value="warn">WARN · display fixture</option><option value="block">BLOCK · display fixture</option></Dropdown></label></div>
      <p className="small muted">{t('Preset readings below are unrelated to the declared batch target. Component targets require an approved model and return insufficient data.','ค่าตัวอย่างด้านล่างไม่คำนวณจากปริมาณเป้าหมาย การคำนวณส่วนผสมต้องใช้แบบจำลองที่อนุมัติ จึงแสดงข้อมูลไม่เพียงพอ')}</p>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>{t('Component','ส่วนผสม')}</th><th>{t('Saved input','ข้อมูลสูตร')}</th><th>{t('Latest display reading','ผลชั่งตัวอย่างล่าสุด')}</th><th>{t('State','สถานะ')}</th><th>{t('Record','บันทึก')}</th></tr></thead><tbody>{batch?.version.ingredients.map(item=>{const latest=readings.filter(r=>r.materialId===item.materialId).at(-1);return <tr key={item.id}><td><strong>{materials.find(m=>m.id===item.materialId)?.name||item.materialId}</strong><div className="small muted">{item.materialId}</div></td><td>{item.amount} <span className="muted">declared w/w %</span></td><td className="lab-number">{latest?`${latest.value} ${latest.unit}`:'—'}</td><td>{latest?<Badge tone={latest.scenario==='block'?'red':latest.scenario==='warn'?'amber':'green'}>{latest.scenario.toUpperCase()}</Badge>:<Badge>{t('Unrecorded','ยังไม่บันทึก')}</Badge>}</td><td><button className="button ghost lab-small-button" disabled={!writable||hardBlocked} onClick={()=>{if(latest){setReweighId(item.materialId);setReason('');setError('');}else record(item.materialId);}}>{latest?t('Reweigh','ชั่งซ้ำ'):t('Record fixture','บันทึกตัวอย่าง')}</button></td></tr>;})}</tbody></table></div>
      <div className="lab-panel-footer"><p className="small muted">{t('Measurements append to the trail; previous values are never overwritten.','ผลชั่งเพิ่มต่อท้ายประวัติ ไม่เขียนทับค่าเดิม')}</p><button className="button secondary" disabled={!writable||hardBlocked||!batch} onClick={()=>setPrepOpen(true)}>{t('Pre-dilution exercise','แบบฝึกเจือจางล่วงหน้า')}</button></div>
    </Panel>
    <Panel>
      <div className="panel-heading"><div><span className="eyebrow">03 · {t('TRACEABILITY','ประวัติย้อนหลัง')}</span><h2>{t('Append-only exercise trail','ประวัติแบบฝึกที่เพิ่มต่อท้าย')}</h2></div><Badge>{readings.length} {t('entries','รายการ')}</Badge></div>
      {readings.length?<div className="lab-trail">{[...readings].reverse().map(r=><div className="lab-trail-entry" key={r.id}><div className={`lab-trail-dot lab-dot-${r.scenario}`}/><div><strong>{r.at} · {r.materialId}</strong><p className="small">{r.value} {r.unit} · {r.instrument} · {r.lot}</p><p className="small muted">{r.reason}</p></div><Badge tone={r.scenario==='block'?'red':r.scenario==='warn'?'amber':'green'}>{r.scenario.toUpperCase()}</Badge></div>)}</div>:<div className="lab-empty"><Icon name="clock" size={24}/><p>{t('Record the first fixture to see its instrument, lot and history here.','บันทึกผลตัวอย่างแรกเพื่อดูเครื่องมือ ล็อต และประวัติที่นี่')}</p></div>}
      {!!remediations.length&&<div className="lab-preps">{remediations.map(s=><p className="small" key={s}><Icon name="check" size={15}/>{s}</p>)}</div>}
      {!!preps.length&&<div className="lab-preps">{preps.map(s=><p className="small" key={s}><Icon name="flask" size={15}/>{s}</p>)}</div>}
    </Panel>
    <Modal open={!!reweighId} onClose={()=>{setReweighId('');setError('');}} title={t('Append a reweigh entry','เพิ่มรายการชั่งซ้ำ')}><div className="stack"><p>{t('The original reading remains in the history. This records a preset synthetic value.','ผลชั่งเดิมยังอยู่ในประวัติ รายการนี้บันทึกค่าจำลองที่กำหนดไว้')}</p><label className="field"><span className="field-label">{t('Reason for this exercise','เหตุผลของแบบฝึกนี้')}</span><Dropdown className="select" aria-label={t('Reason for this exercise','เหตุผลของแบบฝึกนี้')} value={reason} onValueChange={value=>setReason(value)}><option value="">{t('Choose a demo reason','เลือกเหตุผลจำลอง')}</option><option value="Repeat display fixture after instrument check">{t('Repeat after instrument check','ชั่งซ้ำหลังตรวจเครื่องมือ')}</option><option value="Repeat display fixture after lot selection check">{t('Repeat after lot selection check','ชั่งซ้ำหลังตรวจล็อต')}</option></Dropdown></label>{error&&<Notice tone="red">{error}</Notice>}<button className="button primary" disabled={!writable||hardBlocked||!reason} onClick={()=>record(reweighId,true)}>{t('Append fixture reading','เพิ่มผลชั่งตัวอย่าง')}</button></div></Modal>
    <Modal open={remediationOpen} onClose={()=>setRemediationOpen(false)} title={t('Reviewed remediation · simulation','ตรวจขั้นตอนแก้ไข · จำลอง')}><div className="stack"><Notice tone="amber">{t('This exercises the blocked-state UI. It is not professional approval, a real tolerance check or a preparation instruction.','เป็นแบบฝึกหน้าจอเมื่อถูกบล็อก ไม่ใช่การอนุมัติ การตรวจความคลาดเคลื่อน หรือคำสั่งเตรียมสารจริง')}</Notice><ol className="lab-review-list"><li>{t('Inspect the synthetic blocked entry and its lot.','ดูรายการที่บล็อกและล็อตจำลอง')}</li><li>{t('Review the selected demonstration instrument.','ตรวจเครื่องมือจำลองที่เลือก')}</li><li>{t('Record this walkthrough and return to the NORMAL fixture.','บันทึกแบบฝึกและกลับสู่ตัวอย่าง NORMAL')}</li></ol><label className="lab-check"><input type="checkbox" checked={remediationChecked} onChange={e=>setRemediationChecked(e.target.checked)}/><span>{t('I reviewed this demo scenario.','ตรวจสถานการณ์จำลองแล้ว')}</span></label><button className="button primary" disabled={!writable||!remediationChecked} onClick={reviewRemediation}>{t('Record reviewed walkthrough','บันทึกการตรวจจำลอง')}</button></div></Modal>
    <Modal open={prepOpen} onClose={()=>setPrepOpen(false)} title={t('Pre-dilution · layout exercise','เจือจางล่วงหน้า · แบบฝึกหน้าจอ')}><div className="stack"><Notice>{t('Only a declared ratio is recorded. Stock strength, density, handling instructions and derived quantities are unavailable: insufficient data.','บันทึกเพียงอัตราส่วนที่ระบุ ไม่มีค่าความเข้มข้น ความหนาแน่น วิธีจัดการ หรือปริมาณที่คำนวณ: ข้อมูลไม่เพียงพอ')}</Notice><label className="field"><span className="field-label">{t('Synthetic material','วัตถุดิบจำลอง')}</span><Dropdown className="select" aria-label={t('Synthetic material','วัตถุดิบจำลอง')} value={prepMaterial} onValueChange={value=>setPrepMaterial(value)}>{materials.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</Dropdown></label><label className="field"><span className="field-label">{t('Declared ratio fixture','อัตราส่วนตัวอย่าง')}</span><Dropdown className="select" aria-label={t('Declared ratio fixture','อัตราส่วนตัวอย่าง')} value={prepRatio} onValueChange={value=>setPrepRatio(value)}><option>1:10</option><option>1:100</option></Dropdown></label><button className="button primary" disabled={!writable||hardBlocked} onClick={()=>{if(!writable||hardBlocked)return;setPreps(old=>[...old,`DEMO-PREP-${old.length+1} · ${prepMaterial} · declared ${prepRatio} · derived quantities: insufficient data`]);setPrepOpen(false);notify(t('Recorded a synthetic preparation exercise.','บันทึกแบบฝึกเตรียมตัวอย่างจำลองแล้ว'));}}>{t('Record exercise only','บันทึกแบบฝึกเท่านั้น')}</button></div></Modal>
    <Modal open={!!sheet} onClose={()=>setSheet(null)} title={sheet==='mixing'?t('Mixing sheet preview','ตัวอย่างใบผสม'):t('Lab label preview','ตัวอย่างฉลากแล็บ')}><div className="stack"><Notice>{t('A synthetic preview, not a production instruction or safety certificate. Download produces a text file; Print opens the browser print dialog.','ตัวอย่างจำลอง ไม่ใช่คำสั่งผลิตหรือใบรับรอง ดาวน์โหลดเป็นไฟล์ข้อความ และพิมพ์เปิดหน้าต่างพิมพ์ของเบราว์เซอร์')}</Notice>{batch&&<div className="lab-print-preview"><div className="eyebrow">DEMONSTRATION ONLY</div><h3>{sheet==='mixing'?'MIXING SHEET':'LAB SAMPLE'}</h3><strong>{batch.formulaName} · v{batch.version.number}</strong><p>{batch.id}</p><p>{t('Declared target','ปริมาณเป้าหมาย')}: {batch.target} {batch.unit}</p>{sheet==='mixing'&&<ul>{batch.version.ingredients.map(i=><li key={i.id}>{i.materialId} · {i.amount} declared w/w %</li>)}</ul>}<p>{t('Component target conversion: insufficient data.','การแปลงปริมาณส่วนผสม: ข้อมูลไม่เพียงพอ')}</p><span className="small">{t('No production release granted.','ไม่ได้อนุมัติสำหรับการผลิต')}</span></div>}<div className="row"><button className="button primary" onClick={()=>sheet&&downloadSheet(sheet)}><Icon name="download"/>{t('Download text preview','ดาวน์โหลดข้อความตัวอย่าง')}</button><button className="button secondary" onClick={()=>window.print()}>{t('Print preview','พิมพ์ตัวอย่าง')}</button></div></div></Modal>
  </div>;
}

const documentTypes={COA:{label:'CoA',subject:'lot'},GCMS:{label:'GC-MS',subject:'lot'},SDS:{label:'SDS',subject:'sku'},TDS:{label:'TDS',subject:'sku'},IFRA_CoC:{label:'IFRA certificate of conformity',subject:'sku'},allergen_declaration:{label:'Allergen declaration',subject:'sku'}} as const;
type DocumentType=keyof typeof documentTypes;
type DocumentSubject='sku'|'lot';
type DemoDoc={id:string;name:string;type:DocumentType;subjectType:DocumentSubject;subjectId:string;version:number;supersedesDocumentId?:string;status:'done'|'queued'|'scanning'|'parsing'|'rejected';expiry:string;source:string};
const documentFixtures:DemoDoc[]=[
  {id:'DEMO-D01',name:'sample-coa.txt',type:'COA',subjectType:'lot',subjectId:'DEMO-LOT-01',version:1,status:'done',expiry:'No verified expiry',source:'DEMO-SOURCE-D01'},
  {id:'DEMO-D02',name:'sample-sds.txt',type:'SDS',subjectType:'sku',subjectId:'DEMO-SKU02',version:1,status:'done',expiry:'No verified expiry',source:'DEMO-SOURCE-D02'},
  {id:'DEMO-D03',name:'sample-rejected-document.txt',type:'GCMS',subjectType:'lot',subjectId:'DEMO-LOT-03',version:1,status:'rejected',expiry:'Not applicable',source:'DEMO-SOURCE-D03'},
];

export function CompliancePage() {
  const {t,role,notify}=useDemo();
  const [docs,setDocs]=useState<DemoDoc[]>(()=>documentFixtures.map(d=>({...d})));
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('all');
  const [scenario,setScenario]=useState('incomplete');
  const [blocked,setBlocked]=useState(false);
  const [uploadOpen,setUploadOpen]=useState(false);
  const [subjectType,setSubjectType]=useState<DocumentSubject|''>('');
  const [subjectId,setSubjectId]=useState('');
  const [docType,setDocType]=useState<DocumentType|''>('');
  const [filename,setFilename]=useState('sample-typed-document.txt');
  const [uploadError,setUploadError]=useState('');
  const [preview,setPreview]=useState<DemoDoc|null>(null);
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);},[]);
  const writable=can(role,'document.write');
  if(!can(role,'read'))return <EmptyState title={t('Document access is pending','กำลังรอสิทธิ์ดูเอกสาร')} description={t('Public pages and the tutorial do not contain workspace documents.','หน้าสาธารณะและบทสอนไม่มีเอกสารของพื้นที่ทำงาน')}/>;
  const upload=()=>{
    if(!writable){notify(t('This persona cannot add demonstration documents.','บทบาทนี้เพิ่มเอกสารจำลองไม่ได้'));return;}
    if(!docType||!Object.hasOwn(documentTypes,docType)){setUploadError(t('Choose a supported document type.','เลือกประเภทเอกสารที่รองรับ'));return;}
    const expectedSubject=documentTypes[docType].subject;
    if(subjectType!==expectedSubject||!subjectId||!(expectedSubject==='lot'?/^DEMO-LOT-0[1-3]$/:/^DEMO-SKU0[1-3]$/).test(subjectId)){setUploadError(t('Wrong or missing subject: CoA/GC-MS require a lot; SDS/TDS/IFRA/allergen declarations require a SKU.','ข้อมูลอ้างอิงไม่ถูกต้อง: CoA/GC-MS ต้องใช้ล็อต ส่วน SDS/TDS/IFRA/เอกสารสารก่อภูมิแพ้ต้องใช้สินค้า'));return;}
    const id=`DEMO-D${Date.now()}`;
    setDocs(old=>{
      const earlier=old.filter(d=>d.type===docType&&d.subjectType===expectedSubject&&d.subjectId===subjectId).sort((a,b)=>b.version-a.version)[0];
      const next:DemoDoc={id,name:filename,type:docType,subjectType:expectedSubject,subjectId,version:(earlier?.version||0)+1,supersedesDocumentId:earlier?.id,status:'queued',expiry:'No verified expiry',source:`DEMO-SOURCE-D${String(old.length+1).padStart(2,'0')}`};
      return [next,...old];
    });
    setUploadOpen(false);setUploadError('');
    const update=(status:DemoDoc['status'])=>setDocs(old=>old.map(d=>d.id===id?{...d,status}:d));
    timers.current.push(setTimeout(()=>update('scanning'),700));
    if(filename.includes('rejected'))timers.current.push(setTimeout(()=>update('rejected'),1900));
    else {timers.current.push(setTimeout(()=>update('parsing'),1900));timers.current.push(setTimeout(()=>update('done'),3100));}
    notify(t('Started the simulated processing timeline. No file was uploaded.','เริ่มสถานะประมวลผลจำลอง ไม่มีการอัปโหลดไฟล์จริง'));
  };
  const filtered=docs.filter(d=>(filter==='all'||d.status===filter)&&`${d.name} ${documentTypes[d.type].label} ${d.subjectType} ${d.subjectId} ${d.source}`.toLowerCase().includes(query.toLowerCase()));
  const toneFor=(status:DemoDoc['status'])=>status==='rejected'?'red':status==='done'?'green':'amber';
  const versionChain=preview?docs.filter(d=>d.type===preview.type&&d.subjectType===preview.subjectType&&d.subjectId===preview.subjectId).sort((a,b)=>b.version-a.version):[];
  const superseded=docs.find(d=>d.id===preview?.supersedesDocumentId);
  return <div className="stack docs-page">
    <PageHeader eyebrow={t('EVIDENCE & DOCUMENTS','หลักฐานและเอกสาร')} title={t('Compliance & document vault','ข้อกำหนดและคลังเอกสาร')} description={t('Keep source evidence visible and review each jurisdiction independently.','แสดงหลักฐานและดูผลของแต่ละเขตอำนาจแยกกัน')} actions={<button className="button primary" disabled={!writable} onClick={()=>{setUploadOpen(true);setUploadError('');}}><Icon name="upload" size={17}/>{t('Simulate typed upload','จำลองเพิ่มเอกสาร')}</button>}/>
    <Notice>{t('All documents and source IDs are invented. No legal limits, regulatory certification, malware scan or document parser runs in this demo.','เอกสารและรหัสแหล่งข้อมูลทั้งหมดเป็นข้อมูลจำลอง เดโมไม่ตรวจข้อกฎหมาย ไม่รับรองความปลอดภัย ไม่สแกนไฟล์ และไม่แยกข้อมูลเอกสารจริง')}</Notice>
    {!writable&&<RoleBoundary/>}
    {blocked&&<Notice tone="red"><strong>{t('Persistent hard-block scenario','สถานการณ์บล็อกที่ยังคงอยู่')}</strong><p>{t('DEMO-RULE-BLOCK: invented display evidence. This cannot be dismissed or cleared by changing filters. A real resolution requires verified source evidence; this demo does not implement legal signoff.','DEMO-RULE-BLOCK: หลักฐานจำลอง เปลี่ยนตัวกรองหรือปิดข้อความไม่ได้ การแก้ไขจริงต้องมีหลักฐานที่ตรวจสอบแล้ว เดโมไม่มีการลงนามรับรองกฎหมาย')}</p></Notice>}
    <Panel>
      <div className="panel-heading"><div><span className="eyebrow">01 · {t('INDEPENDENT FINDINGS','ผลแยกตามเขตอำนาจ')}</span><h2>{t('Jurisdiction overview','ภาพรวมแต่ละเขตอำนาจ')}</h2></div><label className="field docs-scenario"><span className="field-label">{t('Display scenario','สถานการณ์หน้าจอ')}</span><Dropdown className="select" aria-label={t('Display scenario','สถานการณ์หน้าจอ')} value={scenario} onValueChange={value=>{setScenario(value);if(value==='blocked')setBlocked(true);}}><option value="incomplete">{t('Missing evidence','ขาดหลักฐาน')}</option><option value="complete">{t('Sample documents present','มีเอกสารตัวอย่างครบ')}</option><option value="blocked">{t('Hard-block layout','หน้าจอแบบบล็อก')}</option></Dropdown></label></div>
      <div className="grid-3 docs-jurisdictions">{[{code:'TH',name:t('Thailand','ประเทศไทย'),source:'DEMO-SOURCE-TH',detail:t('Local rule dataset has not been supplied.','ยังไม่มีชุดกฎที่ตรวจสอบแล้ว')},{code:'EU',name:t('European Union','สหภาพยุโรป'),source:'DEMO-SOURCE-EU',detail:t('Category-specific evidence is unavailable.','ไม่มีหลักฐานตามหมวดผลิตภัณฑ์')},{code:'US',name:t('United States','สหรัฐอเมริกา'),source:'DEMO-SOURCE-US',detail:t('Regional applicability needs verified sources.','ต้องตรวจแหล่งข้อมูลและขอบเขตการใช้')},{code:'ASEAN',name:t('ASEAN','อาเซียน'),source:'DEMO-SOURCE-ASEAN',detail:t('Regional and country applicability evidence is unavailable.','ไม่มีหลักฐานขอบเขตข้อกำหนดระดับภูมิภาคและรายประเทศ')}].map((j,index)=><article className="docs-jurisdiction" key={j.code}><div className="docs-country">{j.code}<span>{j.name}</span></div><Badge tone={blocked&&index===1?'red':'amber'}>{blocked&&index===1?t('BLOCK · UI fixture','BLOCK · ตัวอย่าง'):t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge><p className="small muted">{j.detail}</p><div className="docs-source">{j.source} · {t('synthetic','จำลอง')}</div></article>)}</div>
      <p className="small muted docs-footnote">{t('Document completeness is a separate checklist, not a compliance score or an automatic safety decision.','ความครบถ้วนของเอกสารเป็นรายการตรวจ ไม่ใช่คะแนนหรือผลตัดสินความปลอดภัย')}</p>
    </Panel>
    <div className="docs-evidence-layout">
      <Panel><div className="panel-heading"><div><span className="eyebrow">02 · {t('COMPLETENESS','ความครบถ้วน')}</span><h2>{t('Evidence checklist','รายการหลักฐาน')}</h2></div><Badge tone={scenario==='complete'?'green':'amber'}>{scenario==='complete'?t('Sample set present','มีชุดตัวอย่าง'):t('Evidence missing','ขาดหลักฐาน')}</Badge></div><div className="docs-checklist">{[{name:t('Supplier document','เอกสารผู้จำหน่าย'),source:'DEMO-D01',present:true},{name:t('Safety document','เอกสารความปลอดภัย'),source:'DEMO-D02',present:true},{name:t('Applicable rule & version','กฎที่ใช้และเวอร์ชัน'),source:scenario==='complete'?'DEMO-RULE-01':'Not supplied',present:scenario==='complete'},{name:t('Category and source applicability','หมวดและขอบเขตแหล่งข้อมูล'),source:scenario==='complete'?'DEMO-CATEGORY-01':'Not supplied',present:scenario==='complete'}].map(c=><div className="docs-check-item" key={c.name}><span className={`docs-check-icon ${c.present?'docs-present':''}`}><Icon name={c.present?'check':'alert'} size={17}/></span><div><strong>{c.name}</strong><span className="small muted">{c.source}</span></div><Badge tone={c.present?'neutral':'amber'}>{c.present?t('Sample present','มีตัวอย่าง'):t('Missing','ขาด')}</Badge></div>)}</div></Panel>
      <Panel className="docs-conclusion"><span className="eyebrow">{t('ACTUAL DEMO CONCLUSION','ข้อสรุปจริงของเดโม')}</span><Icon name="shield" size={36}/><h2>{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</h2><p className="muted">{t('Even a complete synthetic checklist cannot establish regulatory compliance. Approved rules, thresholds and valid source documents are required.','รายการจำลองที่ครบไม่ยืนยันว่าผ่านข้อกำหนด ต้องมีกฎ เกณฑ์ และเอกสารต้นทางที่ตรวจสอบแล้ว')}</p><Badge tone="amber">{t('No safety certificate','ไม่มีใบรับรองความปลอดภัย')}</Badge></Panel>
    </div>
    <Panel>
      <div className="panel-heading"><div><span className="eyebrow">03 · {t('DOCUMENT VAULT','คลังเอกสาร')}</span><h2>{t('Sample documents','เอกสารตัวอย่าง')}</h2></div><span className="small muted">{docs.length} {t('in-memory records','รายการในหน่วยความจำ')}</span></div>
      <div className="docs-toolbar"><label className="docs-search"><Icon name="search" size={18}/><input className="input" aria-label={t('Search sample documents','ค้นหาเอกสารตัวอย่าง')} value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('Search name, SKU, lot or source…','ค้นหาชื่อ สินค้า ล็อต หรือแหล่งข้อมูล…')}/></label><Dropdown className="select" aria-label={t('Filter document status','กรองสถานะเอกสาร')} value={filter} onValueChange={value=>setFilter(value)}><option value="all">{t('All statuses','ทุกสถานะ')}</option><option value="done">{t('Demo ready','ตัวอย่างพร้อม')}</option><option value="queued">Queued</option><option value="scanning">Simulated scan</option><option value="parsing">Simulated parse</option><option value="rejected">Rejected fixture</option></Dropdown></div>
      {filtered.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>{t('Document & source','เอกสารและแหล่งข้อมูล')}</th><th>{t('Subject','สินค้า / ล็อต')}</th><th>{t('Type','ประเภท')}</th><th>{t('Processing state','สถานะจำลอง')}</th><th>{t('Validity','ความถูกต้อง')}</th><th>{t('View','ดู')}</th></tr></thead><tbody>{filtered.map(d=><tr key={d.id}><td><strong>{d.name}</strong><div className="small muted">{d.source} · v{d.version}</div>{d.supersedesDocumentId&&<span className="docs-retained-note">Earlier version retained</span>}</td><td>{d.subjectId}<div className="small muted">{d.subjectType.toUpperCase()}</div></td><td>{documentTypes[d.type].label}</td><td><span aria-live="polite"><Badge tone={toneFor(d.status)}>{d.status==='done'?t('Demo ready','ตัวอย่างพร้อม'):d.status==='rejected'?t('Rejected fixture','ตัวอย่างถูกปฏิเสธ'):`${d.status} · simulated`}</Badge></span></td><td className="small muted">{d.expiry}</td><td><button className="button ghost lab-small-button" disabled={d.status!=='done'&&d.status!=='rejected'} onClick={()=>setPreview(d)}>{t('Details','รายละเอียด')}</button></td></tr>)}</tbody></table></div>:<EmptyState title={t('No matching documents','ไม่มีเอกสารที่ตรงกัน')} description={t('Try a different search or status filter.','ลองคำค้นหาหรือตัวกรองอื่น')} action={<button className="button secondary" onClick={()=>{setQuery('');setFilter('all');}}>{t('Clear filters','ล้างตัวกรอง')}</button>}/>}
    </Panel>
    <Modal open={uploadOpen} onClose={()=>setUploadOpen(false)} title={t('Typed upload · simulation','เพิ่มเอกสารตามประเภท · จำลอง')}>
      <div className="stack">
        <Notice>{t('Select an embedded sample. No real file, personal information or network upload is accepted. Processing states run on a local timer.','เลือกตัวอย่างที่ฝังอยู่ ไม่มีไฟล์จริง ข้อมูลบุคคล หรือการส่งข้อมูล สถานะประมวลผลใช้เวลาจำลองในเครื่อง')}</Notice>
        <label className="field"><span className="field-label">{t('Document type','ประเภทเอกสาร')}</span><Dropdown className="select" aria-label={t('Document type','ประเภทเอกสาร')} value={docType} onValueChange={value=>{const next=value as DocumentType|'';setDocType(next);setSubjectType(next?documentTypes[next].subject:'');setSubjectId('');setUploadError('');}}><option value="">{t('Choose document type first','เลือกประเภทเอกสารก่อน')}</option>{Object.entries(documentTypes).map(([value,type])=><option value={value} key={value}>{type.label}</option>)}</Dropdown></label>
        <div className="grid-2">
          <label className="field"><span className="field-label">{t('Subject type','ประเภทข้อมูลอ้างอิง')}</span><Dropdown className="select" aria-label={t('Subject type','ประเภทข้อมูลอ้างอิง')} value={subjectType} disabled={!docType} onValueChange={value=>{setSubjectType(value as DocumentSubject|'');setSubjectId('');}}><option value="">{t('Choose document type first','เลือกประเภทเอกสารก่อน')}</option><option value="sku" disabled={!!docType&&documentTypes[docType].subject!=='sku'}>SKU</option><option value="lot" disabled={!!docType&&documentTypes[docType].subject!=='lot'}>{t('Lot','ล็อต')}</option></Dropdown></label>
          <label className="field"><span className="field-label">{subjectType==='lot'?t('Lot subject','ล็อตที่อ้างอิง'):t('SKU subject','สินค้าที่อ้างอิง')}</span><Dropdown className="select" aria-label={subjectType==='lot'?t('Lot subject','ล็อตที่อ้างอิง'):t('SKU subject','สินค้าที่อ้างอิง')} value={subjectId} disabled={!docType||!subjectType} onValueChange={value=>setSubjectId(value)}><option value="">{t('Choose synthetic subject','เลือกข้อมูลอ้างอิงจำลอง')}</option>{subjectType&&[1,2,3].map(i=><option key={i} value={subjectType==='lot'?`DEMO-LOT-0${i}`:`DEMO-SKU0${i}`}>{subjectType==='lot'?`DEMO-LOT-0${i}`:`DEMO-SKU0${i}`}</option>)}</Dropdown></label>
        </div>
        <p className="small muted">{t('CoA / GC-MS → lot. SDS / TDS / IFRA certificate of conformity / allergen declaration → SKU. The mutation handler rejects a wrong subject again.','CoA / GC-MS → ล็อต ส่วน SDS / TDS / IFRA / เอกสารสารก่อภูมิแพ้ → สินค้า การบันทึกตรวจประเภทที่อ้างอิงซ้ำอีกครั้ง')}</p>
        <label className="field"><span className="field-label">{t('Embedded sample file','ไฟล์ตัวอย่างที่ฝังอยู่')}</span><Dropdown className="select" aria-label={t('Embedded sample file','ไฟล์ตัวอย่างที่ฝังอยู่')} value={filename} onValueChange={value=>setFilename(value)}><option>sample-typed-document.txt</option><option>sample-rejected-document.txt</option></Dropdown></label>
        {uploadError&&<div role="alert"><Notice tone="red">{uploadError}</Notice></div>}
        <button className="button primary" disabled={!writable} onClick={upload}>{t('Start processing simulation','เริ่มประมวลผลจำลอง')}</button>
      </div>
    </Modal>
    <Modal open={!!preview} onClose={()=>setPreview(null)} title={t('Synthetic document details','รายละเอียดเอกสารจำลอง')}>
      <div className="stack">{preview&&<>
        <div className="docs-preview-icon"><Icon name="file" size={32}/></div><h3>{preview.name}</h3>
        <div className="row"><Badge tone="purple">v{preview.version}</Badge><Badge tone={toneFor(preview.status)}>{preview.status==='done'?'Demo ready':'Rejected fixture'}</Badge></div>
        <dl className="docs-detail-list"><dt>{t('Source','แหล่งข้อมูล')}</dt><dd>{preview.source}</dd><dt>{t('Subject','สินค้า')}</dt><dd>{preview.subjectType.toUpperCase()} · {preview.subjectId}</dd><dt>{t('Document type','ประเภท')}</dt><dd>{documentTypes[preview.type].label}</dd><dt>{t('Document version','เวอร์ชันเอกสาร')}</dt><dd>v{preview.version}</dd><dt>{t('Supersedes','อ้างอิงเวอร์ชันก่อนหน้า')}</dt><dd>{superseded?`${superseded.id} · v${superseded.version} · ${superseded.source}`:t('Initial synthetic version','เวอร์ชันจำลองแรก')}</dd><dt>{t('Verified validity','ความถูกต้องที่ตรวจสอบ')}</dt><dd>{t('Unavailable','ไม่มีข้อมูล')}</dd></dl>
        <div className="docs-version-history"><h3>{t('Retained version history','ประวัติเวอร์ชันที่เก็บไว้')}</h3><p className="small muted">{t('New uploads append a version with an earlier-record link. Earlier documents stay available; this mock linkage does not approve document content.','เอกสารใหม่เพิ่มเวอร์ชันและลิงก์ไปยังรายการก่อนหน้า เอกสารเดิมยังเปิดดูได้ ลิงก์จำลองนี้ไม่ใช่การอนุมัติเนื้อหา')}</p><div className="docs-version-chain">{versionChain.map(d=><button key={d.id} className={`button ${d.id===preview.id?'secondary':'ghost'}`} disabled={d.id===preview.id||!['done','rejected'].includes(d.status)} onClick={()=>setPreview(d)}>v{d.version} · {d.source}{d.id===preview.id&&<Icon name="check" size={15}/>}</button>)}</div></div>
        <Notice tone={preview.status==='rejected'?'red':'neutral'}>{preview.status==='rejected'?t('The rejection is a predetermined UI fixture. No scanner examined a real file.','สถานะปฏิเสธเป็นตัวอย่างหน้าจอ ไม่มีการสแกนไฟล์จริง'):t('This embedded example contains no real supplier data, safety limits or regulatory evidence.','ตัวอย่างนี้ไม่มีข้อมูลผู้จำหน่าย เกณฑ์ความปลอดภัย หรือหลักฐานกฎหมายจริง')}</Notice>
        <button className="button secondary" disabled={preview.status!=='done'} onClick={()=>{downloadDemo(`DEMO-v${preview.version}-${preview.name}`,{label:'SYNTHETIC DOCUMENT ONLY',source:preview.source,subjectType:preview.subjectType,subjectId:preview.subjectId,type:preview.type,version:preview.version,supersedesDocumentId:preview.supersedesDocumentId||null,supersedesSource:superseded?.source||null,conclusion:'insufficient data',legalEvidence:false});notify(t('Downloaded the synthetic document metadata.','ดาวน์โหลดข้อมูลเอกสารจำลองแล้ว'));}}><Icon name="download"/>{t('Download sample metadata','ดาวน์โหลดข้อมูลตัวอย่าง')}</button>
      </>}</div>
    </Modal>
  </div>;
}

type ReferenceRow={id:string;name:string;detail:string;scope:string};
const referenceSets:Record<string,ReferenceRow[]>={
  Materials:materials.map(m=>({id:m.id,name:m.name,detail:`${m.family} · display family only`,scope:'Embedded synthetic fixture'})),
  Vehicles:[{id:'DEMO-V01',name:'Demo vehicle A',detail:'Physical properties: insufficient data',scope:'Synthetic organisation reference'},{id:'DEMO-V02',name:'Demo vehicle B',detail:'Physical properties: insufficient data',scope:'Synthetic organisation reference'}],
  Categories:[{id:'DEMO-C01',name:'Demo application A',detail:'No regulatory category mapping supplied',scope:'Display category only'},{id:'DEMO-C02',name:'Demo application B',detail:'No regulatory category mapping supplied',scope:'Display category only'}],
  'SKUs & lots':[1,2,3,4].map(i=>({id:`DEMO-SKU0${i}`,name:`Demo stock ${String(i).padStart(2,'0')}`,detail:`DEMO-LOT-0${i} · no verified supplier evidence`,scope:'Synthetic organisation reference'})),
  Instruments:instruments.map(i=>({id:i.id,name:i.name,detail:'Precision, calibration and suitability: insufficient data',scope:'Synthetic laboratory reference'})),
};
export function ReferencesPage() {
  const {t,role}=useDemo();
  const [tab,setTab]=useState('Materials');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<ReferenceRow|null>(null);
  if(!can(role,'read'))return <EmptyState title={t('Reference access is pending','กำลังรอสิทธิ์ดูข้อมูลอ้างอิง')} description={t('The tutorial uses separate embedded examples.','บทสอนใช้ตัวอย่างที่แยกจากข้อมูลอ้างอิง')}/>;
  const rows=referenceSets[tab].filter(r=>`${r.id} ${r.name} ${r.detail}`.toLowerCase().includes(query.toLowerCase()));
  const names:Record<string,string>={Materials:'วัตถุดิบ',Vehicles:'ตัวพา',Categories:'หมวดการใช้','SKUs & lots':'สินค้าและล็อต',Instruments:'เครื่องมือ'};
  return <div className="stack ref-page">
    <PageHeader eyebrow={t('REFERENCE LIBRARY','คลังข้อมูลอ้างอิง')} title={t('Study references','ข้อมูลอ้างอิงของการศึกษา')} description={t('Browse the synthetic inputs and their evidence boundaries.','ดูข้อมูลจำลองและขอบเขตของหลักฐาน')} actions={<Badge>{t('Read-only','ดูอย่างเดียว')}</Badge>}/>
    <Notice>{t('These invented records demonstrate browsing only. The owner’s material dataset, properties, rules and thresholds are absent. Reference editing is outside this MVP.','รายการจำลองเหล่านี้ใช้สาธิตการดูข้อมูล ไม่มีชุดวัตถุดิบ คุณสมบัติ กฎ หรือเกณฑ์ของเจ้าของ การแก้ไขข้อมูลอ้างอิงอยู่นอก MVP')}</Notice>
    <Panel>
      <div className="tabs ref-tabs" role="tablist" aria-label={t('Reference types','ประเภทข้อมูลอ้างอิง')}>{Object.keys(referenceSets).map((name,index,array)=><button key={name} role="tab" id={`ref-tab-${index}`} aria-controls="ref-results" aria-selected={tab===name} tabIndex={tab===name?0:-1} className={`tab ${tab===name?'active':''}`} onClick={()=>{setTab(name);setQuery('');}} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?array.length-1:(index+(e.key==='ArrowRight'?1:-1)+array.length)%array.length;setTab(array[n]);setQuery('');document.getElementById(`ref-tab-${n}`)?.focus();}}}>{t(name,names[name])}</button>)}</div>
      <div className="ref-toolbar"><div><h2>{t(tab,names[tab])}</h2><p className="small muted">{referenceSets[tab].length} {t('synthetic references','รายการอ้างอิงจำลอง')}</p></div><label className="docs-search"><Icon name="search" size={18}/><input className="input" value={query} onChange={e=>setQuery(e.target.value)} aria-label={t('Search references','ค้นหาข้อมูลอ้างอิง')} placeholder={t('Search name or identifier…','ค้นหาชื่อหรือรหัส…')}/></label></div>
      <div role="tabpanel" id="ref-results" aria-labelledby={`ref-tab-${Object.keys(referenceSets).indexOf(tab)}`} tabIndex={0}>{rows.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>{t('Reference','รายการอ้างอิง')}</th><th>{t('Available information','ข้อมูลที่มี')}</th><th>{t('Scope','ขอบเขต')}</th><th>{t('View','ดู')}</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><div className="ref-name"><span className="ref-icon"><Icon name={tab==='Materials'?'flask':tab==='Instruments'?'layers':'book'} size={19}/></span><div><strong>{r.name}</strong><div className="small muted">{r.id}</div></div></div></td><td className="small muted">{r.detail}</td><td><Badge>{t('Synthetic','จำลอง')}</Badge></td><td><button className="button ghost lab-small-button" onClick={()=>setSelected(r)}>{t('Details','รายละเอียด')}</button></td></tr>)}</tbody></table></div>:<EmptyState title={t('No matching references','ไม่พบข้อมูลอ้างอิง')} description={t('Try a shorter search or another reference type.','ลองคำค้นหาที่สั้นขึ้นหรือข้อมูลอีกประเภท')} action={<button className="button secondary" onClick={()=>setQuery('')}>{t('Clear search','ล้างคำค้น')}</button>}/>}</div>
    </Panel>
    <div className="grid-3 ref-footers"><Panel><Icon name="lock"/><h3>{t('Scoped access','สิทธิ์ตามขอบเขต')}</h3><p className="small muted">{t('Production access needs server-side permission and record checks. This persona switch only demonstrates presentation.','ระบบจริงต้องตรวจสิทธิ์และข้อมูลที่เซิร์ฟเวอร์ การสลับบทบาทนี้สาธิตหน้าจอเท่านั้น')}</p></Panel><Panel><Icon name="book"/><h3>{t('Visible source boundaries','ขอบเขตข้อมูลที่ชัดเจน')}</h3><p className="small muted">{t('Missing properties remain missing. No fixture is treated as expert-approved evidence.','คุณสมบัติที่ไม่มีจะแสดงว่าขาดข้อมูล ไม่ถือว่าตัวอย่างผ่านการตรวจจากผู้เชี่ยวชาญ')}</p></Panel><Panel><Icon name="layers"/><h3>{t('Read-only MVP','MVP สำหรับดูข้อมูล')}</h3><p className="small muted">{t('Material and instrument editors are deferred. Document upload is available separately to authorised personas.','ยังไม่มีตัวแก้ไขวัตถุดิบหรือเครื่องมือ การเพิ่มเอกสารแยกอยู่ในหน้าคลังเอกสารตามสิทธิ์')}</p></Panel></div>
    <Modal open={!!selected} onClose={()=>setSelected(null)} title={t('Reference details','รายละเอียดอ้างอิง')}><div className="stack">{selected&&<><Badge tone="purple">{selected.id}</Badge><h3>{selected.name}</h3><p>{selected.detail}</p><dl className="docs-detail-list"><dt>{t('Scope','ขอบเขต')}</dt><dd>{selected.scope}</dd><dt>{t('Verified properties','คุณสมบัติที่ตรวจสอบ')}</dt><dd>{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</dd><dt>{t('Source status','สถานะแหล่งข้อมูล')}</dt><dd>{t('Invented demo fixture','ข้อมูลตัวอย่างที่แต่งขึ้น')}</dd></dl><Notice>{t('This reference cannot support a chemical interaction, a weighing tolerance or a compliance decision.','รายการนี้ไม่สามารถใช้สรุปปฏิกิริยาระหว่างสาร เกณฑ์ความคลาดเคลื่อนการชั่ง หรือผลข้อกำหนดได้')}</Notice></>}</div></Modal>
  </div>;
}
