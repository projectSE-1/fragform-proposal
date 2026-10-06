// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Reference data: the system datasets the engine calculates with, one active version per category.
// Every role can read; only the system_admin persona can upload, activate or delete (a demo check,
// not security). User formulas never appear on this page.
'use client';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDemo} from '../lib/demo-context';
import {downloadDemo} from '../lib/model';
import {columnsOf, KEY_COLUMNS, mockRows, rulesFor, toLimitRules} from '../lib/reference';
import type {Category, CheckReport, DatasetRow, LimitRule} from '../lib/reference';
import type {ReferenceView, VersionMeta} from '../lib/reference-store';
import {referenceApi} from '../lib/reference-client';
import {toCsv} from '../lib/csv';
import {Badge, EmptyState, Icon, Notice, PageHeader, Panel} from './ui';
import './reference-data.css';

const PAGE_SIZE = 25;
const CATEGORY_COPY: Record<Category, {en: string; th: string; descEn: string; descTh: string}> = {
  materials: {en: 'Material data', th: 'ข้อมูลวัตถุดิบ', descEn: 'One row per substance, in the owner\'s 34-column format. Feeds the material list, odour families, perceived strength and evaporation.', descTh: 'หนึ่งแถวต่อสาร ตามรูปแบบ 34 คอลัมน์ของเจ้าของ ใช้กับรายการวัตถุดิบ หมวดกลิ่น ความแรงที่รับรู้ และการระเหย'},
  limits: {en: 'Regulatory limits', th: 'เกณฑ์ตามกฎหมาย', descEn: 'One row per limit: substance, product category, restriction and the law or standard it comes from. Feeds the limit check.', descTh: 'หนึ่งแถวต่อเกณฑ์: สาร หมวดผลิตภัณฑ์ ข้อจำกัด และกฎหมายหรือมาตรฐานที่มา ใช้กับการตรวจเกณฑ์'},
};
const shortDate = (iso: string | null) => iso ? new Date(iso).toLocaleString(undefined, {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '—';

export function ReferenceDataPage() {
  const {role, t, notify, reloadReference} = useDemo();
  const admin = role === 'system_admin';
  const [category, setCategory] = useState<Category>('materials');
  const [index, setIndex] = useState<ReferenceView | null>(null);
  const [loadError, setLoadError] = useState('');
  const [viewingId, setViewingId] = useState('');
  const [rows, setRows] = useState<DatasetRow[] | null>(null);
  const [activeRules, setActiveRules] = useState<LimitRule[]>([]);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [ref, active] = await Promise.all([referenceApi.index(), referenceApi.active()]);
      setIndex(ref); setActiveRules(toLimitRules(active.limits.rows)); setLoadError('');
      if (ref.recovered) notify(ref.recovered);
      return ref;
    } catch (e) { setLoadError((e as Error).message); return null; }
  }, [notify]);
  useEffect(() => { void refresh(); }, [refresh]);

  const versions = index?.versions.filter(v => v.category === category) ?? [];
  const activeId = index?.active[category] ?? '';
  const viewing = versions.find(v => v.id === viewingId) ?? versions.find(v => v.id === activeId);
  useEffect(() => {
    if (!viewing) return;
    let live = true; setRows(null);
    referenceApi.rows(viewing.id).then(r => { if (live) setRows(r); }).catch(e => { if (live) { setRows([]); notify((e as Error).message); } });
    return () => { live = false; };
  }, [viewing?.id, notify]); // eslint-disable-line react-hooks/exhaustive-deps

  const after = async (message: [string, string]) => { await refresh(); reloadReference(); notify(t(...message)); };
  async function activate(v: VersionMeta) {
    if (!index || !admin) return;
    setBusy(true);
    try { await referenceApi.activate(role, index.revision, category, v.id); await after([`${v.label} is now the active ${CATEGORY_COPY[category].en.toLowerCase()}.`, `${v.label} เป็น${CATEGORY_COPY[category].th}ที่ใช้งานอยู่แล้ว`]); }
    catch (e) { notify((e as Error).message); await refresh(); }
    setBusy(false);
  }
  async function remove(v: VersionMeta) {
    if (!index || !admin) return;
    setBusy(true); setConfirmDelete('');
    try { await referenceApi.remove(role, index.revision, v.id); if (viewingId === v.id) setViewingId(''); await after([`${v.label} deleted. Its file was moved to data/backups/datasets.`, `ลบ ${v.label} แล้ว ไฟล์ถูกย้ายไปที่ data/backups/datasets`]); }
    catch (e) { notify((e as Error).message); await refresh(); }
    setBusy(false);
  }

  const copy = CATEGORY_COPY[category];
  return <div className="ref-page">
    <PageHeader eyebrow={t('SYSTEM DATA', 'ข้อมูลระบบ')} title={t('Reference data', 'ข้อมูลอ้างอิง')}
      description={t('The material properties and regulatory limits the engine calculates with, one active version per category. User formulas are not shown here.', 'คุณสมบัติวัตถุดิบและเกณฑ์ตามกฎหมายที่ระบบใช้คำนวณ ใช้งานได้ครั้งละหนึ่งเวอร์ชันต่อหมวด หน้านี้ไม่แสดงสูตรของผู้ใช้')}
      actions={<Badge tone={admin ? 'purple' : 'neutral'}>{admin ? t('system_admin: can change', 'system_admin: แก้ไขได้') : t('Read only', 'อ่านอย่างเดียว')}</Badge>}/>
    <Notice tone="amber">{t('Single-computer demo. Only the system_admin persona can upload or switch versions, and anyone at this keyboard can pick that persona: this is not security. Data stays in demo/data on this computer. Never show the owner\'s real data on a shared screen or in slides.', 'เดโมสำหรับเครื่องเดียว เฉพาะบทบาท system_admin ที่อัปโหลดหรือสลับเวอร์ชันได้ และใครที่ใช้เครื่องนี้ก็เลือกบทบาทนั้นได้ จึงไม่ใช่ระบบความปลอดภัย ข้อมูลอยู่ใน demo/data ของเครื่องนี้ ห้ามแสดงข้อมูลจริงของเจ้าของบนจอที่คนอื่นเห็นหรือในสไลด์')}</Notice>

    <div className="tabs" role="tablist" aria-label={t('Data category', 'หมวดข้อมูล')}>
      {(['materials', 'limits'] as Category[]).map(c => <button key={c} role="tab" aria-selected={category === c} className={`tab ${category === c ? 'active' : ''}`}
        onClick={() => { setCategory(c); setViewingId(''); setConfirmDelete(''); }}>{t(CATEGORY_COPY[c].en, CATEGORY_COPY[c].th)}</button>)}
    </div>
    <p className="muted small ref-category-desc">{t(copy.descEn, copy.descTh)}</p>

    {loadError ? <Notice tone="red">{t(`Reference data could not be loaded: ${loadError}`, `โหลดข้อมูลอ้างอิงไม่ได้: ${loadError}`)}</Notice> : !index ? <p className="muted">{t('Loading…', 'กำลังโหลด…')}</p> : <>
      <Panel>
        <div className="panel-heading"><div><h2>{t('Versions', 'เวอร์ชัน')}</h2><p className="muted small">{t('The active version is what every formula is checked against. Uploads start inactive.', 'เวอร์ชันที่ใช้งานอยู่คือข้อมูลที่ทุกสูตรใช้ตรวจ ไฟล์ที่อัปโหลดเริ่มต้นแบบยังไม่ใช้งาน')}</p></div></div>
        <div className="table-wrap"><table className="data-table ref-versions">
          <thead><tr><th scope="col">{t('Version', 'เวอร์ชัน')}</th><th scope="col">{t('File', 'ไฟล์')}</th><th scope="col">{t('Uploaded', 'อัปโหลดเมื่อ')}</th><th scope="col">{t('Rows', 'แถว')}</th><th scope="col">{t('Status', 'สถานะ')}</th><th scope="col"><span className="sr-only">{t('Actions', 'การทำงาน')}</span></th></tr></thead>
          <tbody>{versions.map(v => {
            const active = v.id === activeId;
            return <tr key={v.id} className={viewing?.id === v.id ? 'ref-viewing' : ''}>
              <td><strong>{v.builtIn ? t('Mock (built-in)', 'ข้อมูลจำลอง (ในตัว)') : t(v.label, `อัปโหลด v${v.number}`)}</strong>{v.builtIn && <span className="small muted ref-sub">{t('Invented demo data', 'ข้อมูลสาธิตที่แต่งขึ้น')}</span>}</td>
              <td className="ref-file">{v.fileName ?? '—'}{v.sha256 && <span className="small muted ref-sub" title={v.sha256}>sha256 {v.sha256.slice(0, 12)}…</span>}</td>
              <td className="muted">{shortDate(v.uploadedAt)}</td>
              <td className="ref-num">{v.rows}</td>
              <td>{active ? <Badge tone="green"><Icon name="check" size={12}/>{t('Active', 'ใช้งานอยู่')}</Badge> : <Badge>{t('Inactive', 'ไม่ได้ใช้งาน')}</Badge>}{v.warningCount > 0 && <span className="small muted ref-sub">{t(`${v.warningCount} warnings at upload`, `คำเตือน ${v.warningCount} รายการตอนอัปโหลด`)}</span>}</td>
              <td className="ref-actions">
                <button className="button ghost" onClick={() => setViewingId(v.id)} aria-pressed={viewing?.id === v.id}>{t('View', 'ดู')}</button>
                {admin && !active && <button className="button secondary" disabled={busy} onClick={() => activate(v)}>{t('Activate', 'ใช้งาน')}</button>}
                {admin && !active && !v.builtIn && (confirmDelete === v.id
                  ? <span className="ref-confirm">{t('Delete?', 'ลบ?')} <button className="button ghost danger" disabled={busy} onClick={() => remove(v)}>{t('Yes, delete', 'ลบ')}</button><button className="button ghost" onClick={() => setConfirmDelete('')}>{t('No', 'ไม่')}</button></span>
                  : <button className="icon-button" aria-label={t(`Delete ${v.label}`, `ลบ ${v.label}`)} title={t('Delete', 'ลบ')} onClick={() => setConfirmDelete(v.id)}><Icon name="trash" size={16}/></button>)}
              </td>
            </tr>;
          })}</tbody>
        </table></div>
      </Panel>

      {admin ? <UploadPanel category={category} index={index} onSaved={async (label) => { const ref = await refresh(); const v = ref?.versions.find(x => x.category === category && x.label === label); if (v) setViewingId(v.id); notify(t(`${label} saved. It is inactive until you activate it.`, `บันทึก ${label} แล้ว จะใช้งานเมื่อกดใช้งานเท่านั้น`)); }}/>
        : <Notice>{t('Uploading and switching versions needs the system_admin persona (top-right menu).', 'การอัปโหลดและสลับเวอร์ชันต้องใช้บทบาท system_admin (เมนูมุมขวาบน)')}</Notice>}

      {viewing && <DataViewer category={category} version={viewing} active={viewing.id === activeId} rows={rows} activeRules={activeRules}
        limitsLabel={index.versions.find(v => v.id === index.active.limits)?.label ?? ''}/>}
    </>}
  </div>;
}

function UploadPanel({category, index, onSaved}: {category: Category; index: ReferenceView; onSaved: (label: string) => void}) {
  const {role, t} = useDemo();
  const [file, setFile] = useState<{name: string; text: string} | null>(null);
  const [report, setReport] = useState<CheckReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const next = Math.max(0, ...index.versions.filter(v => v.category === category && !v.builtIn).map(v => v.number)) + 1;
  useEffect(() => { setFile(null); setReport(null); setError(''); }, [category]);

  async function choose(input: HTMLInputElement) {
    const picked = input.files?.[0]; setReport(null); setError('');
    if (!picked) { setFile(null); return; }
    if (picked.size > 5 * 1024 * 1024) { setFile(null); setError(t('The file is larger than 5 MB.', 'ไฟล์ใหญ่กว่า 5 MB')); return; }
    setFile({name: picked.name, text: await picked.text()});
  }
  async function check() {
    if (!file) return;
    setBusy(true); setError('');
    try { setReport(await referenceApi.check(role, category, file.text)); } catch (e) { setError((e as Error).message); }
    setBusy(false);
  }
  async function save() {
    if (!file || !report || report.errorCount) return;
    setBusy(true); setError('');
    try { await referenceApi.upload(role, index.revision, category, file.name, file.text); setFile(null); setReport(null); onSaved(`Uploaded v${next}`); }
    catch (e) { setError((e as Error).message); }
    setBusy(false);
  }
  const template = () => downloadDemo(`${category}-template.csv`, toCsv([[...columnsOf(category)]]));
  // The built-in mock as a CSV in the upload format: invented values, for practising the flow.
  const sample = () => downloadDemo(`${category}-mock-sample.csv`, toCsv([[...columnsOf(category)], ...mockRows(category).map(r => columnsOf(category).map(c => r[c] ?? ''))]));
  const engineColumns = KEY_COLUMNS[category];

  return <Panel className="ref-upload">
    <div className="panel-heading"><div><h2>{t(`Upload a new version (v${next})`, `อัปโหลดเวอร์ชันใหม่ (v${next})`)}</h2>
      <p className="muted small">{t('CSV with the header row from the template. Check first; only a file with no errors can be saved. Saving never activates it.', 'ไฟล์ CSV ที่มีหัวตารางตามแม่แบบ ตรวจก่อน บันทึกได้เฉพาะไฟล์ที่ไม่มีข้อผิดพลาด และการบันทึกไม่ได้เปิดใช้งานทันที')}</p></div>
      <div className="row"><button className="button ghost" onClick={template}><Icon name="download" size={15}/>{t('Template', 'แม่แบบ')}</button><button className="button ghost" onClick={sample}><Icon name="download" size={15}/>{t('Mock as CSV', 'ข้อมูลจำลองเป็น CSV')}</button></div></div>
    <div className="ref-upload-row">
      <label className="button secondary ref-file-pick"><Icon name="upload" size={16}/>{file ? file.name : t('Choose CSV file', 'เลือกไฟล์ CSV')}<input type="file" accept=".csv,text/csv" className="sr-only" onChange={e => void choose(e.currentTarget)}/></label>
      <button className="button secondary" disabled={!file || busy} onClick={check}>{t('Check file', 'ตรวจไฟล์')}</button>
      <button className="button primary" disabled={!report || report.errorCount > 0 || busy} onClick={save}>{t(`Save as v${next}`, `บันทึกเป็น v${next}`)}</button>
    </div>
    {error && <div role="alert"><Notice tone="red">{error}</Notice></div>}
    {report && <div className="ref-report" aria-live="polite">
      <div className="ref-report-summary">
        <Badge tone={report.errorCount ? 'red' : 'green'}>{report.errorCount ? t(`${report.errorCount} errors: cannot save`, `ข้อผิดพลาด ${report.errorCount} รายการ: บันทึกไม่ได้`) : t('No errors: ready to save', 'ไม่มีข้อผิดพลาด: บันทึกได้')}</Badge>
        <span>{t(`${report.rows} rows`, `${report.rows} แถว`)}</span>
        <span>{t(`${report.columns.found.length} of ${columnsOf(category).length} columns found`, `พบ ${report.columns.found.length} จาก ${columnsOf(category).length} คอลัมน์`)}</span>
        {report.warningCount > 0 && <Badge tone="amber">{t(`${report.warningCount} warnings`, `คำเตือน ${report.warningCount} รายการ`)}</Badge>}
      </div>
      {report.coverage.length > 0 && <div className="ref-coverage">{engineColumns.filter(c => report.coverage.some(x => x.column === c)).map(c => {
        const filled = report.coverage.find(x => x.column === c)!.filled;
        return <div key={c}><span>{c}</span><div className="ref-bar"><span style={{width: `${report.rows ? filled / report.rows * 100 : 0}%`}}/></div><span className="ref-num">{filled}/{report.rows}</span></div>;
      })}</div>}
      {[...report.errors.map(i => ({...i, kind: 'error' as const})), ...report.warnings.map(i => ({...i, kind: 'warning' as const}))].length > 0 &&
        <div className="table-wrap ref-issues"><table className="data-table"><thead><tr><th>{t('Row', 'แถว')}</th><th>{t('Column', 'คอลัมน์')}</th><th>{t('Issue', 'ปัญหา')}</th></tr></thead>
          <tbody>{[...report.errors.map(i => ({...i, kind: 'error' as const})), ...report.warnings.map(i => ({...i, kind: 'warning' as const}))].map((i, n) =>
            <tr key={n}><td className="ref-num">{i.row ?? '—'}</td><td>{i.column ?? '—'}</td><td><Badge tone={i.kind === 'error' ? 'red' : 'amber'}>{i.kind === 'error' ? t('Error', 'ข้อผิดพลาด') : t('Warning', 'คำเตือน')}</Badge> {i.message}</td></tr>)}</tbody></table>
          {(report.errorCount > report.errors.length || report.warningCount > report.warnings.length) && <p className="small muted">{t('Only the first 100 of each are listed.', 'แสดงเพียง 100 รายการแรกของแต่ละประเภท')}</p>}</div>}
    </div>}
    {!report && file && <p className="small muted">{t(`${file.name} is ready. Press Check file.`, `${file.name} พร้อมแล้ว กดตรวจไฟล์`)}</p>}
    {!file && <p className="small muted">{t('Nothing leaves this computer: the file goes to the demo server on 127.0.0.1.', 'ไฟล์ไม่ออกจากเครื่องนี้ ส่งไปที่เซิร์ฟเวอร์เดโมบน 127.0.0.1 เท่านั้น')}</p>}
  </Panel>;
}

function DataViewer({category, version, active, rows, activeRules, limitsLabel}: {category: Category; version: VersionMeta; active: boolean; rows: DatasetRow[] | null; activeRules: LimitRule[]; limitsLabel: string}) {
  const {t} = useDemo();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [allColumns, setAllColumns] = useState(false);
  const [selected, setSelected] = useState('');
  useEffect(() => { setQuery(''); setPage(0); setSelected(''); }, [version.id]);
  const columns = useMemo(() => {
    const base = allColumns ? [...columnsOf(category)] : [...KEY_COLUMNS[category]];
    const extra = allColumns && rows ? [...new Set(rows.flatMap(r => Object.keys(r)))].filter(k => !base.includes(k)) : [];
    return [...base, ...extra];
  }, [allColumns, category, rows]);
  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return q ? rows.filter(r => columns.some(c => (r[c] ?? '').toLowerCase().includes(q))) : rows;
  }, [rows, query, columns]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const filledOf = (c: string) => rows ? rows.filter(r => r[c]).length : 0;
  const selectedRow = rows?.find(r => r.CAS === selected);

  return <Panel className="ref-viewer">
    <div className="panel-heading"><div><h2>{version.builtIn ? t('Mock (built-in)', 'ข้อมูลจำลอง (ในตัว)') : version.label} {active && <Badge tone="green">{t('Active', 'ใช้งานอยู่')}</Badge>}</h2>
      <p className="muted small">{category === 'materials' ? t('Read only. Select a substance to see every limit that names it.', 'อ่านอย่างเดียว เลือกสารเพื่อดูเกณฑ์ทั้งหมดที่เกี่ยวข้อง') : t('Read only. Search by CAS to see every rule for one substance.', 'อ่านอย่างเดียว ค้นหาด้วย CAS เพื่อดูเกณฑ์ทั้งหมดของสารหนึ่งชนิด')}</p></div>
      <div className="row ref-viewer-tools">
        <label className="sr-only" htmlFor="ref-search">{t('Search', 'ค้นหา')}</label>
        <input id="ref-search" className="input" type="search" placeholder={t('Search CAS, name, category…', 'ค้นหา CAS ชื่อ หมวด…')} value={query} onChange={e => { setQuery(e.target.value); setPage(0); }}/>
        <button className="button ghost" aria-pressed={allColumns} onClick={() => setAllColumns(!allColumns)}>{allColumns ? t('Key columns', 'คอลัมน์หลัก') : t(`All ${columnsOf(category).length} columns`, `ทั้ง ${columnsOf(category).length} คอลัมน์`)}</button>
      </div></div>
    {!rows ? <p className="muted">{t('Loading rows…', 'กำลังโหลดแถว…')}</p> : rows.length === 0 ? <EmptyState title={t('No rows', 'ไม่มีข้อมูล')} description={t('This version has no rows, or its file could not be read.', 'เวอร์ชันนี้ไม่มีแถว หรืออ่านไฟล์ไม่ได้')}/> : <>
      <div className="table-wrap ref-table-wrap"><table className="data-table ref-table">
        <thead><tr>{columns.map(c => <th key={c} scope="col">{c}<span className="ref-fill">{t(`${filledOf(c)}/${rows.length} filled`, `มีค่า ${filledOf(c)}/${rows.length}`)}</span></th>)}</tr></thead>
        <tbody>{shown.map((r, i) => <tr key={`${r.CAS}-${i}`} className={category === 'materials' ? `ref-clickable ${selected === r.CAS ? 'ref-selected' : ''}` : ''}
          onClick={category === 'materials' ? () => setSelected(selected === r.CAS ? '' : r.CAS) : undefined}
          tabIndex={category === 'materials' ? 0 : undefined} onKeyDown={category === 'materials' ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(selected === r.CAS ? '' : r.CAS); } } : undefined}>
          {columns.map(c => <td key={c}>{r[c] ? r[c] : <span className="ref-empty" aria-label={t('No data', 'ไม่มีข้อมูล')}>—</span>}</td>)}</tr>)}</tbody>
      </table></div>
      <div className="ref-pager"><span className="small muted">{filtered.length === 0 ? t('No matching rows', 'ไม่พบแถวที่ตรงกัน') : t(`Rows ${page * PAGE_SIZE + 1}–${Math.min(filtered.length, (page + 1) * PAGE_SIZE)} of ${filtered.length}`, `แถว ${page * PAGE_SIZE + 1}–${Math.min(filtered.length, (page + 1) * PAGE_SIZE)} จาก ${filtered.length}`)}</span>
        <div className="row"><button className="button ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>{t('Previous', 'ก่อนหน้า')}</button><button className="button ghost" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>{t('Next', 'ถัดไป')}</button></div></div>
      {category === 'materials' && selectedRow && <SubstanceRules row={selectedRow} rules={rulesFor(selectedRow.CAS, activeRules)} limitsLabel={limitsLabel}/>}
    </>}
  </Panel>;
}

// Every rule that names one substance, from the ACTIVE limits version, grouped by source.
function SubstanceRules({row, rules, limitsLabel}: {row: DatasetRow; rules: LimitRule[]; limitsLabel: string}) {
  const {t} = useDemo();
  const sources = [...new Set(rules.map(r => r.source))];
  return <div className="ref-rules" aria-live="polite">
    <h3>{t(`Rules for ${row['Name (TGSC)'] || row.CAS}`, `เกณฑ์ของ ${row['Name (TGSC)'] || row.CAS}`)} <span className="muted small">CAS {row.CAS} · {t(`from limits: ${limitsLabel}`, `จากเกณฑ์: ${limitsLabel}`)}</span></h3>
    {row['EU CosIng'] && <p className="small"><strong>EU CosIng ({t('material data column', 'คอลัมน์ในข้อมูลวัตถุดิบ')}):</strong> {row['EU CosIng']}</p>}
    {rules.length === 0 ? <Notice tone="amber">{t('No limit data for this substance in the active limits version. This is not a pass: it means no rule has been recorded.', 'ไม่มีข้อมูลเกณฑ์ของสารนี้ในเวอร์ชันเกณฑ์ที่ใช้งานอยู่ ไม่ได้แปลว่าผ่าน แต่หมายถึงยังไม่มีการบันทึกเกณฑ์')}</Notice>
      : sources.map(source => <div key={source} className="ref-rule-source"><h4>{source}</h4>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>{t('Product category', 'หมวดผลิตภัณฑ์')}</th><th>{t('Restriction', 'ข้อจำกัด')}</th><th>{t('Max % in product', 'สูงสุด % ในผลิตภัณฑ์')}</th><th>{t('Amendment', 'ฉบับแก้ไข')}</th><th>{t('Citation', 'อ้างอิง')}</th></tr></thead>
          <tbody>{rules.filter(r => r.source === source).map((r, i) => <tr key={i}><td>{r.category}</td><td><Badge tone={r.type === 'prohibited' ? 'red' : r.type === 'restricted' ? 'amber' : 'neutral'}>{r.type}</Badge></td><td className="ref-num">{r.maxPct ?? <span className="ref-empty">—</span>}</td><td>{r.amendment || '—'}</td><td className="small">{r.citation || '—'}</td></tr>)}</tbody></table></div></div>)}
  </div>;
}

