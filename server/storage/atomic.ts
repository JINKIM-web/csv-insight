import {rename} from 'node:fs/promises';
export async function atomicRename(source:string,target:string){for(let attempt=0;attempt<8;attempt++){try{await rename(source,target);return}catch(e){if(!['EPERM','EACCES','EBUSY'].includes((e as NodeJS.ErrnoException).code||'')||attempt===7)throw e;await new Promise(r=>setTimeout(r,30*(attempt+1)))}}}
