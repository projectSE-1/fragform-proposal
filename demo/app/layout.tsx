// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
import type {Metadata} from 'next';
import {themeBootstrap} from '@/lib/theme';
import './globals.css';
export const metadata:Metadata={title:'AI Perfumery Engine · AI Perfumery Engine Demo',description:'Synthetic MVP interaction prototype. No real materials, credentials or chemical results.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeBootstrap}}/></head><body>{children}</body></html>;}
