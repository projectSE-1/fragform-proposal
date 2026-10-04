// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {createContext, useContext} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {Formula, Page} from './model';
export type DemoContextValue = {
  page:Page; navigate:(page:Page)=>void;
  locale:'en'|'th'; t:(english:string,thai:string)=>string;
  formulas:Formula[]; setFormulas:Dispatch<SetStateAction<Formula[]>>;
  selectedId:string; selectFormula:(id:string)=>void;
  notify:(message:string)=>void;
  reset:()=>void;
  dirty:boolean; setDirty:(value:boolean)=>void;
};
export const DemoContext = createContext<DemoContextValue|null>(null);
export function useDemo() {
  const value = useContext(DemoContext);
  if(!value) throw new Error('Demo context is required.');
  return value;
}
