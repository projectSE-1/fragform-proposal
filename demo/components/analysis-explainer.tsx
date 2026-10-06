// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useDemo} from '../lib/demo-context';
import {Icon} from './ui';
import './analysis-explainer.css';

type Copy = {en:string;th:string};
type Topic = 'overview'|'profile'|'evolution'|'error-budget'|'provenance';
const explanations:Record<Topic,{purpose:Copy;benefit:Copy;demo:Copy;try:Copy}>={
  overview:{
    purpose:{en:'Read the formula\'s composition by odour family and the state of each material over time, with the evidence behind both.',th:'ดูสัดส่วนของสูตรตามหมวดกลิ่น และสถานะของวัตถุดิบแต่ละชนิดตามเวลา พร้อมหลักฐานของทั้งสองส่วน'},
    benefit:{en:'Keeps what is computed and what is still missing side by side, so a perfumer sees the basis before deciding what to test.',th:'วางสิ่งที่คำนวณได้และสิ่งที่ยังขาดไว้ข้างกัน ให้นักปรุงเห็นที่มาก่อนตัดสินใจว่าจะทดลองอะไร'},
    demo:{en:'Composition is real arithmetic on your declared amounts: edit a percentage and the bars move. Evolution has no approved model, so every material reports insufficient data instead of a drawn curve.',th:'สัดส่วนตามหมวดกลิ่นคำนวณจริงจากค่าที่คุณกรอก แก้เปอร์เซ็นต์แล้วแท่งกราฟจะเปลี่ยนตาม ส่วนกราฟตามเวลายังไม่มีโมเดลที่อนุมัติ วัตถุดิบทุกชนิดจึงแสดงว่าข้อมูลไม่เพียงพอแทนการวาดเส้น'},
    try:{en:'Change one percentage in the table above, then come back and watch the composition bars follow it.',th:'แก้เปอร์เซ็นต์หนึ่งแถวในตารางด้านบน แล้วกลับมาดูแท่งสัดส่วนที่เปลี่ยนตาม'},
  },
  profile:{
    purpose:{en:'Show the formula grouped by odour family, such as Citrus, Floral and Woody, as a share of the concentrate by weight.',th:'แสดงสูตรแยกตามหมวดกลิ่น เช่น Citrus, Floral และ Woody เป็นสัดส่วนโดยน้ำหนักของหัวน้ำหอม'},
    benefit:{en:'A quick read of what the formula is mostly made of, before any perception model exists.',th:'อ่านได้เร็วว่าสูตรประกอบด้วยอะไรเป็นหลัก แม้ยังไม่มีโมเดลการรับรู้กลิ่น'},
    demo:{en:'Perceived strength (OAV) is the default: amount divided by detection threshold. The owner dataset has thresholds, but this public demo does not, so it draws only with Data set to Mock. By mass is real arithmetic on your input.',th:'ค่าเริ่มต้นคือความแรงที่รับรู้ (OAV): ปริมาณหารด้วยค่าความเข้มข้นต่ำสุดที่ได้กลิ่น ชุดข้อมูลของเจ้าของมีค่านี้ แต่เดโมสาธารณะนี้ไม่มี จึงวาดได้เฉพาะเมื่อเลือกข้อมูลจำลอง ส่วนตามมวลคำนวณจริงจากค่าที่กรอก'},
    try:{en:'Open View data to see the exact share behind each bar.',th:'กดดูข้อมูลเพื่อดูสัดส่วนที่แน่นอนของแต่ละแท่ง'},
  },
  evolution:{
    purpose:{en:'Show how each material in the formula is expected to fade over time, once a model exists.',th:'แสดงว่าวัตถุดิบแต่ละชนิดในสูตรจะจางลงตามเวลาอย่างไร เมื่อมีโมเดลรองรับแล้ว'},
    benefit:{en:'Explains why a formula changes character in the hours after it is applied.',th:'อธิบายว่าทำไมกลิ่นของสูตรจึงเปลี่ยนไปในช่วงหลายชั่วโมงหลังใช้'},
    demo:{en:'With Data set to Mock, the curves come from invented half-lives and thresholds and are labelled as mock. With Real dataset, no curve is drawn: the evaporation model is not chosen and the thresholds are missing from the supplied sample.',th:'เมื่อเลือกข้อมูลจำลอง เส้นกราฟมาจากครึ่งชีวิตและค่าเกณฑ์ที่แต่งขึ้น และมีป้ายบอกว่าเป็นข้อมูลจำลอง เมื่อเลือกข้อมูลจริง จะไม่วาดเส้น เพราะยังไม่ได้เลือกโมเดลการระเหยและข้อมูลตัวอย่างไม่มีค่าเกณฑ์'},
    try:{en:'Add or remove a material and see the list follow the formula.',th:'เพิ่มหรือลบวัตถุดิบ แล้วดูว่ารายการเปลี่ยนตามสูตร'},
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
    demo:{en:'The list contains the formula snapshot, the arithmetic behind each figure, the fictional limit table and the named missing inputs.',th:'รายการนี้มีสแนปช็อตสูตรจำลอง รหัสตัวอย่างหน้าจอ และชื่อข้อมูลนำเข้าที่ยังขาด รหัสตัวอย่างหน้าจอเหล่านี้ไม่ได้ยืนยันผลทางวิทยาศาสตร์'},
    try:{en:'Switch List view / Tree view and identify the input snapshot and missing model evidence.',th:'สลับมุมมองรายการ / มุมมองต้นไม้ แล้วระบุข้อมูลสูตรที่ใช้และหลักฐานโมเดลที่ยังขาด'},
  },
};

export function AnalysisExplainer({topic}:{topic:Topic}){
  const {t}=useDemo();
  const copy=explanations[topic];
  const names:Record<Topic,Copy>={overview:{en:'analysis overview',th:'ภาพรวมการวิเคราะห์'},profile:{en:'composition by odour family',th:'สัดส่วนตามหมวดกลิ่น'},evolution:{en:'evolution over time',th:'การเปลี่ยนแปลงตามเวลา'},'error-budget':{en:'uncertainty',th:'ความไม่แน่นอน'},provenance:{en:'source evidence',th:'ที่มาของข้อมูล'}};
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
