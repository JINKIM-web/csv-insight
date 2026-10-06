import {config} from 'dotenv';config({path:'.env.local'});config();process.env.APP_MODE ||= 'local';
const {serve}=await import('@hono/node-server');const {createApp}=await import('./app');
serve({fetch:createApp().fetch,hostname:'127.0.0.1',port:3002},()=>console.log('CSV Insight API · http://127.0.0.1:3002 · '+process.env.APP_MODE));
