import test from 'node:test';
import assert from 'node:assert/strict';
import { classify,pct,normalizeTicker,parseDate,evaluatePrice,digest,normalizeFiling,retrieve,publicUrl } from '../src/core.js';
import {RESEARCH} from '../src/fixtures.js';

test('headline calculations handle zero, negative bases and unavailable values',()=>{
  assert.equal(pct(120,100),20);assert.equal(pct(0,100),-100);assert.equal(pct(-50,-100),50);
  assert.equal(pct(50,0),null);assert.equal(pct(null,30),null);assert.equal(pct(40,undefined),null);
  assert.ok(Math.abs(pct(40925,41764)+2.0089)<.001);
});
test('ticker normalisation supports real NSE symbols and rejects injection',()=>{
  assert.equal(normalizeTicker(' infy.ns '),'INFY');assert.equal(normalizeTicker('M&M'),'M&M');assert.equal(normalizeTicker('BAJAJ-AUTO'),'BAJAJ-AUTO');
  for(const bad of ['', '../etc','<script>','TCS?symbol=X'])assert.throws(()=>normalizeTicker(bad));
});
test('specific material categories beat generic corporate phrasing',()=>{
  assert.equal(classify('Action(s) taken or orders passed'),'litigation');
  assert.equal(classify('Appointment of chief financial officer'),'management_change');
  assert.equal(classify('Other restructuring'),'M_A');
  assert.equal(classify('Audited financial results'),'results');
  assert.equal(classify('Newspaper publication of financial results'),'unclassified');
  assert.equal(classify('Analysts Institutional Investor Meet'),'investor_meetings');
  assert.equal(classify('Transcript of earnings call'),'earnings_call');
});
test('NSE timestamps have an explicit IST conversion independent of host zone',()=>{
  assert.equal(parseDate('29-Oct-2026 15:15:01'),'2026-10-29T09:45:01.000Z');assert.equal(parseDate('bad date'),null);
});
const history=Array.from({length:21},(_,i)=>({date:'2026-10-'+String(i+1).padStart(2,'0'),close:i===20?104:100,volume:i===20?2500:1000}));
test('volume ratio excludes current session and requires sufficient baseline',()=>{
  const p=evaluatePrice({ticker:'TEST',history},{priceThreshold:3,volumeThreshold:2});
  assert.equal(p.volumeRatio,2.5);assert.equal(p.baselineSessions,20);assert.equal(p.change,4);assert.equal(p.alerts.length,2);
  assert.equal(evaluatePrice({ticker:'SHORT',history:history.slice(-4)}).alerts.filter(a=>a.type==='volume').length,0);
  assert.equal(evaluatePrice({history:[]}).close,null);
});
test('digest deduplicates, rejects future events, respects window and enabled category',()=>{
  const f=normalizeFiling({symbol:'TEST',id:'one',desc:'Financial results',date:'2026-10-29T10:00:00Z',url:'https://www.nseindia.com/test.pdf'});
  const future={...f,id:'future',url:'https://www.nseindia.com/future.pdf',date:'2026-10-30T10:00:00Z'};
  const old={...f,id:'old',url:'https://www.nseindia.com/old.pdf',date:'2026-10-25T10:00:00Z'};
  const d=digest([f,f,future,old],[],{hours:24,asOf:'2026-10-29T12:00:00Z',categories:[]});
  assert.equal(d.all.length,1);assert.equal(d.material.length,0);assert.equal(d.routine.length,1);
  assert.equal(digest([f,old],[],{hours:168,asOf:'2026-10-29T12:00:00Z'}).material.length,2);
});
test('EOD alerts are scoped to digest window and do not leak future prices into replay',()=>{
  const old=digest([], [{ticker:'TEST',history}],{hours:24,asOf:'2026-10-29T12:00:00Z'});assert.equal(old.alerts.length,0);
  const now=digest([], [{ticker:'TEST',history}],{hours:24,asOf:'2026-10-21T12:00:00Z'});assert.equal(now.alerts.length,2);
});
test('retrieval abstains when no source passage matches',()=>{
  const chunks=[{sourceId:'a',page:1,text:'Revenue increased and operating cash flow improved.'}];
  assert.equal(retrieve(chunks,'cash quality').length,1);assert.equal(retrieve(chunks,'quantum computing').length,0);
});
test('only public HTTPS sources are eligible',()=>{
  assert.equal(publicUrl('https://nsearchives.nseindia.com/doc.pdf').protocol,'https:');
  for(const bad of ['http://nseindia.com','https://127.0.0.1/foo','https://localhost/x','https://user:pass@nseindia.com/','https://[::1]/','file:///tmp/x','https://host.internal/x'])assert.throws(()=>publicUrl(bad));
});
test('guidance comparison keeps consistent financial year and marks latest miss',()=>{
  const g=RESEARCH.INFY.guidance;assert.equal(g.length,4);assert.equal(g[2].low,4.5);assert.equal(g[2].actual,4.2);assert.equal(g[2].status,'Below range');assert.ok(Math.abs(g[2].actual-g[2].low+.3)<1e-12);
  assert.equal(RESEARCH.TCS.guidance,undefined);assert.equal(g[3].status,'FY2025 actual');
});
