// src/pages/JobDetails.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBusiness } from '../business/BusinessContext.jsx';
import { getJob } from '../services/businessService.js';
import { cur, formatDate, formatDateLong } from '../utils/index.js';
import { Card, SectionLabel, BackButton } from '../components/index.jsx';
import { COLORS, RADIUS } from '../config/theme.js';

export function JobDetails() {
  const nav = useNavigate();
  const { id } = useParams();
  const { bizId, brandColor } = useBusiness();
  const color = brandColor || COLORS.primary;
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!bizId || !id) return;
    getJob(bizId, id).then(setJob);
  }, [bizId, id]);

  if (!job) return (
    <div style={{ height:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', color:COLORS.muted }}>Loading...</div>
  );

  const p = job.pricing || {};

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', background:COLORS.bg }}>
      <div style={{ background:'#fff', borderBottom:`1px solid ${COLORS.border}`, padding:'16px 20px 14px', display:'flex', alignItems:'center', gap:12, paddingTop:'calc(16px + env(safe-area-inset-top,0px))' }}>
        <BackButton onClick={() => nav('/jobs')}/>
        <div style={{ flex:1, fontSize:18, fontWeight:700 }}>{job.serviceName}</div>
        <button onClick={() => nav(`/jobs/${id}/edit`)} style={{ background:COLORS.bg, border:`1.5px solid ${COLORS.border}`, borderRadius:RADIUS.md, padding:'8px 14px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Edit</button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:16, paddingBottom:32 }}>
        <Card style={{ padding:20, marginBottom:12, textAlign:'center', background:'#111' }}>
          <div style={{ fontSize:10, color:'#555', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Job Revenue</div>
          <div style={{ fontFamily:'monospace', fontSize:40, fontWeight:700, color:'#fff', marginBottom:4 }}>{cur(p.revenue)}</div>
          <div style={{ fontSize:13, color:'#555' }}>{formatDateLong(job.date)}{job.location?.areaName ? ` · ${job.location.areaName}` : ''}</div>
        </Card>

        <Card style={{ padding:16, marginBottom:12 }}>
          <SectionLabel style={{ marginTop:0 }}>Job P&L</SectionLabel>
          {[
            ['Material Cost',  p.materialCost,  COLORS.error],
            ['Other Costs',    p.otherJobCost,  COLORS.error],
            ['Labor Cost',     p.laborCost,     COLORS.error],
            ['Travel Cost',    p.travelCost,    COLORS.error],
            ['Travel Fee',     p.travelFee,     COLORS.muted],
          ].filter(([,v]) => v > 0).map(([l,v,c]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${COLORS.border}`, fontSize:13 }}>
              <span style={{ color:COLORS.muted }}>{l}</span>
              <span style={{ fontFamily:'monospace', fontWeight:600, color:c }}>−{cur(v)}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, fontSize:15, fontWeight:700 }}>
            <span>Net Profit</span>
            <span style={{ fontFamily:'monospace', color:p.netProfit>=0?COLORS.success:COLORS.error }}>{cur(p.netProfit)}</span>
          </div>
        </Card>

        <Card style={{ padding:16, marginBottom:12 }}>
          {job.customer?.name  && <Row label="Customer" val={job.customer.name}/>}
          {job.customer?.phone && <Row label="Phone" val={job.customer.phone}/>}
          <Row label="Payment" val={`${job.payment?.method} — ${job.payment?.status}`}/>
          {job.travel?.miles > 0 && <Row label="Miles" val={`${job.travel.miles} mi`}/>}
          {job.jobDetails?.data?.tireSize && <Row label="Tire Size" val={job.jobDetails.data.tireSize}/>}
          {job.notes && <Row label="Notes" val={job.notes}/>}
        </Card>

        <button onClick={() => nav(`/jobs/${id}/invoice`)} style={{ width:'100%', background:color, color:'#fff', border:'none', borderRadius:RADIUS.md, padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          🧾 View Invoice
        </button>
      </div>
    </div>
  );
}

function Row({ label, val }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${COLORS.border}`, fontSize:13 }}>
      <span style={{ color:COLORS.muted }}>{label}</span>
      <span style={{ fontWeight:600, color:'#111', textAlign:'right', maxWidth:'60%' }}>{val}</span>
    </div>
  );
}
