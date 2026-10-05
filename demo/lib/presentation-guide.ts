// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import type {Page} from './model';

type Copy = readonly [english:string, thai:string];
export type PresentationGuide = {
  title:Copy;
  purpose:Copy;
  benefit:Copy;
  steps:readonly Copy[];
  boundary:Copy;
};

export const pendingAccessGuide:PresentationGuide = {
  title:['Pending access','รอสิทธิ์ใช้งาน'],
  purpose:['Explain what a new account can explore while a laboratory role has not yet been granted.','อธิบายว่าบัญชีใหม่ดูอะไรได้บ้างขณะที่ยังไม่ได้รับบทบาทแล็บ'],
  benefit:['Keeps account controls and optional learning available without opening laboratory records.','ช่วยให้จัดการบัญชีและฝึกใช้งานตามสมัครใจได้ โดยยังไม่เปิดบันทึกแล็บ'],
  steps:[['Point out the Pending access status.','ชี้สถานะรอสิทธิ์ใช้งาน'],['Open My account to show own-account controls.','เปิดบัญชีของฉันเพื่อแสดงการจัดการบัญชีของตนเอง'],['Explore the optional tutorial with separate invented records.','ลองบทสอนตามสมัครใจที่ใช้ข้อมูลสมมติแยก']],
  boundary:['This is a pending-access UI scenario. Real role grants must be checked by the server.','เป็นสถานการณ์หน้าจอรอสิทธิ์ การให้บทบาทจริงต้องตรวจสอบที่เซิร์ฟเวอร์'],
};

// Presentation notes describe existing synthetic screens, not new product requirements.
export const presentationGuides:Record<Page,PresentationGuide> = {
  dashboard:{
    title:['Overview','ภาพรวม'],
    purpose:['A starting point for the formula, laboratory and document workflow.','จุดเริ่มต้นสำหรับงานสูตร แล็บ และเอกสาร'],
    benefit:['Helps the audience see how the stages connect before exploring a single study.','ช่วยให้ผู้ฟังเห็นว่างานแต่ละส่วนเชื่อมกันอย่างไร ก่อนดูสูตรหนึ่งรายการ'],
    steps:[['Point out the saved formula count and recent studies.','ชี้จำนวนสูตรที่บันทึกและรายการสูตรล่าสุด'],['Open the formula library to continue with a sample study.','เปิดคลังสูตรเพื่อดูสูตรตัวอย่างต่อ'],['Explain that scientific and legal data are not connected.','อธิบายว่ายังไม่ได้เชื่อมข้อมูลวิทยาศาสตร์และข้อกำหนดจริง']],
    boundary:['All workspace records are invented and remain in this browser session.','บันทึกทั้งหมดเป็นข้อมูลสมมติและอยู่เฉพาะในเซสชันเบราว์เซอร์นี้'],
  },
  formulas:{
    title:['Formula library','คลังสูตร'],
    purpose:['Find saved studies and open the version you want to work with.','ค้นหาสูตรที่บันทึกและเปิดสูตรที่ต้องการทำงาน'],
    benefit:['Keeps studies organised instead of scattering formula files across the team.','ช่วยจัดสูตรเป็นระเบียบ ลดการกระจายไฟล์สูตรของทีม'],
    steps:[['Search or filter the invented formula list.','ลองค้นหาหรือกรองรายการสูตรสมมติ'],['Open a study and point out its saved versions.','เปิดสูตรแล้วชี้เวอร์ชันที่บันทึกไว้'],['With a formulation persona, try the create-formula flow.','ใช้บทบาทที่แก้ไขสูตรได้เพื่อลองขั้นตอนสร้างสูตร']],
    boundary:['Saving here changes only demo memory; no database is connected.','การบันทึกเปลี่ยนเฉพาะข้อมูลในหน่วยความจำเดโม ยังไม่ได้เชื่อมฐานข้อมูล'],
  },
  editor:{
    title:['Formula workspace','พื้นที่สูตร'],
    purpose:['Record composition and context, keep versions, and inspect analysis evidence.','ระบุส่วนประกอบและบริบท เก็บเวอร์ชัน และตรวจหลักฐานการวิเคราะห์'],
    benefit:['Makes a trial separate from the saved formula, so earlier versions remain traceable.','แยกการทดลองออกจากสูตรที่บันทึก ทำให้ย้อนดูเวอร์ชันเดิมได้'],
    steps:[['With Formulator, adjust two percentages to keep a 100% total, then save a version with a note.','ใช้ Formulator ปรับสองสัดส่วนให้ยอดรวมยังเป็น 100% แล้วบันทึกเวอร์ชันพร้อมหมายเหตุ'],['Start a what-if to demonstrate a separate, temporary trial.','เริ่ม What-if เพื่อสาธิตการทดลองชั่วคราวที่แยกจากสูตรที่บันทึก'],['Open the Mock limit walkthrough formula and choose Evaluate: each row’s Mock limit chip shows Within / Exceeds against fictional limits. Open Soft study 04 and Petal study 02 to compare, then switch the chart weighting to perceived strength and show that it names what is missing instead of drawing bars.','เปิดสูตร Mock limit walkthrough แล้วกดประเมินผล ชิปเกณฑ์สมมติของแต่ละแถวจะแสดง ผ่าน / เกิน เทียบกับเกณฑ์สมมติ เปิด Soft study 04 กับ Petal study 02 เพื่อเทียบ แล้วสลับการถ่วงน้ำหนักของกราฟเป็นความแรงที่รับรู้ เพื่อแสดงว่าระบบบอกสิ่งที่ขาดแทนการวาดแท่งกราฟ']],
    boundary:['Composition by mass is real arithmetic on your input. The other weightings and the time curves show insufficient data on purpose, and the mock limits are fictional. No chemistry model, interaction rule or regulatory limit is implemented.','สัดส่วนตามมวลคำนวณจริงจากค่าที่กรอก การถ่วงน้ำหนักแบบอื่นและกราฟตามเวลาตั้งใจแสดงว่าข้อมูลไม่เพียงพอ เกณฑ์ในชิปเกณฑ์สมมติเป็นค่าสมมติ ยังไม่มีโมเดลเคมี กฎปฏิสัมพันธ์ หรือเกณฑ์ข้อกำหนดที่ทำงานจริง'],
  },
  lab:{
    title:['Lab workspace','พื้นที่แล็บ'],
    purpose:['Link a sample batch to a saved formula version and keep its weighing history.','เชื่อมแบตช์ตัวอย่างกับเวอร์ชันสูตรที่บันทึก และเก็บประวัติการชั่ง'],
    benefit:['Shows which version, lot and instrument belong to each recorded entry.','ช่วยแสดงว่าแต่ละบันทึกใช้สูตรเวอร์ชันใด ล็อตใด และเครื่องมือใด'],
    steps:[['As Formulator, select a saved version and a lot for each material.','ใช้ Formulator เลือกเวอร์ชันสูตรและล็อตของวัตถุดิบแต่ละรายการ'],['Create a demo batch and explicitly select an instrument.','สร้างแบตช์จำลองและเลือกเครื่องมือเอง'],['Record a fixture, then show its history or a reweigh scenario.','บันทึกผลตัวอย่าง แล้วแสดงประวัติหรือสถานการณ์ชั่งซ้ำ']],
    boundary:['Readings and NORMAL/WARN/BLOCK are selected scenarios, not measured values or validated tolerances.','ค่าชั่งและ NORMAL/WARN/BLOCK เป็นสถานการณ์ที่เลือก ไม่ใช่ผลวัดหรือค่าความคลาดเคลื่อนที่ยืนยันแล้ว'],
  },
  compliance:{
    title:['Compliance & documents','ข้อกำหนดและเอกสาร'],
    purpose:['Review missing evidence and organise source documents by their material subjects.','ตรวจหลักฐานที่ขาด และจัดเอกสารต้นทางตามวัตถุดิบที่อ้างถึง'],
    benefit:['Makes missing documents visible before a scientific or compliance conclusion is claimed.','ช่วยเห็นเอกสารที่ขาด ก่อนอ้างผลทางวิทยาศาสตร์หรือการผ่านข้อกำหนด'],
    steps:[['Show the separate jurisdictions and their missing-source findings.','แสดงผลแยกแต่ละเขตอำนาจและหลักฐานที่ยังขาด'],['Open the document vault and inspect document types and subjects.','เปิดคลังเอกสารเพื่อดูประเภทเอกสารและรายการที่อ้างถึง'],['With a permitted persona, try the simulated document processing.','ใช้บทบาทที่มีสิทธิ์ลองสถานะประมวลผลเอกสารจำลอง']],
    boundary:['No file bytes are uploaded or scanned, and no safety or legal compliance is certified.','ไม่มีการอัปโหลดหรือสแกนไฟล์จริง และไม่ได้รับรองความปลอดภัยหรือการผ่านข้อกฎหมาย'],
  },
  references:{
    title:['Reference library','คลังข้อมูลอ้างอิง'],
    purpose:['Look up the sample materials, vehicles, categories, lots and instruments used by the demo.','ดูวัตถุดิบ พาหะ หมวดหมู่ ล็อต และเครื่องมือตัวอย่างที่เดโมใช้'],
    benefit:['Gives a shared reference point for understanding the selections shown in other screens.','ช่วยอธิบายว่าตัวเลือกในหน้าต่าง ๆ อ้างถึงข้อมูลรายการใด'],
    steps:[['Switch between the available reference categories.','สลับหมวดข้อมูลอ้างอิงที่มี'],['Inspect an invented material or instrument record.','ดูรายการวัตถุดิบหรือเครื่องมือสมมติ'],['Relate its identifier to a selection in the formula or lab screen.','เชื่อมรหัสรายการกับตัวเลือกในหน้าสูตรหรือแล็บ']],
    boundary:['These are invented records, not the owner dataset or approved scientific reference data.','รายการเหล่านี้เป็นข้อมูลจำลอง ไม่ใช่ชุดข้อมูลของเจ้าของหรือข้อมูลอ้างอิงทางวิทยาศาสตร์ที่อนุมัติแล้ว'],
  },
  account:{
    title:['My account','บัญชีของฉัน'],
    purpose:['Show personal account choices, security scenarios, consent history and own-data actions.','แสดงตัวเลือกบัญชี สถานการณ์ความปลอดภัย ประวัติความยินยอม และการจัดการข้อมูลของตนเอง'],
    benefit:['Explains the account controls that stay accessible even while laboratory access is pending.','ช่วยอธิบายการจัดการบัญชีที่ยังเข้าถึงได้ขณะรอสิทธิ์ใช้งานแล็บ'],
    steps:[['Browse Profile, Security & sessions, Consent history and My data & rights.','เปิดดูโปรไฟล์ ความปลอดภัยและเซสชัน ประวัติความยินยอม และข้อมูลและสิทธิ์'],['Use the invented profile presets or inspect a simulated session.','เลือกโปรไฟล์สมมติหรือดูเซสชันจำลอง'],['Explain the difference between managing your account and receiving a lab role.','อธิบายความต่างระหว่างการจัดการบัญชีกับการได้รับบทบาทแล็บ']],
    boundary:['Account records, MFA and consent are simulated. No real identity or security setting is changed.','บัญชี MFA และความยินยอมเป็นการจำลอง ไม่ได้เปลี่ยนตัวตนหรือการตั้งค่าความปลอดภัยจริง'],
  },
  admin:{
    title:['Administration','การดูแลระบบ'],
    purpose:['Demonstrate the review of users, role changes and restricted access-log views.','สาธิตการตรวจผู้ใช้ การเปลี่ยนบทบาท และการดูบันทึกการเข้าถึงที่จำกัดสิทธิ์'],
    benefit:['Makes the reason and verification steps of a sensitive administrative action visible.','ช่วยแสดงเหตุผลและขั้นตอนยืนยันก่อนดำเนินการของผู้ดูแล'],
    steps:[['Use an admin demo persona to open this screen.','เลือกบทบาทผู้ดูแลจำลองเพื่อเปิดหน้านี้'],['Inspect an invented user and a role-change scenario.','ดูผู้ใช้สมมติและสถานการณ์เปลี่ยนบทบาท'],['Point out the requested reason and simulated fresh MFA confirmation.','ชี้การระบุเหตุผลและการยืนยัน MFA ใหม่แบบจำลอง']],
    boundary:['Role grants and access logs are UI scenarios. Real authorisation and logging must be enforced by the server.','การให้บทบาทและบันทึกการเข้าถึงเป็นสถานการณ์หน้าจอ การตรวจสิทธิ์และบันทึกจริงต้องทำที่เซิร์ฟเวอร์'],
  },
  tutorial:{
    title:['Getting started','บทสอนเริ่มต้น'],
    purpose:['Practise the workflow with optional missions in a separate synthetic learning space.','ฝึกขั้นตอนงานด้วยภารกิจตามสมัครใจในพื้นที่ข้อมูลจำลองแยก'],
    benefit:['Introduces versions, missing evidence, lab blocks and document subjects before real work.','ช่วยรู้จักเวอร์ชัน หลักฐานที่ขาด การบล็อกในแล็บ และรายการที่เอกสารอ้างถึงก่อนทำงานจริง'],
    steps:[['Choose Start optional tutorial when you want to begin.','เลือกเริ่มบทสอนตามสมัครใจเมื่อพร้อม'],['Open one mission, read its prompt and try a choice.','เปิดหนึ่งภารกิจ อ่านคำถามและลองเลือกคำตอบ'],['Show that missions can be skipped, reopened or exited.','แสดงว่าข้าม เปิดใหม่ หรือออกจากภารกิจได้']],
    boundary:['Practice does not change real formulas, laboratory records or permissions.','การฝึกไม่เปลี่ยนสูตร บันทึกแล็บ หรือสิทธิ์จริง'],
  },
  public:{
    title:['About the platform','เกี่ยวกับระบบ'],
    purpose:['Introduce the proposed workflow, static FAQ and draft notices without showing private records.','แนะนำขั้นตอนระบบ คำถามที่พบบ่อยแบบคงที่ และร่างประกาศโดยไม่แสดงบันทึกส่วนตัว'],
    benefit:['Gives a simple introduction before opening the account or workspace demonstration.','ช่วยอธิบายภาพรวมก่อนเริ่มสาธิตบัญชีหรือพื้นที่ทำงาน'],
    steps:[['Show the overview and how-to sections.','แสดงส่วนภาพรวมและวิธีใช้งาน'],['Search the static FAQ for a workflow question.','ลองค้นหาคำถามขั้นตอนงานในคำถามที่พบบ่อยแบบคงที่'],['Point out the draft label on the legal notices.','ชี้ป้ายร่างบนประกาศกฎหมาย']],
    boundary:['FAQ answers are static, not AI chat. Legal copy is demonstration text awaiting review.','คำตอบในคำถามที่พบบ่อยเป็นข้อความคงที่ ไม่ใช่แชต AI ข้อความกฎหมายเป็นร่างสาธิตที่ยังต้องตรวจสอบ'],
  },
  auth:{
    title:['Access walkthrough','ทดลองเข้าสู่ระบบ'],
    purpose:['Demonstrate login, signup, verification, MFA and recovery screens.','สาธิตหน้าเข้าสู่ระบบ สมัคร ยืนยันอีเมล MFA และกู้คืนบัญชี'],
    benefit:['Explains the account journey and why a new account waits for a laboratory role.','ช่วยอธิบายขั้นตอนบัญชีและเหตุผลที่บัญชีใหม่ต้องรอบทบาทแล็บ'],
    steps:[['Choose a login or signup scenario without entering real credentials.','เลือกสถานการณ์เข้าสู่ระบบหรือสมัครโดยไม่กรอกข้อมูลรับรองจริง'],['Compare a successful scenario with an invalid or expired scenario.','เปรียบเทียบกรณีสำเร็จกับกรณีไม่สำเร็จหรือหมดอายุ'],['Explain that verification and a laboratory role are separate steps.','อธิบายว่าการยืนยันบัญชีกับการให้บทบาทแล็บเป็นคนละขั้นตอน']],
    boundary:['Buttons simulate outcomes; no credentials, verification codes or emails are sent.','ปุ่มจำลองผลลัพธ์ ไม่มีการส่งข้อมูลรับรอง รหัสยืนยัน หรืออีเมลจริง'],
  },
};
