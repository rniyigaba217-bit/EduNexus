App.register('sd-reviews', c => {
  const themes  = State.sdReviewThemes;
  const reviews = State.sdRecentReviews;
  const totalMentions = themes.reduce((s, t) => s + t.count, 0);

  const sentColor = s => s === 'positive' ? 'var(--green)' : s === 'negative' ? 'var(--red)' : 'var(--yellow)';
  const sentPill  = s => s === 'positive' ? 'pill-green'   : s === 'negative' ? 'pill-red'   : 'pill-yellow';
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const starColor = n => n >= 4 ? 'var(--green)' : n >= 3 ? 'var(--yellow)' : 'var(--red)';

  c.innerHTML = `
  <div class="stats-grid">
    ${Utils.statCard('📋','rgba(56,189,248,.15)','1,219','Total Reviews This Term','')}
    ${Utils.statCard('⭐','rgba(255,209,102,.15)','4.1 / 5','Average Rating','↓ 0.1 vs last term','down')}
    ${Utils.statCard('✅','rgba(0,212,170,.15)','58%','Positive Sentiment','')}
    ${Utils.statCard('🚨','rgba(255,107,107,.15)','43','Flagged for Follow-up','')}
  </div>

  <div class="card">
    <div class="card-title">🔁 Most Recurring Review Themes</div>
    <div style="font-size:.82rem;color:var(--text2);margin-bottom:16px">${totalMentions.toLocaleString()} total mentions across all reviews this term</div>
    ${themes.map(t => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div>
          <span style="font-size:.87rem;font-weight:600">${t.theme}</span>
          ${Utils.pill(t.sentiment, sentPill(t.sentiment))}
        </div>
        <div style="text-align:right">
          <span style="font-size:.9rem;font-weight:700">${t.count}</span>
          <span style="font-size:.75rem;color:var(--text2);margin-left:4px">mentions</span>
          <span style="margin-left:8px;font-size:.8rem;color:${t.trend === '↑' ? 'var(--red)' : t.trend === '↓' ? 'var(--green)' : 'var(--text2)'}">${t.trend} trend</span>
        </div>
      </div>
      <div style="position:relative">
        ${Utils.progressBar(t.pct, sentColor(t.sentiment))}
        <span style="position:absolute;right:0;top:-18px;font-size:.75rem;color:var(--text2)">${t.pct}% of all mentions</span>
      </div>
    </div>`).join('')}
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">📊 Sentiment Breakdown</div>
      <div style="display:flex;justify-content:space-around;padding:20px 0">
        <div style="text-align:center">
          <div style="font-size:2.2rem;font-weight:800;color:var(--green)">58%</div>
          <div style="font-size:.8rem;color:var(--text2);margin-top:4px">Positive</div>
          <div style="font-size:.75rem;color:var(--text3)">707 reviews</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:2.2rem;font-weight:800;color:var(--yellow)">27%</div>
          <div style="font-size:.8rem;color:var(--text2);margin-top:4px">Neutral</div>
          <div style="font-size:.75rem;color:var(--text3)">329 reviews</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:2.2rem;font-weight:800;color:var(--red)">15%</div>
          <div style="font-size:.8rem;color:var(--text2);margin-top:4px">Negative</div>
          <div style="font-size:.75rem;color:var(--text3)">183 reviews</div>
        </div>
      </div>
      <div style="margin-top:8px">
        <div style="display:flex;height:10px;border-radius:10px;overflow:hidden">
          <div style="width:58%;background:var(--green)"></div>
          <div style="width:27%;background:var(--yellow)"></div>
          <div style="width:15%;background:var(--red)"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📈 Review Volume by Month</div>
      ${Utils.barChart([
        { label:'Jan', value:72, color:'var(--accent)' },
        { label:'Feb', value:85, color:'var(--accent)' },
        { label:'Mar', value:91, color:'var(--accent)' },
        { label:'Apr', value:78, color:'var(--accent)' },
        { label:'May', value:96, color:'var(--blue)'   },
        { label:'Jun', value:88, color:'var(--accent)' },
      ])}
    </div>
  </div>

  <div class="card">
    <div class="card-title">💬 Recent Reviews</div>
    ${reviews.map(r => `
    <div style="padding:14px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <div>
          <span style="color:${starColor(r.stars)};font-size:.95rem;letter-spacing:1px">${stars(r.stars)}</span>
          <span style="margin-left:8px;font-size:.78rem;background:rgba(56,189,248,.1);color:#38bdf8;padding:2px 8px;border-radius:20px">${r.dept}</span>
        </div>
        <span style="font-size:.75rem;color:var(--text3)">${r.time}</span>
      </div>
      <p style="font-size:.85rem;color:var(--text2);margin:0;line-height:1.5">"${r.text}"</p>
    </div>`).join('')}
    <div style="margin-top:14px;text-align:center">
      <button class="btn-sm" onclick="Utils.toast('Loading more reviews…','info')">Load more reviews</button>
    </div>
  </div>`;
});
