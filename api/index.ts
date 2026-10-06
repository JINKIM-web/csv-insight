import {getRequestListener} from '@hono/node-server';import {createApp} from '../server/app';
export const config={maxDuration:120};export default getRequestListener(createApp().fetch);
