import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {default:worker}=await import(pathToFileURL(resolve('worker/index.js')).href+'?v='+Date.now());
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
  try{const parts=[];for await(const chunk of req)parts.push(chunk);const body=Buffer.concat(parts);const url=`http://localhost:${port}${req.url}`;const request=new Request(url,{method:req.method,headers:req.headers,...(body.length?{body,duplex:'half'}:{})});
    const response=await worker.fetch(request,{AI_API_KEY:process.env.AI_API_KEY,AI_API_URL:process.env.AI_API_URL,AI_MODEL:process.env.AI_MODEL},{});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch(e){res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:e.message}));}
}).listen(port,'127.0.0.1',()=>console.log(`FINN Local: http://localhost:${port}`));
