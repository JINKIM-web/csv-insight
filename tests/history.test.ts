import {describe,it,expect} from 'vitest';
import {retained,retentionMs} from '../src/lib/history';
import {analyze} from '../server/analysis/engine';
import {parseData} from '../server/analysis/parser';
describe('browser history retention',()=>{
it('keeps the five most recently used entries, regardless of creation order',()=>{const now=10*retentionMs;const entries=Array.from({length:8},(_,i)=>({id:String(i),lastUsed:now-i*1000}));expect(retained(entries.reverse(),now).map(i=>i.id)).toEqual(['0','1','2','3','4'])});
it('expires exactly at seven days and keeps an entry one millisecond before expiration',()=>{const now=10*retentionMs;expect(retained([{id:'expired',lastUsed:now-retentionMs},{id:'valid',lastUsed:now-retentionMs+1}],now).map(i=>i.id)).toEqual(['valid'])});
it('opening an older entry extends its retention and moves it ahead of newer entries',()=>{const now=10*retentionMs;const old={id:'old',lastUsed:now-retentionMs+1};old.lastUsed=now;expect(retained([old,{id:'new',lastUsed:now-1}],now)[0].id).toBe('old');expect(retained([old],now+retentionMs-1)).toHaveLength(1);expect(retained([old],now+retentionMs)).toHaveLength(0)});
it('does not modify source entries and handles empty history',()=>{const all=[{id:'a',lastUsed:0}];expect(retained(all,retentionMs)).toEqual([]);expect(all).toHaveLength(1);expect(retained([])).toEqual([])});
});
it('applies row range and group values to actual analysis while keeping original row count',async()=>{const p=await parseData(new TextEncoder().encode('y,group\n1,A\n2,B\n3,A\n4,B\n'),{delimiter:',',header:true,missingTokens:['']});const r=analyze(p,{targets:['c1'],rowStart:2,rowEnd:4,groupColumnId:'c2',groupValues:['A']});expect(r.originalRowCount).toBe(4);expect(r.rowCount).toBe(1);expect(r.columns[0].stats?.mean).toBe(3)});
