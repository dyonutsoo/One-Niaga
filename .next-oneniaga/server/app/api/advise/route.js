"use strict";(()=>{var e={};e.id=657,e.ids=[657],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2007:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>g,patchFetch:()=>v,requestAsyncStorage:()=>f,routeModule:()=>m,serverHooks:()=>y,staticGenerationAsyncStorage:()=>h});var n={};r.r(n),r.d(n,{POST:()=>c});var a=r(3277),o=r(5265),s=r(5356),i=r(7076),l=r(4118),u=r(9764),d=r(7191),p=r(4960);async function c(e){let t;try{t=await e.json()}catch{return i.NextResponse.json({error:"Invalid JSON body"},{status:400})}let r=t.products??[],n=t.orders??[],a=u.Z5.find(e=>e.id===t.lang)?.label||"English",o=u.VT.map(e=>`${e.name}: ${n.filter(t=>t.platform===e.id&&"delivered"!==t.status).length}`).join(", "),s=r.map(e=>{let t=u.VT.map(t=>{let r=e.returns?.[t.id],n=(0,p.YJ)(r?.reasons);return`${t.name}: ${r?.total||0} returns${n?` (top reason: ${n.key})`:""}`}).join("; ");return`- ${e.name}: ${t}`}).join("\n"),c=r.filter(e=>(0,p.JK)(e.platformPrices)>3).map(e=>`- ${e.name}: price varies by RM ${(0,p.JK)(e.platformPrices).toFixed(2)} across platforms`).join("\n")||"None",m=`You are OneNiaga's AI business advisor for a Malaysian multi-platform seller. Based on this simulated data, produce today's prioritised action list.
Write your entire response (titles and reasons) in ${a}, regardless of the language this data is written in.

Inventory (product, units left, average units sold per day):
${r.map(e=>`- ${e.name}: ${e.stock} units left, selling ~${e.dailySales}/day`).join("\n")}

Orders not yet delivered, by platform: ${o}

Last 7 days revenue by platform:
${JSON.stringify(d.cy)}

Returns and return reasons per product, per platform (last 7 days):
${s}

Products with inconsistent pricing across platforms:
${c}

Generate 3-5 prioritised recommendations. Cover restocking, platform focus, AND at least one recommendation about returns or pricing if the data above shows a real issue.

Respond with ONLY plain lines in exactly this format — one recommendation per line, nothing else before or after, no markdown, no numbering, no bullet points:
level|title|reason

Where level is exactly one of: high, medium, low. title is under 8 words (in ${a}). reason is one sentence grounded in the numbers above (in ${a}). Do not use any "|" character inside title or reason. Do not wrap anything in quotes.
Example line: high|Restock Product A today|Only 2 days of stock left at the current sales pace.`;try{let e=await (0,l.SB)(m),t=(0,l.Ud)(e);return i.NextResponse.json({priorities:t})}catch(t){let e=t instanceof Error?t.message:"Unknown error";return i.NextResponse.json({error:e},{status:502})}}let m=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/advise/route",pathname:"/api/advise",filename:"route",bundlePath:"app/api/advise/route"},resolvedPagePath:"C:\\Users\\laila\\oneniaga\\_codex_recovered_ui\\app\\api\\advise\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:f,staticGenerationAsyncStorage:h,serverHooks:y}=m,g="/api/advise/route";function v(){return(0,s.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:h})}},4960:(e,t,r)=>{r.d(t,{JK:()=>s,YJ:()=>o,ce:()=>a});var n=r(9764);function a(e){return n.VT.find(t=>t.id===e)?.name||e}function o(e){if(!e)return null;let t=Object.entries(e).filter(([,e])=>(e??0)>0);return 0===t.length?null:(t.sort((e,t)=>t[1]-e[1]),{key:t[0][0],count:t[0][1]})}function s(e){let t=Object.values(e||{}).filter(e=>"number"==typeof e&&!isNaN(e));return t.length<2?0:Math.max(...t)-Math.min(...t)}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[942,786,684],()=>r(2007));module.exports=n})();