// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
export const THEME_STORAGE_KEY='fragrance-studio.theme';
export type Theme='light'|'dark';
// Static, local-only preference bootstrap runs before the body is painted.
export const themeBootstrap=`(()=>{let theme='light';try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark')theme='dark';}catch{}document.documentElement.dataset.theme=theme;})();`;
