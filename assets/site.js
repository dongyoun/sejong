// 배포 안내문(latest.json)을 읽어 판 번호·내려받기 주소·고친 것을 채운다. 안내문이 없으면 '준비 중' 으로 둔다.
// 모든 쪽이 함께 쓴다 — 없는 자리는 건너뛴다. en/·ja/ 쪽은 <script data-root="../"> 로 안내문 자리를 알려 준다.
const ROOT = (document.currentScript && document.currentScript.dataset.root) || '';
const LANG = (document.documentElement.lang || 'ko').slice(0, 2);
// 쪽 보기 세기 (2026-11-21, 개인정보 처리방침 '방문·새 판 확인 횟수'): 대표 주소 hypersevenlabs.com 에서만 — 옛 주소(pages.dev)의 쪽은 머리에서
// 새 주소로 넘기므로 거기서도 세면 한 사람이 두 번 잡힌다. 쿠키·저장소 없이 쪽 경로와
// '다른 사이트에서 들어왔는지'만 보낸다 — 서버(/api/pv)는 날짜별 합계만 남긴다.
// 주소에 채널 꼬리표 ?s=… 가 붙어 있으면(홍보 링크, 2026-11-24 사용자 "달고 세라") 그 값도 함께 — 서버가 알려진 값만 남기고 나머지는 'other'.
const PV_ON = /^(www\.)?hypersevenlabs\.com$/.test(location.hostname) && !!navigator.sendBeacon;
// ?s= 가 없으면 utm_source(스레드 등이 링크에 저절로 붙이는 것, 11-24)를 u= 로 — 서버가 같은 이름(th·ig·fb…)으로 바꾼다.
let PV_S = '';
try {
  const q = new URLSearchParams(location.search);
  const s = (q.get('s') || '').slice(0, 20);
  const u = (q.get('utm_source') || '').slice(0, 30);
  PV_S = s ? 's=' + encodeURIComponent(s) : u ? 'u=' + encodeURIComponent(u) : '';
} catch (e) {}
try {
  if (PV_ON) {
    let fromOutside = 1;
    try {
      fromOutside = document.referrer && new URL(document.referrer).hostname === location.hostname ? 0 : 1;
    } catch (e) {}
    navigator.sendBeacon('/api/pv?p=' + encodeURIComponent(location.pathname) + '&n=' + fromOutside + (PV_S ? '&' + PV_S : ''));
  }
} catch (e) {}
const T = {
  ko: { prep: '내려받기 준비 중', win: '윈도우 10·11', notesBelow: '이 버전의 업데이트 내역은 아래에서 봅니다.', notesNone: '업데이트 내역은 아래에서 봅니다.' },
  en: { prep: 'Getting the download ready', win: 'Windows 10/11', notesBelow: 'See the full release notes below.', notesNone: 'See the release notes below.' },
  ja: { prep: '準備中', win: 'Windows 10・11', notesBelow: '更新内容は下で見られます。', notesNone: '更新内容は下で見られます。' },
}[LANG] || {};
// 이 컴퓨터의 운영체제: 'win' | 'mac' | '' (휴대폰·태블릿·리눅스 등은 '' — 두 단추를 같게 둔다)
const OS = (() => {
  const p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  const ua = navigator.userAgent || '';
  if (/android|iphone|ipad|ipod/i.test(ua) || (/mac/i.test(p) && navigator.maxTouchPoints > 1)) return '';
  if (/win/i.test(p) || (!p && /windows/i.test(ua))) return 'win';
  if (/mac/i.test(p) || (!p && /macintosh/i.test(ua))) return 'mac';
  return '';
})();
const ON_WIN = OS === 'win';
// 받기 단추: 순서는 그대로(왼쪽 윈도우, 오른쪽 맥), 이 컴퓨터용만 진하게 — 다른 쪽은 연하게(ghost)
const primary = (os) =>
  document.querySelectorAll('.get-btns [data-os]').forEach((el) => {
    const mine = !os || el.dataset.os === os;
    el.classList.toggle('mine', !!os && mine);
    (el.matches('.btn') ? [el] : el.querySelectorAll('.btn')).forEach((b) => b.classList.toggle('ghost', !mine));
  });
primary(OS);
// 받기 단추 누른 수 (쪽·윈도우/맥·꼬리표의 날짜별 합계) — 처리방침 #counts 에 한 줄을 더한 뒤에만 켠다(지금 꺼 둠). 서버 pv.js 의 DL_ON 도 함께 켤 것.
const DL_ON = false;
if (DL_ON && PV_ON)
  document.querySelectorAll('.get-btns [data-os] a[href]').forEach((a) =>
    a.addEventListener('click', () => {
      try {
        const os = a.closest('[data-os]').dataset.os;
        const via = /apps\.microsoft\.com/.test(a.href) ? 'store' : 'file';
        navigator.sendBeacon('/api/pv?dl=' + encodeURIComponent(os + '-' + via) + '&p=' + encodeURIComponent(location.pathname) + (PV_S ? '&' + PV_S : ''));
      } catch (e) {}
    }),
  );
// 복사 단추: 누르면 data-copy 를 클립보드로, 잠깐 data-done 글로 바꿨다가 되돌린다
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
    const intel = (m.mac && m.mac.x64) || {};
    const FILE = { dmg: mac.dmg, zip: mac.zip || mac.dmg, dmgx64: intel.dmg, exe: win.exe, winzip: win.zip || win.exe, auto: os === 'win' ? win.exe : mac.dmg };
    // 단추 아래 작은 줄: 판 번호 · 어디서 받는지(칩) — 두 단추가 같은 꼴
    const META = { mac: mac.dmg && `${m.version} · Apple Silicon`, win: win.exe && `${m.version} · ${T.win}`, store: `${m.version} · Microsoft Store` };
    const which = (v) => (v === 'win' || v === 'mac' || v === 'store' ? v : os);
    // 화면 묶음만 올린 판이 있으면 '고친 것'은 그 판을 보여 준다 (설치 파일을 받아도 처음 실행 때 그 판이 된다)
    const newest = m.bundle && m.bundle.notes ? m.bundle : m;
    all('[data-ver]').forEach((el) => (el.textContent = newest.version));
    all('[data-date]').forEach((el) => (el.textContent = m.date));
    all('[data-dl]').forEach((el) => {
      const f = FILE[el.dataset.dl];
      if (f) el.href = f.url;
      el.classList.toggle('disabled', !f);
    });
    // 스토어 단추는 스토어에 실제로 있는 판(build.mjs 가 data-store-ver 에 적음 — 새 판이 인증 중이면 옛 판)
    all('[data-dl-meta]').forEach((el) => (el.textContent = el.dataset.dlMeta === 'store' && el.dataset.storeVer ? `${el.dataset.storeVer} · Microsoft Store` : META[which(el.dataset.dlMeta)] || T.prep));
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
    all('[data-dl-meta]').forEach((el) => (el.textContent = el.dataset.dlMeta === 'store' ? 'Microsoft Store' : T.prep));
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
        // data-subject 가 있으면 메일 제목을 채워 연다('함께 일하기' 갈래별)
        el.href = 'mailto:' + s.email + (el.dataset.subject ? '?subject=' + encodeURIComponent(el.dataset.subject) : '');
        if (el.closest('footer') || el.hasAttribute('data-email-text')) el.textContent = s.email;
      });
    }
  } catch {
    /* 문의처가 없으면 그대로 */
  }
})();

// 번호 그림(첫 화면 '그대로 + AI'·오피스·캐드 쪽): 번호와 풀이를 서로 짚기(올리거나 누르면 짝이 진해진다)
document.querySelectorAll('.anno-pane').forEach((pane) => {
  const mark = (n) => pane.querySelectorAll('[data-pin]').forEach((el) => el.classList.toggle('hot', el.dataset.pin === n));
  pane.querySelectorAll('[data-pin]').forEach((el) => {
    el.addEventListener('mouseenter', () => mark(el.dataset.pin));
    el.addEventListener('mouseleave', () => mark(''));
    el.addEventListener('click', () => mark(el.dataset.pin));
  });
});
// 첫 화면: 오피스·캐드 바꿔 보기
document.querySelectorAll('.bridge').forEach((box) => {
  const tabs = [...box.querySelectorAll('[data-tab]')];
  const panes = [...box.querySelectorAll('[data-pane]')];
  tabs.forEach((t) =>
    t.addEventListener('click', () => {
      tabs.forEach((x) => {
        x.classList.toggle('on', x === t);
        x.setAttribute('aria-selected', String(x === t));
      });
      panes.forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab));
    }),
  );
});

// 레퍼런스 갤러리 (2026-11-22): 그림을 누르면 크게 — <dialog> 하나를 같이 쓴다. 스크립트가 없거나 새 탭으로 열면 원본 그림이 열린다
(() => {
  const links = document.querySelectorAll('a[data-zoom]');
  if (!links.length || typeof HTMLDialogElement !== 'function') return;
  const d = document.createElement('dialog');
  d.className = 'ref-lightbox';
  const x = document.createElement('button');
  x.type = 'button';
  x.className = 'ref-x';
  x.textContent = '×';
  const img = document.createElement('img');
  const cap = document.createElement('p');
  d.append(x, img, cap);
  document.body.append(d);
  x.addEventListener('click', () => d.close());
  d.addEventListener('click', (e) => {
    if (e.target === d) d.close();
  });
  d.addEventListener('close', () => img.removeAttribute('src'));
  links.forEach((a) =>
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      const small = a.querySelector('img');
      img.src = a.href;
      img.alt = small ? small.alt : '';
      // 그림 표(실제 화면·앱 렌더·AI 렌더)도 크게 볼 때 함께 — 어떤 그림인지 늘 밝힌다
      const fc = a.closest('figure')?.querySelector('figcaption');
      cap.textContent = fc ? fc.textContent.trim() : img.alt; // 설명 줄 앞의 표(.ref-tag)도 함께
      x.setAttribute('aria-label', a.dataset.zoom || 'Close');
      d.showModal();
    }),
  );
})();
