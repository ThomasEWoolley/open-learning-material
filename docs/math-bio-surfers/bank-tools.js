/* Shared validation for the game and question editor. No dependencies. */
(function (root) {
  'use strict';
  const text = value => typeof value === 'string' && value.trim().length > 0;
  function validateBank(bank) {
    const errors = [];
    if (!bank || typeof bank !== 'object' || Array.isArray(bank)) return ['The question bank must be a JSON object.'];
    if (!Array.isArray(bank.levels) || bank.levels.length !== 4 || bank.levels.some(l => !l || ![1,2,3,4].includes(l.id)) || new Set(bank.levels.map(l=>l.id)).size !== 4) {
      return ['The bank must contain the four chapter levels, numbered 1 to 4.'];
    }
    for (const l of bank.levels) {
      for (const field of ['title','short','subtitle']) if (!text(l[field])) errors.push(`Level ${l.id}: ${field} is missing.`);
      if (!Number.isInteger(l.chapter)) errors.push(`Level ${l.id}: chapter number is missing.`);
      if (typeof l.colour !== 'string' || !/^#[\da-f]{6}$/i.test(l.colour)) errors.push(`Level ${l.id}: use a six-digit hex colour.`);
    }
    if (bank.runQuestions !== 12 || bank.passAccuracy !== 0.75) errors.push('Keep 12 questions per session and the 75% completion threshold.');
    const ids = new Set();
    for (const [kind,label] of [['gates','Question'],['sequences','Procedure'],['bugs','Misconception']]) {
      if (!Array.isArray(bank[kind])) { errors.push(`Missing ${kind} list.`); continue; }
      bank[kind].forEach((item,index) => {
        const prefix = `${label} ${index+1}${item && text(item.id) ? ' ('+item.id+')' : ''}`;
        if (!item || typeof item !== 'object' || Array.isArray(item)) { errors.push(prefix+': invalid entry.'); return; }
        if (![1,2,3,4].includes(item.level)) errors.push(prefix+': choose a chapter level.');
        for (const field of ['section','source']) if (!text(item[field])) errors.push(prefix+`: add a ${field} reference.`);
        if (kind !== 'bugs') {
          if (!text(item.id)) errors.push(prefix+': missing identifier.');
          else if (ids.has(item.id)) errors.push(prefix+': identifier is duplicated.');
          else ids.add(item.id);
        }
        if (kind === 'gates') {
          if (!text(item.prompt)) errors.push(prefix+': write the question.');
          if (!Array.isArray(item.options) || item.options.length !== 3 || item.options.some(o=>!text(o))) errors.push(prefix+': provide three non-empty answers.');
          else if (new Set(item.options.map(o=>o.trim())).size !== 3) errors.push(prefix+': answers must be different.');
          if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer > 2) errors.push(prefix+': choose the correct answer.');
          if (![1,2,3].includes(item.difficulty)) errors.push(prefix+': choose a difficulty.');
          if (!text(item.why)) errors.push(prefix+': add an explanation.');
        } else if (kind === 'sequences') {
          if (!text(item.title)) errors.push(prefix+': add a title.');
          if (!Array.isArray(item.steps) || item.steps.length < 3 || item.steps.length > 6 || item.steps.some(s=>!text(s))) errors.push(prefix+': provide 3 to 6 non-empty steps.');
          else if (new Set(item.steps.map(s=>s.trim())).size !== item.steps.length) errors.push(prefix+': steps must be different.');
          if (!text(item.why)) errors.push(prefix+': add an explanation.');
        } else {
          if (!text(item.name)) errors.push(prefix+': add a short name.');
          if (!text(item.tip)) errors.push(prefix+': add corrective feedback.');
        }
      });
    }
    if (Array.isArray(bank.gates)) for (const l of bank.levels) {
      if (bank.gates.filter(q=>q && q.level === l.id).length < 12) errors.push(`Level ${l.id}: keep at least 12 questions so a full session can run.`);
      if (Array.isArray(bank.sequences) && !bank.sequences.some(q=>q && q.level === l.id)) errors.push(`Level ${l.id}: keep at least one procedure.`);
      if (Array.isArray(bank.bugs) && !bank.bugs.some(q=>q && q.level === l.id)) errors.push(`Level ${l.id}: keep at least one misconception.`);
    }
    return errors;
  }
  function serialise(bank) { return JSON.stringify(bank,null,2)+'\n'; }
  function embed(bank) { return JSON.stringify(bank).replace(/</g,'\\u003c'); }
  const api = {validateBank,serialise,embed};
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MathBioBank = api;
})(typeof window === 'object' ? window : globalThis);
