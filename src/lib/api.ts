import {cachedResponse} from './history';
let tokenProvider:()=>Promise<string|null>=async()=>null;
export function setTokenProvider(fn:()=>Promise<string|null>){tokenProvider=fn}
export const apiBase=import.meta.env.VITE_API_BASE_URL||'/api/v1';
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{if(!options.method||options.method==='GET'){const cached=await cachedResponse(path).catch(()=>undefined);if(cached!==undefined)return cached as T}const token=await tokenProvider(),headers=new Headers(options.headers);if(options.body&&typeof options.body==='string')headers.set('Content-Type','application/json');if(token)headers.set('Authorization','Bearer '+token);const response=await fetch(apiBase+path,{...options,headers});if(!response.ok){const body=await response.json().catch(()=>({error:{message:'서버에 연결할 수 없습니다.'}}));throw new Error(body.error?.message||'요청에 실패했습니다.')}return response.status===204?undefined as T:response.json()}
export async function authHeaders():Promise<Record<string,string>>{const token=await tokenProvider();return token?{Authorization:'Bearer '+token}:{}}
export async function download(path:string,filename:string){const response=await fetch(apiBase+path,{headers:await authHeaders()});if(!response.ok)throw new Error('다운로드에 실패했습니다.');saveBlob(await response.blob(),filename)}
export function saveBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
