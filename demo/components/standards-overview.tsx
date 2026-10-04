// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {useId} from 'react';
import {useDemo} from '@/lib/demo-context';
import {Badge, Icon} from './ui';
import './standards-overview.css';

// Official links support presentation notes only; they do not provide a connected rule engine.
const officialSources={
  thaiFDA:'https://cosmetic.fda.moph.go.th/interesting-law/category/cosmetic-laws/',
  asean:'https://asean.org/agreement-on-the-asean-harmonized-cosmetic-regulatory-scheme-phnom-penh-2-september-2003/',
  ifraLibrary:'https://ifrafragrance.org/standards-library',
  ifraCertificate:'https://ifrafragrance.org/initiatives-positions/safe-use-fragrance-science/ifra-standards/certification-of-ifra-standards',
};

export function StandardsOverview(){
  const {t}=useDemo();
  const headingId=useId();
  return <section className="standards-overview" aria-labelledby={headingId}>
    <div className="standards-heading"><div><h2 id={headingId}>{t('FDA & IFRA: what they cover','อย. และ IFRA ดูเรื่องอะไร?')}</h2><p>{t('Different sources of evidence for reviewing a fragrance product.','แหล่งหลักฐานคนละประเภทสำหรับตรวจผลิตภัณฑ์น้ำหอม')}</p></div><Badge tone="purple">{t('Presentation notes','คำอธิบายสำหรับพรีเซนต์')}</Badge></div>
    <div className="standards-cards">
      <article className="standards-card">
        <div className="standards-card-top"><span className="standards-icon"><Icon name="shield" size={21}/></span><Badge>{t('Law & regulation','กฎหมายและข้อกำหนด')}</Badge></div>
        <h3>{t('Thai FDA / ASEAN','อย. ไทย / ASEAN')}</h3>
        <p>{t('Thai FDA publishes official cosmetic laws, including prohibited or restricted ingredients and labelling requirements.','อย. ไทยเผยแพร่กฎหมายเครื่องสำอาง เช่น สารห้ามใช้ เงื่อนไขการใช้สาร และข้อกำหนดฉลาก')}</p>
        <p>{t('The ASEAN Cosmetic Directive is a regional cosmetic framework; applicable national and target-market requirements still need to be checked.','ASEAN Cosmetic Directive เป็นกรอบกำกับเครื่องสำอางร่วมของอาเซียน ต้องตรวจข้อกำหนดที่ใช้จริงในประเทศและตลาดเป้าหมายด้วย')}</p>
        <div className="standards-source-links"><a href={officialSources.thaiFDA} target="_blank" rel="noopener noreferrer">{t('Read Thai FDA cosmetic laws','อ่านกฎหมายเครื่องสำอางของ อย.')}<Icon name="arrow" size={16}/><span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span></a><a href={officialSources.asean} target="_blank" rel="noopener noreferrer">{t('Read the ASEAN cosmetic framework','อ่านกรอบเครื่องสำอางของ ASEAN')}<Icon name="arrow" size={16}/><span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span></a></div>
      </article>
      <article className="standards-card">
        <div className="standards-card-top"><span className="standards-icon"><Icon name="book" size={21}/></span><Badge>{t('Industry standard','มาตรฐานอุตสาหกรรม')}</Badge></div>
        <h3>IFRA Standards</h3>
        <p>{t('Industry standards for the safe use of fragrance ingredients, separate from national regulations.','มาตรฐานอุตสาหกรรมสำหรับการใช้ส่วนผสมน้ำหอมอย่างปลอดภัย แยกจากกฎหมายของแต่ละประเทศ')}</p>
        <div className="standards-source-links"><a href={officialSources.ifraLibrary} target="_blank" rel="noopener noreferrer">{t('Explore the IFRA Standards Library','ดูคลังมาตรฐาน IFRA')}<Icon name="arrow" size={16}/><span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span></a></div>
        <details className="standards-document-help"><summary>{t('Where is the IFRA certificate?','เอกสาร IFRA อยู่ตรงไหน?')}<Icon name="down" size={17}/></summary><div>
          <p>{t('In Simulate typed upload, choose IFRA certificate of conformity. The existing demo vault links this document type to a SKU.','ในปุ่มจำลองเพิ่มเอกสาร เลือก IFRA certificate of conformity คลังเอกสารเดโมผูกเอกสารประเภทนี้กับ SKU')}</p>
          <p>{t('A certificate of conformity is supplied by the fragrance-mixture manufacturer or supplier for a specified intended use. IFRA does not issue it; it does not replace a safety assessment or national law.','ผู้ผลิตหรือผู้จำหน่ายส่วนผสมน้ำหอมเป็นผู้จัดทำเอกสารรับรองสำหรับการใช้ที่ระบุ IFRA ไม่ได้ออกเอกสารนี้ และเอกสารไม่ทดแทนการประเมินความปลอดภัยหรือกฎหมายของประเทศ')}</p>
          <div className="standards-source-links"><a href="#demo-document-vault">{t('Go to sample document vault','ไปคลังเอกสารตัวอย่าง')}<Icon name="down" size={16}/></a><a href={officialSources.ifraCertificate} target="_blank" rel="noopener noreferrer">{t('Read IFRA certificate guidance','อ่านคำอธิบายเอกสารจาก IFRA')}<Icon name="arrow" size={16}/><span className="sr-only">{t('(opens in a new tab)','(เปิดแท็บใหม่)')}</span></a></div>
        </div></details>
      </article>
    </div>
    <div className="standards-evidence"><Icon name="info" size={18}/><div><strong>{t('Before a real check','ก่อนตรวจจริง')}</strong><p>{t('Use approved sources and versions, the applicable product category, and the finished-product basis including dilution. A document checklist alone is not a compliance conclusion.','ต้องมีแหล่งข้อมูลและเวอร์ชันที่อนุมัติ หมวดผลิตภัณฑ์ที่ใช้ และฐานคำนวณของผลิตภัณฑ์สำเร็จรวมการเจือจาง การมีเอกสารครบเพียงอย่างเดียวไม่ใช่ข้อสรุปว่าผ่านข้อกำหนด')}</p></div></div>
    <div className="standards-status"><span>{t('Actual evaluation: rule checks are not connected in this demo.','ผลประเมินจริง: เดโมยังไม่ได้เชื่อมการตรวจกฎ')}</span><Badge tone="amber">{t('Insufficient data','ข้อมูลไม่เพียงพอ')}</Badge></div>
  </section>;
}
