export const CATEGORIES = {
  results: ['Results', 95], litigation: ['Regulatory / legal', 92], management_change: ['Leadership', 88],
  M_A: ['M&A', 86], fund_raise: ['Capital', 80], capex: ['Capacity', 77], credit_rating: ['Credit rating', 76],
  pledging: ['Promoter pledge', 75], insider_trading: ['Insider trades', 70], press_release: ['Business update', 65],
  dividend: ['Dividend', 57], bonus_split: ['Bonus / split', 55], earnings_call: ['Earnings call', 35],
  postal_ballot: ['Postal ballot', 22], agm_egm: ['Shareholder meeting', 20], investor_meetings: ['Investor meeting', 12], unclassified: ['Routine', 10],
};
export function classify(text='') {
  // Specific subjects win over boilerplate words in a PDF filename or company name.
  if(/newspaper|advertisement|publication of results/i.test(text))return 'unclassified';
  const rules=[['litigation',/litigation|penalty|regulatory order|insolvency|fraud|fine imposed|sebi order|action\(s\).*taken|orders passed/i],['management_change',/chief.*officer|\bcfo\b|\bceo\b|change.*management|resignation.*director|appointment.*director|change.*director/i],['M_A',/acquisition|merger|demerger|joint venture|disposal|sale of.*stake|other restructuring/i],['fund_raise',/fund rais|qip|rights issue|preferential|buyback|commercial paper/i],['results',/financial results|financial result|audited.*result|unaudited.*result|quarterly result|outcome.*board.*result/i],['credit_rating',/credit rating|rating.*reaffirm|rating.*downgrad/i],['capex',/capacity expansion|capital expenditure|new plant/i],['pledging',/pledge|encumbrance/i],['insider_trading',/insider|trading.*promoter|sast|disclosure.*acquisition.*shares/i],['bonus_split',/stock split|bonus issue|sub.division/i],['dividend',/dividend|record date/i],['earnings_call',/earnings.*call|concall|transcript|conference call/i],['investor_meetings',/analyst.*meet|investor.*meet|investor.*conference|analyst.*conference/i],['postal_ballot',/postal ballot/i],['agm_egm',/annual general meeting|extraordinary general|\bagm\b|\begm\b/i],['press_release',/press release|order win|partnership|product launch/i]];
  return rules.find(([,r])=>r.test(text))?.[0]||'unclassified';
}
export function pct(current,previous){return !Number.isFinite(current)||!Number.isFinite(previous)||previous===0?null:(current-previous)/Math.abs(previous)*100;}
export function normalizeTicker(raw){const t=String(raw||'').trim().toUpperCase().replace(/\.(NS|BO)$/,''); if(!/^[A-Z0-9&-]{1,24}$/.test(t))throw new Error('Enter an NSE symbol, for example INFY or M&M.'); return t;}
export function parseDate(value){
  if(!value)return null;
  if(/^\d{2}-[A-Za-z]{3}-\d{4}/.test(value)){
    const m=value.match(/(\d{2})-([A-Za-z]{3})-(\d{4})(?:[ T](\d\d):(\d\d)(?::(\d\d))?)?/); const months=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    return new Date(Date.UTC(+m[3],months.indexOf(m[2].toLowerCase()),+m[1],+(m[4]||0)-5,+(m[5]||0)-30,+(m[6]||0))).toISOString();
  }
  const d=new Date(value); return Number.isNaN(+d)?null:d.toISOString();
}
export function normalizeFiling(x){
  const subject=String(x.desc||x.subject||'Corporate disclosure'); const detail=String(x.attchmntText||x.details||'');
  const category=classify(subject+' '+detail.slice(0,500));
  const sourceUrl=x.attchmntFile||x.url||'https://www.nseindia.com/companies-listing/corporate-filings-announcements';
  return {id:String(x.seq_id||x.id||sourceUrl),ticker:x.symbol||x.ticker,name:x.sm_name||x.name||x.symbol,subject,detail:detail.slice(0,1600),category,date:parseDate(x.an_dt||x.sort_date||x.date),url:sourceUrl,score:CATEGORIES[category][1],source:x.source||'NSE filing',verified:true};
}
export function evaluatePrice(p,prefs={}){
  const history=p.history||[]; if(history.length<2)return {...p,close:null,change:null,volumeRatio:null,alerts:[]};
  const today=history.at(-1), prior=history.at(-2), baseline=history.slice(-21,-1).filter(h=>h.volume>0);
  const avg=baseline.length?baseline.reduce((s,h)=>s+h.volume,0)/baseline.length:0;
  const change=pct(today.close,prior.close), ratio=avg?today.volume/avg:null, alerts=[];
  if(change!==null&&Math.abs(change)>=(prefs.priceThreshold??3))alerts.push({type:'price',label:`${change>=0?'+':''}${change.toFixed(2)}% close-to-close`,value:change});
  if(baseline.length>=10&&ratio!==null&&ratio>=(prefs.volumeThreshold??2))alerts.push({type:'volume',label:`${ratio.toFixed(1)}× recent volume`,value:ratio});
  return {...p,close:today.close,date:today.date,change,volume:today.volume,volumeRatio:ratio,baselineSessions:baseline.length,alerts};
}
export function digest(filings,portfolio,{hours=24,asOf=new Date().toISOString(),priceThreshold=3,volumeThreshold=2,categories=Object.keys(CATEGORIES)}={}){
  const upper=+new Date(asOf),lower=upper-Math.max(1,Math.min(720,+hours||24))*3600000;
  const seen=new Set();
  const selected=filings.filter(f=>{
    const date=+new Date(f.date); const key=f.ticker+'|'+f.url;
    if(!Number.isFinite(date)||date<lower||date>upper||seen.has(key))return false; seen.add(key); return true;
  }).map(f=>({...f,material:f.score>=65&&categories.includes(f.category)})).sort((a,b)=>b.score-a.score||new Date(b.date)-new Date(a.date));
  const prices=portfolio.map(p=>evaluatePrice(p,{priceThreshold,volumeThreshold}));
  // EOD alerts belong to the selected window as well. NSE closes at 15:30 IST.
  const alerts=prices.flatMap(p=>{const d=+new Date(p.date+'T15:30:00+05:30');return d>=lower&&d<=upper?p.alerts.map(a=>({...a,ticker:p.ticker,name:p.name,date:p.date,url:p.url})):[];});
  return {material:selected.filter(f=>f.material),routine:selected.filter(f=>!f.material),all:selected,prices,alerts,asOf};
}
export function cleanHtml(raw){return raw.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();}
export function chunksFor(pages,source){
  return pages.flatMap((page,i)=>{const text=String(page.text||page).replace(/\s+/g,' ');const chunks=[];for(let start=0;start<Math.min(text.length,180000);start+=800){const begin=start===0?0:Math.max(start,text.indexOf(' ',start)+1);const next=text.indexOf(' ',begin+1100);const end=next<0?text.length:next;chunks.push({text:text.slice(begin,end).trim(),page:page.page||i+1,sourceId:source.id,url:source.url,title:source.title});}return chunks;});
}
export function retrieve(chunks,question,limit=6){
  const stop=new Set(['what','does','company','the','and','for','with','this','that','from','have','are']);
  const synonyms={cash:['cash','operating','conversion','capital'],guidance:['guidance','expect','outlook','growth'],risk:['risk','uncertainty','headwind','decline'],business:['segment','services','revenue'],balance:['debt','borrowings','liabilities']};
  const words=question.toLowerCase().match(/[a-z0-9]{3,}/g)||[]; const terms=[...new Set(words.filter(w=>!stop.has(w)).flatMap(w=>[w,...(synonyms[w]||[])]))];
  return chunks.map(c=>({...c,score:terms.reduce((score,t)=>score+(c.text.toLowerCase().includes(t)?1:0),0)})).filter(c=>c.score>0).sort((a,b)=>b.score-a.score).filter((c,i,a)=>a.findIndex(x=>x.sourceId===c.sourceId&&x.page===c.page)===i).slice(0,limit);
}
export function publicUrl(raw){
  let u;try{u=new URL(raw);}catch{throw new Error('Invalid source URL');}
  const host=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||u.username||u.password||u.port||!host.includes('.')||host.includes(':')||/^\d/.test(host)||/(^|\.)(localhost|local|internal|test|example|invalid)$/.test(host)||host.endsWith('.localhost'))throw new Error('Only public HTTPS company or exchange documents are allowed.');
  return u;
}
