// 배포 안내문(latest.json)을 읽어 판 번호·내려받기 주소·고친 것을 채운다. 안내문이 없으면 '준비 중' 으로 둔다.
// 모든 쪽이 함께 쓴다 — 없는 자리는 건너뛴다. en/·ja/ 쪽은 <script data-root="../"> 로 안내문 자리를 알려 준다.
const ROOT = (document.currentScript && document.currentScript.dataset.root) || '';
const LANG = (document.documentElement.lang || 'ko').slice(0, 2);
const T = {
  ko: { prep: '내려받기 준비 중', win: '윈도우 10·11', notesBelow: '이 버전의 업데이트 내역은 아래에서 봅니다.', notesNone: '업데이트 내역은 아래에서 봅니다.' },
  en: { prep: 'Getting the download ready', win: 'Windows 10/11', notesBelow: 'See the full release notes below.', notesNone: 'See the release notes below.' },
  ja: { prep: '準備中', win: 'Windows 10・11', notesBelow: '更新内容は下で見られます。', notesNone: '更新内容は下で見られます。' },
}[LANG] || {};
// 이 컴퓨터가 윈도우인가 (받기 단추는 이 컴퓨터용을 앞에, 진하게)
const ON_WIN = /win/i.test((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent);
// 윈도우 쪽은 묶음(.get-win: 스토어 단추 + 설치 파일 링크) — 진하게/연하게는 그 안의 단추에
const primary = (os) =>
  document.querySelectorAll('.get-btns').forEach((box) => {
    // 윈도우는 스토어 묶음과 .exe 단추 둘 다 data-os="win" (하나는 숨어 있다 — style.css 의 html[data-store]) — 둘 다 앞으로
    [...box.querySelectorAll(`[data-os="${os}"]`)].reverse().forEach((el) => box.prepend(el));
    box.querySelectorAll('[data-os]').forEach((el) => (el.matches('.btn') ? el : el.querySelector('.btn'))?.classList.toggle('ghost', el.dataset.os !== os));
  });
primary(ON_WIN ? 'win' : 'mac');
// 복사 단추 (응원 쪽의 비트코인 주소): 누르면 data-copy 를 클립보드로, 잠깐 data-done 글로 바꿨다가 되돌린다
document.querySelectorAll('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    const was = b.textContent;
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
    } catch {
      // 클립보드를 못 쓰면 주소 글자를 골라 옛 방식으로 복사해 보고, 그것도 안 되면 골라 둔 채로 (직접 복사하게)
      const code = b.parentElement && b.parentElement.querySelector('code');
      if (code) getSelection().selectAllChildren(code);
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        /* 직접 복사 */
      }
      if (!ok) return;
    }
    b.textContent = b.dataset.done || was;
    setTimeout(() => (b.textContent = was), 1800);
  }),
);
// 명령 찾기 단축키: 맥 ⌘K, 윈도우 Ctrl+Shift+K
if (ON_WIN) document.querySelectorAll('[data-k]').forEach((el) => (el.textContent = 'Ctrl+Shift+K'));
// 언어를 직접 고르면 이 방문 동안만 기억한다 (한국어 쪽의 자동 언어 고르기가 그 뜻을 따르게 — build.mjs 의 langAuto).
// 다음 방문은 다시 운영체제(브라우저 첫째) 언어로 시작한다.
document.querySelectorAll('.lang-list a[data-l]').forEach((a) =>
  a.addEventListener('click', () => {
    try {
      sessionStorage.setItem('hs.site.lang', a.dataset.l);
    } catch {
      /* 저장소를 못 쓰면 그대로 */
    }
  }),
);

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
    // 맥(dmg·zip)과 윈도우(exe·zip, 2.0~). data-dl="auto" 와 값 없는 data-dl-meta 는 이 컴퓨터에 맞는 쪽
    const mac = (m.mac && m.mac.arm64) || {};
    const win = (m.win && m.win.x64) || {};
    if (!mac.dmg && !win.exe) throw new Error('no-build');
    const os = ON_WIN && win.exe ? 'win' : 'mac';
    primary(os);
    const FILE = { dmg: mac.dmg, zip: mac.zip || mac.dmg, exe: win.exe, winzip: win.zip || win.exe, auto: os === 'win' ? win.exe : mac.dmg };
    const META = { mac: mac.dmg && `${m.version} · ${mb(mac.dmg.size)} · Apple Silicon`, win: win.exe && `${m.version} · ${mb(win.exe.size)} · ${T.win}` };
    const which = (v) => (v === 'win' || v === 'mac' ? v : os);
    // 화면 묶음만 올린 판이 있으면 '고친 것'은 그 판을 보여 준다 (설치 파일을 받아도 처음 실행 때 그 판이 된다)
    const newest = m.bundle && m.bundle.notes ? m.bundle : m;
    all('[data-ver]').forEach((el) => (el.textContent = newest.version));
    all('[data-date]').forEach((el) => (el.textContent = m.date));
    all('[data-dl]').forEach((el) => {
      const f = FILE[el.dataset.dl];
      if (f) el.href = f.url;
      el.classList.toggle('disabled', !f);
    });
    all('[data-dl-meta]').forEach((el) => (el.textContent = META[which(el.dataset.dlMeta)] || T.prep));
    all('[data-sha]').forEach((el) => {
      const f = which(el.dataset.sha) === 'win' ? win.exe : mac.dmg;
      el.textContent = f ? f.sha256 : '—';
    });
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
    all('[data-dl]').forEach((el) => el.classList.add('disabled'));
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
    // 이메일 연락처(협업·기술 지원): 주소는 site.json 에만 — 바닥글 글은 주소 그대로 보여 준다 (베껴 쓰기 쉽게)
    if (/^[^@\s]+@[^@\s]+$/.test(s.email || '')) {
      all('[data-email]').forEach((el) => {
        el.href = 'mailto:' + s.email;
        if (el.closest('footer')) el.textContent = s.email;
      });
    }
  } catch {
    /* 문의처가 없으면 그대로 */
  }
})();
