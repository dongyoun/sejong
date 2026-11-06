// 배포 안내문(latest.json)을 읽어 판 번호·내려받기 주소·고친 것을 채운다. 안내문이 없으면 '준비 중' 으로 둔다.
// 모든 쪽이 함께 쓴다 — 없는 자리는 건너뛴다. en/·ja/·zh/ 쪽은 <script data-root="../"> 로 안내문 자리를 알려 준다.
const ROOT = (document.currentScript && document.currentScript.dataset.root) || '';
const LANG = (document.documentElement.lang || 'ko').slice(0, 2);
const T = {
  ko: { prep: '내려받기 준비 중', notesBelow: '이 판에서 고친 것은 아래에서 봅니다.', notesNone: '고친 것은 아래에서 봅니다.' },
  en: { prep: 'Getting the download ready', notesBelow: 'See the full release notes below.', notesNone: 'See the release notes below.' },
  ja: { prep: '準備中', notesBelow: '更新内容は下で見られます。', notesNone: '更新内容は下で見られます。' },
  zh: { prep: '准备中', notesBelow: '更新内容见下方。', notesNone: '更新内容见下方。' },
}[LANG] || {};

// 머리 막대: 내리면 아래 선
(() => {
  const top = document.querySelector('.top');
  if (!top) return;
  const on = () => top.classList.toggle('stuck', window.scrollY > 8);
  window.addEventListener('scroll', on, { passive: true });
  on();
})();

// 매뉴얼 목차: 좁은 화면에선 접어 두고, 읽는 자리를 표시
(() => {
  const toc = document.querySelector('.toc');
  if (!toc) return;
  const det = toc.querySelector('details');
  if (det && window.matchMedia('(max-width: 1000px)').matches) det.open = false;
  toc.addEventListener('click', (e) => {
    if (det && e.target.closest('a') && window.matchMedia('(max-width: 1000px)').matches) det.open = false;
  });
  const links = new Map([...toc.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
  const heads = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window) || !heads.length) return;
  const seen = new Set();
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) en.isIntersecting ? seen.add(en.target.id) : seen.delete(en.target.id);
      const cur = heads.find((h) => seen.has(h.id));
      if (!cur) return;
      links.forEach((a) => a.classList.remove('on'));
      links.get(cur.id)?.classList.add('on');
    },
    { rootMargin: '-80px 0px -60% 0px' },
  );
  heads.forEach((h) => io.observe(h));
})();

(async () => {
  const $ = (s) => document.querySelector(s);
  const all = (s) => document.querySelectorAll(s);
  const mb = (n) => `${Math.round(n / 1048576)}MB`;
  // `낱말` 은 코드 글씨로 (고친 것 글에 쓴다)
  const fill = (el, text) => text.split(/`([^`]+)`/).forEach((part, i) => el.append(i % 2 ? Object.assign(document.createElement('code'), { textContent: part }) : part));
  try {
    const r = await fetch(ROOT + 'latest.json', { cache: 'no-store' });
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
    if (notes && !newest.notes) notes.replaceChildren(Object.assign(document.createElement('p'), { className: 'muted', textContent: T.notesBelow }));
    if (notes && newest.notes) {
      const items = newest.notes.split('\n').map((l) => l.trim()).filter(Boolean);
      const ul = document.createElement('ul');
      for (const line of items) {
        if (!line.startsWith('- ')) continue;
        const li = document.createElement('li');
        fill(li, line.slice(2));
        ul.appendChild(li);
      }
      const head = items.find((l) => !l.startsWith('- '));
      notes.replaceChildren();
      if (head) {
        const p = document.createElement('p');
        fill(p, head);
        notes.appendChild(p);
      }
      notes.appendChild(ul);
    }
  } catch {
    all('[data-dl-meta]').forEach((el) => (el.textContent = T.prep));
    all('[data-dl="dmg"]').forEach((el) => el.classList.add('disabled'));
    const notes = $('[data-notes]');
    if (notes) notes.replaceChildren(Object.assign(document.createElement('p'), { className: 'muted', textContent: T.notesNone }));
  }
  try {
    const s = await (await fetch(ROOT + 'site.json', { cache: 'no-store' })).json();
    if (s.contact) {
      all('[data-contact]').forEach((el) => {
        // 글은 쪽마다 그 언어로 적혀 있다 — 주소만 맞춘다 (메일 주소면 글도 그 주소로)
        if (/@/.test(s.contact)) el.textContent = s.contact;
        if (/@/.test(s.contact)) el.href = 'mailto:' + s.contact;
        else if (/^https?:/.test(s.contact)) el.href = s.contact;
      });
    }
  } catch {
    /* 문의처가 없으면 그대로 */
  }
})();
