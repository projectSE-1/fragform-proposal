// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// FICTIONAL limit tables for the presentation demo. Every number here is invented.
// The layout copies the *shape* of an IFRA-style category table (application → max % in the
// finished product) and of a supplier certificate of conformity. No value, substance, supplier
// or document from IFRA, Thai FDA or the owner-supplied sample is reproduced: this repository
// is public (rule.md §0.1, rule 85). Real rows need an approved, versioned source (FR-005).

export const demoLimitStandard={
  id:'DEMO-STD',
  version:'v1',
  labelEn:'Demo limit table (fictional, IFRA-style layout)',
  labelTh:'ตารางเกณฑ์สมมติ (รูปแบบคล้ายตาราง IFRA)',
} as const;

// Max % of each material in the finished product, per demo application.
// Picked so the seeded formula (40/30/20/10 at 20% dilution → 8/6/4/2% in product) shows a
// pass, an exceed and a missing row without editing, and switching application flips results.
// DEMO-M03 deliberately has no row: a missing limit is insufficient data, never a pass.
export const demoStandardLimits:Record<string,Record<string,string>>={
  'Fine fragrance (demo category)':{'DEMO-M01':'10','DEMO-M02':'5','DEMO-M04':'2.5','DEMO-M05':'0.5','DEMO-M06':'3'},
  'Body lotion (demo category)':{'DEMO-M01':'6','DEMO-M02':'8','DEMO-M04':'1.5','DEMO-M05':'0.2','DEMO-M06':'1'},
};

// One material can come from several suppliers, each with its own document set.
// Supplier A sends no usage-level certificate; supplier B sends one with its own maximums.
// Where both list a material, supplier B is never looser than DEMO-STD: which source governs is
// an undecided domain rule, so the demo must not suggest a certificate can relax the standard.
// DEMO-M03 shows a certificate level where the standard has no row (still insufficient data there).
export const demoSuppliers=[
  {
    id:'DEMO-SUP-A',
    name:'Demo supplier A',
    documents:[
      {en:'SDS',th:'SDS'},
      {en:'CoA',th:'CoA'},
      {en:'Spec sheet',th:'ใบสเปก'},
      {en:'Allergen list',th:'รายการสารก่อภูมิแพ้'},
      {en:'Dietary / origin statements',th:'หนังสือรับรองด้านอาหาร/แหล่งที่มา'},
    ],
    certificate:null,
  },
  {
    id:'DEMO-SUP-B',
    name:'Demo supplier B',
    documents:[
      {en:'SDS',th:'SDS'},
      {en:'CoA',th:'CoA'},
      {en:'Certificate of conformity',th:'ใบรับรองระดับการใช้'},
      {en:'Allergen declaration',th:'เอกสารแจ้งสารก่อภูมิแพ้'},
    ],
    certificate:{
      id:'DEMO-SUP-B-COC',
      version:'v1',
      // Max % in the finished product stated by this fictional certificate.
      limits:{
        'Fine fragrance (demo category)':{'DEMO-M01':'10','DEMO-M02':'5','DEMO-M03':'5','DEMO-M04':'2.5','DEMO-M05':'0.5','DEMO-M06':'3'},
        'Body lotion (demo category)':{'DEMO-M01':'6','DEMO-M02':'8','DEMO-M03':'2','DEMO-M04':'1.5','DEMO-M05':'0.2','DEMO-M06':'1'},
      } as Record<string,Record<string,string>>,
    },
  },
] as const;
