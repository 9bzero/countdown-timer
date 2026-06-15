import{useState,useEffect,useRef}from'react'
  interface Timer{id:string;label:string;total:number;remaining:number;running:boolean;done:boolean}
  const PRESETS=[{label:'5 min',s:300},{label:'10 min',s:600},{label:'25 min',s:1500},{label:'1 hour',s:3600}]
  const uid=()=>Math.random().toString(36).slice(2,8)
  const fmt=(s:number)=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h>0?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}
  export default function App(){
    const[timers,setTimers]=useState<Timer[]>([])
    const[label,setLabel]=useState('My Timer')
    const[h,setH]=useState(0)
    const[m,setM]=useState(5)
    const[s,setS]=useState(0)
    const intRef=useRef<ReturnType<typeof setInterval>|null>(null)
    useEffect(()=>{
      intRef.current=setInterval(()=>{
        setTimers(ts=>ts.map(t=>{
          if(!t.running||t.done)return t
          if(t.remaining<=1){
            new Notification?.('Timer Done',{body:t.label+' finished!'}).catch(()=>{})
            return{...t,remaining:0,running:false,done:true}
          }
          return{...t,remaining:t.remaining-1}
        }))
      },1000)
      return()=>{if(intRef.current)clearInterval(intRef.current)}
    },[])
    const add=(preset?:{label:string;s:number})=>{
      const total=preset?preset.s:h*3600+m*60+s
      if(total<=0)return
      setTimers(ts=>[...ts,{id:uid(),label:preset?preset.label:label,total,remaining:total,running:false,done:false}])
    }
    const toggle=(id:string)=>setTimers(ts=>ts.map(t=>t.id===id?{...t,running:!t.running}:t))
    const reset=(id:string)=>setTimers(ts=>ts.map(t=>t.id===id?{...t,remaining:t.total,running:false,done:false}:t))
    const remove=(id:string)=>setTimers(ts=>ts.filter(t=>t.id!==id))
    return(
      <div style={{minHeight:'100vh',background:'#0f172a',fontFamily:'Inter,system-ui,sans-serif',color:'#e2e8f0',padding:'2rem'}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'1.5rem',color:'#f8fafc',textAlign:'center'}}>⏱ Countdown Timers</h1>
          <div style={{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:'0.75rem',marginBottom:'1rem',alignItems:'center'}}>
              <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Timer label..." style={{background:'#0f172a',border:'1px solid #334155',borderRadius:6,padding:'0.5rem 0.75rem',color:'#e2e8f0',outline:'none',fontSize:'0.9rem'}}/>
              {[{val:h,set:setH,label:'h',max:99},{val:m,set:setM,label:'m',max:59},{val:s,set:setS,label:'s',max:59}].map(({val,set,label:lbl,max})=>(
                <div key={lbl} style={{display:'flex',alignItems:'center',gap:4}}>
                  <input type="number" min={0} max={max} value={val} onChange={e=>set(Math.max(0,Math.min(max,+e.target.value)))} style={{width:52,background:'#0f172a',border:'1px solid #334155',borderRadius:6,padding:'0.5rem',color:'#e2e8f0',outline:'none',textAlign:'center',fontSize:'0.9rem'}}/>
                  <span style={{color:'#475569',fontSize:'0.8rem'}}>{lbl}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
              <button onClick={()=>add()} style={{padding:'0.6rem 1.5rem',background:'#0ea5e9',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>+ Add Timer</button>
              {PRESETS.map(p=><button key={p.label} onClick={()=>add(p)} style={{padding:'0.6rem 1rem',background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:8,cursor:'pointer',fontSize:'0.85rem'}}>{p.label}</button>)}
            </div>
          </div>
          {timers.length===0&&<div style={{textAlign:'center',color:'#475569',padding:'3rem'}}>No timers yet — add one above</div>}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {timers.map(t=>{
              const pct=((t.total-t.remaining)/t.total)*100
              return(
                <div key={t.id} style={{background:'#111827',border:`1px solid ${t.done?'#166534':t.running?'#1e40af':'#1e293b'}`,borderRadius:12,padding:'1.25rem',transition:'border-color 0.3s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
                    <span style={{fontWeight:600,color:t.done?'#86efac':'#f1f5f9'}}>{t.label} {t.done&&'✓'}</span>
                    <button onClick={()=>remove(t.id)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:'1.1rem'}}>×</button>
                  </div>
                  <div style={{fontSize:'2.5rem',fontWeight:800,color:t.done?'#86efac':t.running?'#38bdf8':'#e2e8f0',fontFamily:'JetBrains Mono,monospace',marginBottom:'0.75rem'}}>{fmt(t.remaining)}</div>
                  <div style={{height:4,background:'#1e293b',borderRadius:2,marginBottom:'1rem'}}><div style={{height:'100%',background:t.done?'#22c55e':'#38bdf8',borderRadius:2,width:`${pct}%`,transition:'width 1s linear'}}/></div>
                  <div style={{display:'flex',gap:'0.75rem'}}>
                    <button onClick={()=>toggle(t.id)} disabled={t.done} style={{padding:'0.5rem 1.25rem',background:t.running?'#dc2626':'#0ea5e9',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:'0.85rem',opacity:t.done?0.5:1}}>{t.running?'⏸ Pause':'▶ Start'}</button>
                    <button onClick={()=>reset(t.id)} style={{padding:'0.5rem 1rem',background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:6,cursor:'pointer',fontSize:'0.85rem'}}>↺ Reset</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }