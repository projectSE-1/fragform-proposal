// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// The active reference data as the formula workspace reads it. Before the first load, or when the
// local server cannot be reached, the built-in mock is used and labelled as mock.
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
const label = (meta: {builtIn: boolean; label: string; fileName: string | null} | undefined) =>
  !meta || meta.builtIn ? 'Mock (built-in)' : `${meta.label}${meta.fileName ? ` · ${meta.fileName}` : ''}`;

export function useReference(): ReferenceInUse {
  const {reference} = useDemo();
  return useMemo(() => {
    const m = reference?.materials, l = reference?.limits;
    const materials = toMaterialRefs(m ? m.rows : mockRows('materials'));
    const ids = new Set(materials.map(x => x.id));
    return {
      materials, rules: toLimitRules(l ? l.rows : mockRows('limits')),
      materialsLabel: label(m?.meta), limitsLabel: label(l?.meta),
      materialsMock: !m || m.meta.builtIn, limitsMock: !l || l.meta.builtIn,
      known: (id: string) => ids.has(id),
    };
  }, [reference]);
}
