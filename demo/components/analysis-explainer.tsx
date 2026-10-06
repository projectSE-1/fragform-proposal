// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useDemo} from '../lib/demo-context';
import {Icon} from './ui';
import './analysis-explainer.css';

type Copy = {en:string;th:string};
type Topic = 'overview'|'profile'|'evolution'|'error-budget'|'provenance';
const explanations:Record<Topic,{purpose:Copy;benefit:Copy;demo:Copy;try:Copy}>={
  overview:{
    purpose:{en:'Read a scent profile, its change over time and the evidence behind an analysis.',th:'ดูโปรไฟล์กลิ่น การเปลี่ยนแปลงตามเวลา และหลักฐานเบื้องหลังผลวิเคราะห์'},
    benefit:{en:'Keeps the analysis and its explanation together, so a perfumer can inspect the basis before deciding what to test in the lab.',th:'รวมผลและคำอธิบายไว้ด้วยกัน ช่วยให้นักปรุงตรวจที่มาก่อนตัดสินใจว่าจะทดลองอะไรในแล็บ'},
    demo:{en:'All chart values are hand-authored examples. Editing a formula does not calculate a new chart.',th:'ค่าทั้งหมดในกราฟเป็นตัวอย่างที่แต่งขึ้น การแก้ไขสูตรจะไม่ทำให้คำนวณกราฟใหม่'},
    try:{en:'Open Sample profile 1 or 2, then inspect Evolution, Uncertainty and Sources.',th:'เปิดตัวอย่างโปรไฟล์ 1 หรือ 2 แล้วดูกราฟตามเวลา ความไม่แน่นอน และที่มาของข้อมูล'},
  },
  profile:{
    purpose:{en:'Show how an analysis can display odour families such as Floral, Citrus and Woody.',th:'แสดงรูปแบบการอ่านผลแยกหมวดกลิ่น เช่น Floral, Citrus และ Woody'},
    benefit:{en:'A supported profile would help compare reported odour-family results alongside their evidence.',th:'เมื่อมีโมเดลรองรับ จะช่วยเปรียบเทียบผลของแต่ละหมวดกลิ่นพร้อมหลักฐานอ้างอิง'},
    demo:{en:'Samples 1 and 2 are two invented chart datasets. The scope calls the future views Profile A/B; their meanings still need domain approval. Bar lengths are display coordinates, with no physical units.',th:'ตัวอย่างที่ 1 และ 2 เป็นชุดข้อมูลกราฟสมมติ 2 ชุด ขอบเขตงานเรียกมุมมองในอนาคตว่า Profile A/B ซึ่งความหมายยังต้องได้รับการอนุมัติด้านโดเมน ความยาวแท่งเป็นพิกัดสำหรับแสดงผล ไม่มีหน่วยทางกายภาพ'},
    try:{en:'Switch between the two samples and open View data to inspect the display values.',th:'สลับตัวอย่างทั้งสองชุด แล้วกดดูข้อมูลเพื่อดูค่าที่ใช้แสดงแท่งกราฟ'},
  },
  evolution:{
    purpose:{en:'Show where a supported analysis would report changes over time.',th:'แสดงส่วนที่จะใช้ดูการเปลี่ยนแปลงตามเวลาเมื่อมีโมเดลวิเคราะห์รองรับ'},
    benefit:{en:'Helps inspect time-dependent results under the model’s stated conditions.',th:'ช่วยอ่านผลที่เปลี่ยนตามเวลาภายใต้เงื่อนไขที่โมเดลระบุ'},
    demo:{en:'Three sample lines demonstrate the chart layout. S0–S5 are sample stages with no physical duration; the lines are not an evaporation prediction.',th:'ใช้เส้นตัวอย่าง 3 ชุดสาธิตหน้าตากราฟ S0–S5 เป็นลำดับตัวอย่างที่ไม่มีระยะเวลาทางกายภาพ เส้นเหล่านี้ไม่ใช่ผลทำนายการระเหย'},
    try:{en:'Open View data and follow each sample series from S0 to S5.',th:'กดดูข้อมูล แล้วไล่ค่าของแต่ละเส้นตั้งแต่ S0 ถึง S5'},
  },
  'error-budget':{
    purpose:{en:'Explain which sources contribute uncertainty to a supported result.',th:'อธิบายว่าความไม่แน่นอนของผลที่มีโมเดลรองรับมาจากแหล่งใดบ้าง'},
    benefit:{en:'Helps judge the limits of a result and identify evidence that needs further review.',th:'ช่วยเข้าใจข้อจำกัดของผลและเห็นว่าหลักฐานส่วนไหนต้องตรวจเพิ่ม'},
    demo:{en:'There is no approved uncertainty policy or measurement evidence, so no interval or contributor percentage is reported.',th:'ยังไม่มีนโยบายความไม่แน่นอนหรือหลักฐานการวัดที่อนุมัติ จึงยังแสดงช่วงค่าหรือเปอร์เซ็นต์ของแต่ละสาเหตุไม่ได้'},
    try:{en:'Read the missing model, observation and calibration categories.',th:'ดูรายการข้อมูลโมเดล การสังเกต และการสอบเทียบที่ยังขาด'},
  },
  provenance:{
    purpose:{en:'Trace the input version, sources and missing evidence used by the displayed analysis.',th:'ย้อนดูเวอร์ชันข้อมูลนำเข้า แหล่งข้อมูล และหลักฐานที่ยังขาดของผลวิเคราะห์ที่แสดง'},
    benefit:{en:'Makes a result explainable and lets reviewers inspect its basis.',th:'ช่วยอธิบายผลได้ และให้ผู้ตรวจสอบย้อนดูที่มาได้'},
    demo:{en:'The list contains a demo formula snapshot, screen-fixture IDs and named missing inputs. Fixture IDs do not validate a scientific result.',th:'รายการนี้มีสแนปช็อตสูตรจำลอง รหัสตัวอย่างหน้าจอ และชื่อข้อมูลนำเข้าที่ยังขาด รหัสตัวอย่างหน้าจอเหล่านี้ไม่ได้ยืนยันผลทางวิทยาศาสตร์'},
    try:{en:'Switch List view / Tree view and identify the input snapshot and missing model evidence.',th:'สลับมุมมองรายการ / มุมมองต้นไม้ แล้วระบุข้อมูลสูตรที่ใช้และหลักฐานโมเดลที่ยังขาด'},
  },
};

export function AnalysisExplainer({topic}:{topic:Topic}){
  const {t}=useDemo();
  const copy=explanations[topic];
  const names:Record<Topic,Copy>={overview:{en:'analysis overview',th:'ภาพรวมการวิเคราะห์'},profile:{en:'sample scent profiles',th:'ตัวอย่างโปรไฟล์กลิ่น'},evolution:{en:'time-evolution samples',th:'กราฟตามเวลาตัวอย่าง'},'error-budget':{en:'uncertainty',th:'ความไม่แน่นอน'},provenance:{en:'source evidence',th:'ที่มาของข้อมูล'}};
  return <details className="analysis-explainer" key={topic}>
    <summary aria-label={t(`Explain ${names[topic].en}`,`อธิบาย${names[topic].th}`)}><span className="analysis-explainer-label"><Icon name="info" size={17}/>{t('Explain this section','ส่วนนี้ใช้ทำอะไร')}<span className="analysis-explainer-hint">{t('Presentation notes','คำอธิบายสำหรับพรีเซนต์')}</span></span><Icon name="down" size={16}/></summary>
    <dl>
      <div><dt>{t('What it does','ทำอะไร')}</dt><dd>{t(copy.purpose.en,copy.purpose.th)}</dd></div>
      <div><dt>{t('Why it helps','ช่วยอะไร')}</dt><dd>{t(copy.benefit.en,copy.benefit.th)}</dd></div>
      <div><dt>{t('In this demo','ในเดโมนี้')}</dt><dd>{t(copy.demo.en,copy.demo.th)}</dd></div>
      <div><dt>{t('Try presenting','ลองตอนพรีเซนต์')}</dt><dd>{t(copy.try.en,copy.try.th)}</dd></div>
    </dl>
  </details>;
}
