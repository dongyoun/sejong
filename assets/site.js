// 배포 안내문(latest.json)을 읽어 판 번호·내려받기 주소·고친 것을 채운다. 안내문이 없으면 '준비 중' 으로 둔다.
(async () => {
  const $ = (s) => document.querySelector(s);
  const all = (s) => document.querySelectorAll(s);
  const mb = (n) => `${Math.round(n / 1048576)}MB`;
  try {
    const r = await fetch('latest.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    const m = await r.json();
    const dmg = m.mac && m.mac.arm64 && m.mac.arm64.dmg;
    const zip = m.mac && m.mac.arm64 && m.mac.arm64.zip;
    if (!dmg) throw new Error('no-mac');
    // 화면 묶음만 올린 판이 있으면 '고친 것'은 그 판을 보여 준다 (설치 파일을 받아도 처음 실행 때 그 판이 된다)
    const newest = m.bundle && m.bundle.notes ? m.bundle : m;
    all('[data-ver]').forEach((el) => (el.textContent = newest.version));
    all('[data-date]').forEach((el) => (el.textContent = m.date));
    all('[data-dl="dmg"]').forEach((el) => {
      el.href = dmg.url;
      el.classList.remove('disabled');
    });
    all('[data-dl="zip"]').forEach((el) => (el.href = zip ? zip.url : dmg.url));
    all('[data-dl-meta]').forEach((el) => (el.textContent = `${m.version} · ${mb(dmg.size)} · Apple Silicon`));
    all('[data-sha]').forEach((el) => (el.textContent = dmg.sha256));
    const notes = $('[data-notes]');
    if (notes && !newest.notes) notes.replaceChildren(Object.assign(document.createElement('p'), { className: 'muted', textContent: '이 판에서 고친 것은 아래에서 봅니다.' }));
    if (notes && newest.notes) {
      const items = newest.notes.split('\n').map((l) => l.trim()).filter(Boolean);
      const ul = document.createElement('ul');
      for (const line of items) {
        if (!line.startsWith('- ')) continue;
        const li = document.createElement('li');
        li.textContent = line.slice(2);
        ul.appendChild(li);
      }
      const head = items.find((l) => !l.startsWith('- '));
      notes.replaceChildren();
      if (head) {
        const p = document.createElement('p');
        p.textContent = head;
        notes.appendChild(p);
      }
      notes.appendChild(ul);
    }
  } catch {
    all('[data-dl-meta]').forEach((el) => (el.textContent = '내려받기 준비 중'));
    all('[data-dl="dmg"]').forEach((el) => el.classList.add('disabled'));
    const notes = $('[data-notes]');
    if (notes) notes.replaceChildren(Object.assign(document.createElement('p'), { className: 'muted', textContent: '고친 것은 아래에서 봅니다.' }));
  }
  try {
    const s = await (await fetch('site.json', { cache: 'no-store' })).json();
    if (s.contact) {
      all('[data-contact]').forEach((el) => {
        el.textContent = /github\.com\/[^/]+\/[^/]+\/issues/.test(s.contact) ? 'GitHub 에 남기기' : s.contact;
        if (/@/.test(s.contact)) el.href = 'mailto:' + s.contact;
        else if (/^https?:/.test(s.contact)) el.href = s.contact;
      });
    }
  } catch {
    /* 문의처가 없으면 그대로 */
  }
})();
