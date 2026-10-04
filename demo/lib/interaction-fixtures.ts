// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Hand-authored UI examples. These are not interaction rules or calculated evaluation results.
export const interactionExamples=[
  {id:'DEMO-INT-001',titleEn:'Synergy example',titleTh:'คู่เสริมกลิ่น (Synergy)',icon:'spark',memberIds:['DEMO-M01','DEMO-M02'],descriptionEn:'Shows the synergy-check layout. There is no verified synergy rule for this invented pair.',descriptionTh:'สาธิตหน้าจอตรวจคู่เสริมกลิ่น คู่นี้ยังไม่มีกฎยืนยันว่าเสริมกันจริง'},
  {id:'DEMO-INT-002',titleEn:'Masking example',titleTh:'คู่กลบกลิ่น (Masking)',icon:'layers',memberIds:['DEMO-M03','DEMO-M04'],descriptionEn:'Shows the masking-check layout. There is no verified masking rule for this invented pair.',descriptionTh:'สาธิตหน้าจอตรวจคู่กลบกลิ่น คู่นี้ยังไม่มีกฎยืนยันว่ากลบกันจริง'},
  {id:'DEMO-INT-003',titleEn:'Material-group example',titleTh:'ตัวอย่างกลุ่มวัตถุดิบ',icon:'grid',memberIds:['DEMO-M02','DEMO-M03','DEMO-M06'],descriptionEn:'Demo group A contains three invented material records.',descriptionTh:'Demo group A มีรายการวัตถุดิบสมมติ 3 รายการ'},
] as const;

// Fixed presentation outcomes requested by the owner. Never used by Evaluate or exports.
// These IDs describe UI scripts, not scientific sources, rules or model outputs.
export const interactionAssessmentMock={
  id:'DEMO-REPORT-INT-001',
  version:'1',
  findings:[
    {id:'DEMO-FINDING-SYN-01',exampleId:'DEMO-INT-001',icon:'spark',titleEn:'Synergy pair shown',titleTh:'ตัวอย่างผล: พบคู่เสริมกลิ่น',resultEn:'The mock report highlights Citrus study 01 + Petal study 02 as a synergy pair.',resultTh:'รายงานสมมติแสดง Citrus study 01 + Petal study 02 เป็นคู่เสริมกลิ่น',explanationEn:'Use this row to explain where a supported pair finding and its reasoning would appear.',explanationTh:'ใช้เล่าว่าผลคู่เสริมกลิ่นและเหตุผลประกอบจะแสดงตรงไหน เมื่อมีกฎรองรับจริง'},
    {id:'DEMO-FINDING-MASK-01',exampleId:'DEMO-INT-002',icon:'layers',titleEn:'Masking pair shown',titleTh:'ตัวอย่างผล: พบคู่กลบกลิ่น',resultEn:'The mock report highlights Wood study 03 + Soft study 04 as a masking pair.',resultTh:'รายงานสมมติแสดง Wood study 03 + Soft study 04 เป็นคู่กลบกลิ่น',explanationEn:'Use this row to show a pair worth reviewing; the demo supplies no direction or magnitude of masking.',explanationTh:'ใช้สาธิตการชี้คู่ที่ควรทบทวน เดโมไม่ได้กำหนดทิศทางหรือขนาดของการกลบกลิ่น'},
    {id:'DEMO-FINDING-GROUP-01',exampleId:'DEMO-INT-003',icon:'grid',titleEn:'Material group shown',titleTh:'ตัวอย่างผล: พบกลุ่มวัตถุดิบ',resultEn:'The mock report displays three invented members in Demo group A.',resultTh:'รายงานสมมติแสดงสมาชิกวัตถุดิบ 3 รายการใน Demo group A',explanationEn:'Use this row to explain group-based review. Membership alone is not a safety or performance verdict.',explanationTh:'ใช้เล่าการดูผลตามกลุ่ม การเป็นสมาชิกกลุ่มเพียงอย่างเดียวไม่ใช่ผลตัดสินความปลอดภัยหรือประสิทธิภาพ'},
  ],
} as const;
