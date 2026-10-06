// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
'use client';
import {createContext, useContext} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {Formula, FormulaVersion, Page, Role} from './model';
export type DemoContextValue = {
  page:Page; navigate:(page:Page)=>void; role:Role; setRole:(role:Role)=>void;
  locale:'en'|'th'; t:(english:string,thai:string)=>string;
  formulas:Formula[]; setFormulas:Dispatch<SetStateAction<Formula[]>>;
  selectedId:string; selectFormula:(id:string)=>void;
  notify:(message:string)=>void;
  reset:()=>void;
  // Local JSON store. 'loading' until the first read; 'offline' means changes stay in this tab only.
  store:{state:'loading'|'saved'|'offline';revision:number};
  createFormula:(name:string,version:FormulaVersion)=>Promise<SaveResult<Formula>>;
  saveVersion:(formulaId:string,version:FormulaVersion,note:string)=>Promise<SaveResult<FormulaVersion>>;
  dirty:boolean; setDirty:(value:boolean)=>void;
  authIntent:'reset'|'recovery'|null; setAuthIntent:(intent:'reset'|'recovery'|null)=>void;
};
// [English, Thai] error copy, so the caller can show it in the current language.
export type SaveResult<T> = {ok:true;value:T}|{ok:false;error:readonly [string,string]};
export const DemoContext = createContext<DemoContextValue|null>(null);
export function useDemo() {
  const value = useContext(DemoContext);
  if(!value) throw new Error('Demo context is required.');
  return value;
}
