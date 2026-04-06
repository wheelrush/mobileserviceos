// src/pages/Jobs.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../business/BusinessContext.jsx';
import { listenJobs } from '../services/businessService.js';
import { cur, formatDateLong } from '../utils/index.js';
import { Screen, Card, EmptyState, StatusBadge } from '../components/index.jsx';
import { COLORS, RADIUS } from '../config/theme.js';

export function Jobs() {
  const nav = useNavigate();
  const { bizId, brandColor } = useBusiness();
  const color = brandColor || COLORS.primary;
  const [jobs,   setJobs]   = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!bizId) return;
    return listenJobs(bizId, setJobs, 200);
  }, [bizId]);

  const filtered = useMemo(() => {
    let j = jobs;
    if (filter !== 'all') j = j.filter(x => x.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      j = j.filter(x =>
        x.serviceName?.toLowerCase().includes(q) ||
        x.customer?.name?.toLowerCase().includes(q) ||
        x.location?.areaName?.toLowerCase().includes(q) ||
        x.jobDetails?.data?.tireSize?.toLowerCase().includes(q)
      );
    }
    return j;
  }, [jobs, search, filter]);

  const totalRev = filtered.reduce((s, j) => s + (j.pricing?.revenue || 0), 0);

  return (
    <Screen title="Jobs" action={
      <button onClick={() => nav('/jobs/new')} style={{ background:color, color:'#fff', border:'none', borderRadius:RADIUS.md, padding:'8px 16px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Add</button>
    }>
      <input value={search} onChange={e => setSearch(e.target.value)}
        style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${COLORS.border}`, borderRadius:RADIUS.md, fontSize:14, marginBottom:10, fontFamily:'inherit', background:'#fff', outline:'none' }}
        placeholder="🔍  Search jobs..."/>

      <div style={{ display:'flex', gap:8, marginBottom:14, overflowX:'auto', whiteSpace:'nowrap' }}>
        {[['all','All'],['completed','Paid'],['pending','Pending']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding:'6px 14px', borderRadius:RADIUS.full, border:`1.5px solid ${filter===v?color:COLORS.border}`, background:filter===v?color:'#fff', color:filter===v?'#fff':COLORS.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
            {l}
          </button>
        ))}
        <div style={{ marginLeft:'auto', fontFamily:'monospace', fontSize:13, color:COLORS.muted, display:'flex', alignItems:'center', flexShrink:0 }}>{cur(totalRev)}</div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="No jobs" subtitle={search ? 'No jobs match your search.' : 'Add your first job to get started.'}
          action={!search && <button onClick={() => nav('/jobs/new')} style={{ background:color, color:'#fff', border:'none', borderRadius:RADIUS.md, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Add Job</button>}/>
      ) : (
        filtered.map(job => (
          <Card key={job.id} style={{ marginBottom:8, cursor:'pointer' }} onClick={() => nav(`/jobs/${job.id}`)}>
            <div style={{ display:'flex', alignItems:'center', padding:'12px 14px', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#111' }}>{job.serviceName}</span>
                  <StatusBadge status={job.status}/>
                </div>
                <div style={{ fontSize:12, color:COLORS.muted }}>
                  {formatDateLong(job.date)}{job.location?.areaName ? ` · ${job.location.areaName}` : ''}{job.customer?.name ? ` · ${job.customer.name}` : ''}
                </div>
                {job.jobDetails?.data?.tireSize && (
                  <div style={{ fontSize:11, color:COLORS.mutedLight, marginTop:1 }}>🛞 {job.jobDetails.data.tireSize}{job.jobDetails.data.quantity>1?` ×${job.jobDetails.data.quantity}`:''}</div>
                )}
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:'monospace', fontSize:16, fontWeight:700 }}>{cur(job.pricing?.revenue || 0)}</div>
                <div style={{ fontSize:11, color:COLORS.muted }}>Net: {cur(job.pricing?.netProfit || 0)}</div>
              </div>
            </div>
          </Card>
        ))
      )}
    </Screen>
  );
}
