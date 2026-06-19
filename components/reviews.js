const Reviews = (() => {

  const mockReviews = [
    { tag:'Teaching Quality', text:'Professor Williams is outstanding. She breaks complex algorithms into digestible steps.', stars:5, course:'Data Structures', time:'2 hours ago' },
    { tag:'Infrastructure',   text:'The computer labs desperately need upgrades. Half the machines are too slow for modern IDEs.', stars:2, course:'General', time:'Yesterday' },
    { tag:'Course Content',   text:'The OS curriculum is very well structured. Loved the practical projects.', stars:4, course:'Operating Systems', time:'2 days ago' },
    { tag:'Admin Process',    text:'Registration process is way too complicated. Took 3 weeks to resolve a conflict.', stars:2, course:'Administration', time:'3 days ago' },
    { tag:'Teaching Quality', text:'The algorithms course is tough but fair. Would appreciate more office hours.', stars:3, course:'Algorithms', time:'4 days ago' },
  ];

  function render(c) {
    const canReview = State.currentRole === 'student';
    const canManage = ['facilitator','uni-admin','super-admin','ministry'].includes(State.currentRole);

    c.innerHTML = `
    <div class="section-header">
      <div style="font-size:.9rem;color:var(--text2)">🔒 All reviews are submitted anonymously</div>
      ${canReview ? `<button class="btn-sm btn-primary" onclick="Reviews.openForm()">+ Write Review</button>` : ''}
    </div>
    ${mockReviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-author">👤 Anonymous · ${r.time}</div>
        <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      </div>
      <div class="review-text">${r.text}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
        <div class="review-tag"># ${r.tag} · ${r.course}</div>
        ${canManage ? `<div style="display:flex;gap:6px">
          <button class="btn-sm btn-secondary" onclick="Reviews.reply(this)">Reply</button>
          <button class="btn-sm btn-danger"    onclick="Reviews.flag(this)">Flag</button>
        </div>` : ''}
      </div>
    </div>`).join('')}`;
  }

  function openForm() {
    Utils.openModal('Write Anonymous Review', `
      <div style="background:rgba(108,99,255,.08);border:1px solid rgba(108,99,255,.2);border-radius:8px;padding:12px;margin-bottom:16px;font-size:.85rem;color:var(--text2)">
        🔒 Your identity is never revealed. Reviews are fully anonymous.
      </div>
      <div class="form-group"><label>Category</label>
        <select><option>Teaching Quality</option><option>Infrastructure</option><option>Course Content</option><option>Admin Process</option><option>Other</option></select>
      </div>
      <div class="form-group"><label>Course (optional)</label>
        <select><option>General</option>${State.courses.map(c => `<option>${c.name} (${c.code})</option>`).join('')}</select>
      </div>
      <div class="form-group"><label>Rating</label>
        <div style="display:flex;gap:10px;font-size:1.5rem;cursor:pointer" id="star-row">
          ${[1,2,3,4,5].map(i => `<span onclick="Utils.setStars(${i})">☆</span>`).join('')}
        </div>
      </div>
      <div class="form-group"><label>Your Review</label>
        <textarea class="answer-box" id="review-text" placeholder="Share your honest experience…"></textarea>
      </div>
      <div style="display:flex;gap:10px;margin-top:4px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="Reviews.submit()">Submit Anonymously</button>
      </div>`);
  }

  function submit() {
    Utils.closeModal();
    Utils.toast('Review submitted anonymously! Thank you.', 'success');
  }

  function reply(btn) { Utils.toast('Reply feature coming soon', 'info'); }
  function flag(btn)  { Utils.toast('Review flagged for review', 'error'); }

  return { render, openForm, submit, reply, flag };
})();

App.register('reviews', c => Reviews.render(c));
