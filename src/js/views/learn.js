import { h, icon, empty, toast, safetyNote } from '../ui.js';
import { t, L, fmt } from '../i18n.js';
import { toggleBookmark, isBookmarked, addRecent, getRecents, getProgress, setProgress, getBookmarks } from '../db/userdata.js';
import { pageHead } from './shared.js';

export async function route(ctx, [kind, id]) {
  if (kind === 'lesson') return lesson(ctx, id);
  if (kind === 'quiz') return quiz(ctx, id || 'quiz');
  return index(ctx);
}

async function index(ctx) {
  const prog = await getProgress(ctx.db);
  const lessons = ctx.data.lessons;
  const doneL = lessons.filter((l) => prog['lesson:' + l.id]?.done).length;
  const qs = ctx.data.quizzes;
  const right = qs.filter((x) => prog['quiz:' + x.id]?.correct).length;
  const marks = new Set((await getBookmarks(ctx.db, 'lesson')).map((b) => b.id));
  const rec = await getRecents(ctx.db, 'lesson', 3);
  const bar = (v, max) => h('div', { class: 'pbar', role: 'progressbar', 'aria-valuenow': v, 'aria-valuemax': max }, h('i', { style: `width:${max ? (v / max) * 100 : 0}%` }));
  return h('div', null, pageHead(t('home.learn'), '#/more'),
    h('div', { class: 'card' }, h('h3', null, t('learn.progress')), h('p', null, t('learn.lessonsDone', { a: fmt(doneL, 0), b: fmt(lessons.length, 0) })), bar(doneL, lessons.length), h('p', null, t('learn.quizRight', { a: fmt(right, 0), b: fmt(qs.length, 0) })), bar(right, qs.length)),
    h('div', { class: 'row' }, h('a', { class: 'btn primary', href: '#/learn/quiz/quiz' }, t('learn.startQuiz')), h('a', { class: 'btn', href: '#/learn/quiz/exercise' }, t('learn.startExercises'))),
    rec.length ? h('div', null, h('h2', null, t('def.recent')), h('div', { class: 'pills' }, rec.map((r) => { const l = lessons.find((x) => x.id === r.id); return l ? h('a', { class: 'pill', href: '#/learn/lesson/' + l.id }, L(l.title)) : null; }))) : null,
    h('h2', null, t('learn.lessons')), h('div', { class: 'card' }, lessons.map((l) => h('div', { class: 'item' }, prog['lesson:' + l.id]?.done ? icon('check', 20) : h('span', { style: 'width:20px' }), h('a', { class: 'grow', href: '#/learn/lesson/' + l.id }, L(l.title)), marks.has(l.id) ? icon('star', 18) : null))),
    h('p', null, h('a', { href: '#/dictionary' }, t('home.dict')), ' · ', h('a', { href: '#/guides' }, t('mach.guides'))));
}

async function lesson(ctx, id) {
  const l = ctx.data.lessons.find((x) => x.id === id);
  if (!l) return empty('err.notfound');
  await addRecent(ctx.db, 'lesson', id).catch(() => {});
  const prog = (await ctx.db.get('progress', 'lesson:' + id)) || {};
  const marked = await isBookmarked(ctx.db, 'lesson', id);
  const star = h('button', { class: 'btn sm', 'aria-pressed': String(marked), onClick: async () => { const on = await toggleBookmark(ctx.db, 'lesson', id); star.lastChild.textContent = on ? t('def.bookmarked') : t('def.bookmark'); } }, icon('star', 18), marked ? t('def.bookmarked') : t('def.bookmark'));
  const done = h('button', { class: 'btn primary', onClick: async () => { await setProgress(ctx.db, 'lesson:' + id, { done: true }); toast(t('common.saved')); ctx.nav('#/learn'); } }, icon('check', 18), prog.done ? t('learn.doneAgain') : t('learn.markDone'));
  return h('div', null, pageHead(L(l.title), '#/learn', star), id === 'safety-first' ? safetyNote(t('mach.safety')) : null, h('div', { class: 'card' }, L(l.body).map((p) => h('p', null, p))), h('div', { class: 'row end' }, done));
}

async function quiz(ctx, mode) {
  const kind = mode === 'exercise' ? 'exercise' : 'quiz';
  const qs = ctx.data.quizzes.filter((x) => x.kind === kind);
  const st = { i: 0, score: 0 };
  const root = h('div');
  const draw = () => {
    if (st.i >= qs.length) {
      root.replaceChildren(pageHead(t(kind === 'quiz' ? 'learn.quiz' : 'learn.exercises'), '#/learn'), h('div', { class: 'card' }, h('h2', null, t('learn.score', { a: fmt(st.score, 0), b: fmt(qs.length, 0) })), h('div', { class: 'row' }, h('button', { class: 'btn primary', onClick: () => { st.i = 0; st.score = 0; draw(); } }, t('learn.again')), h('a', { class: 'btn', href: '#/learn' }, t('common.close')))));
      return;
    }
    const q = qs[st.i]; const opts = L(q.options); let answered = false;
    const exp = h('div');
    const btns = opts.map((o, idx) => h('button', { class: 'btn opt', onClick: async () => {
      if (answered) return; answered = true;
      const ok = idx === q.answer; if (ok) st.score++;
      btns.forEach((b, j) => { b.disabled = true; if (j === q.answer) b.classList.add('right'); else if (j === idx) b.classList.add('wrong'); });
      await setProgress(ctx.db, 'quiz:' + q.id, { correct: ok }).catch(() => {});
      exp.replaceChildren(h('div', { class: 'res' }, h('strong', null, ok ? t('learn.correct') : t('learn.wrong')), h('p', null, L(q.explain))), h('div', { class: 'row end' }, h('button', { class: 'btn primary', onClick: () => { st.i++; draw(); } }, st.i + 1 >= qs.length ? t('learn.finish') : t('learn.next'))));
    } }, o));
    root.replaceChildren(pageHead(t(kind === 'quiz' ? 'learn.quiz' : 'learn.exercises'), '#/learn'), h('div', { class: 'card' }, h('p', { class: 'meta' }, t('learn.qOf', { a: fmt(st.i + 1, 0), b: fmt(qs.length, 0) })), h('h2', null, L(q.q)), btns, exp));
  };
  draw();
  return root;
}
