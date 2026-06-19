App.register('school-analysis', c => {
  c.innerHTML = `
  <div class="card">
    <div class="card-title">🏫 Performance Across All Universities</div>
    <table>
      <thead><tr><th>University</th><th>Students</th><th>Pass Rate</th><th>Avg GPA</th><th>Dropout</th><th>Satisfaction</th><th>Rank</th></tr></thead>
      <tbody>
        ${[['University of Technology',4821,'82%','78.4%','3.1%','4.6/5',1],['State Medical University',2140,'88%','83.2%','2.8%','4.7/5',2],['National Engineering',3210,'79%','75.1%','4.2%','4.3/5',3],['Arts & Sciences',1840,'71%','69.8%','6.4%','3.9/5',4],['Business School',2410,'80%','76.2%','3.8%','4.2/5',5],['Southern Polytechnic',1620,'68%','65.3%','8.1%','3.6/5',6]].map(([n,s,p,g,d,sat,r])=>`
        <tr><td><strong>${n}</strong></td><td>${s.toLocaleString()}</td>
          <td style="color:${parseInt(p)>=80?'var(--green)':'var(--yellow)'};font-weight:700">${p}</td>
          <td>${g}</td><td style="color:${parseFloat(d)<=4?'var(--green)':'var(--red)'}">${d}</td>
          <td><span style="color:var(--yellow)">★</span> ${sat}</td>
          <td style="font-weight:700;color:var(--text2)">#${r}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});
