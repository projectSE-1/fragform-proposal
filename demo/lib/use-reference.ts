// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// The active reference data as the formula workspace reads it. Before the first load, or when the
// local server cannot be reached, the built-in mock is used. Its values are invented
// (lib/mock-odour.ts, lib/limit-check-fixtures.ts); the screen calls it "Built-in sample".
'use client';
import {useMemo} from 'react';
import {useDemo} from './demo-context';
import {mockRows, toLimitRules, toMaterialRefs} from './reference';
import type {LimitRule, MaterialRef} from './reference';

export type ReferenceInUse = {
  materials: MaterialRef[]; rules: LimitRule[];
  materialsLabel: string; limitsLabel: string;
  materialsMock: boolean; limitsMock: boolean;
  known: (materialId: string) => boolean;
};
// Not loaded yet (or offline): the built-in sample. Loaded but switched off: no active version.
const label = (loaded: boolean, meta: {builtIn: boolean; label: string; fileName: string | null} | null | undefined) =>
  !loaded ? 'Built-in sample' : !meta ? 'No active version' : meta.builtIn ? meta.label : `${meta.label}${meta.fileName ? ` · ${meta.fileName}` : ''}`;

export function useReference(): ReferenceInUse {
  const {reference} = useDemo();
  return useMemo(() => {
    const m = reference?.materials, l = reference?.limits;
    const materials = toMaterialRefs(m ? m.rows : mockRows('materials'));
    const ids = new Set(materials.map(x => x.id));
    return {
      materials, rules: toLimitRules(l ? l.rows : mockRows('limits')),
      materialsLabel: label(!!m, m?.meta), limitsLabel: label(!!l, l?.meta),
      // True only for the invented sample versions (mock-odour.ts, limit-check-fixtures.ts).
      materialsMock: !m || m.meta?.id === 'mock-materials', limitsMock: !l || l.meta?.id === 'mock-limits',
      known: (id: string) => ids.has(id),
    };
  }, [reference]);
}
