export class AppError extends Error {constructor(public code:string,message:string,public status=422,public details:Record<string,unknown>={}){super(message)}}
export const requireValue=(value:unknown,code:string,message:string,status=422)=>{if(!value)throw new AppError(code,message,status)};
