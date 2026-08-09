#!/usr/bin/env node
/**
 * transcript_prep.js — deterministic preprocessing for /continue
 *
 *   node transcript_prep.js find "<title>"           → locate transcripts by session title
 *   node transcript_prep.js checkdir <dir>           → is this output path safe to write?
 *   node transcript_prep.js clean <jsonl> <outdir>   → scrub + index + split
 *   node transcript_prep.js verify <outdir>          → validate subagent anchors (stdin)
 *
 * Why a script and not an LLM: ~95% of a raw JSONL transcript is base64 attachments
 * and tool-result dumps. Stripping that deterministically is cheaper and far more
 * accurate than asking a model to read it. Judgment stays in the prompt — this file
 * only transforms data. (RULES.md → prompts-not-code carve-out, 2026-08-09.)
 *
 * No dependencies beyond node's stdlib. Read-only with respect to project state:
 * it writes only inside the outdir it is given.
 */
const fs = require('fs'), path = require('path'), readline = require('readline'), { execFileSync } = require('child_process');

/* ---------- transcript stores ---------- */
const STORES = [
  path.join(process.env.APPDATA || '', 'setsuna-ui', 'profiles'),
  path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'projects'),
  path.join(process.env.HOME || '', '.config', 'setsuna-ui', 'profiles'), // linux/mac
].filter(Boolean);

/* ---------- redaction ---------------------------------------------------
 * Denylists FAIL OPEN. These shape-based patterns catch common secret
 * formats; anything project-specific (a literal password, an internal token
 * prefix) must be added via .claude/continue.json, which is gitignored and
 * never ships. A cleaned transcript is still sensitive — never share it.
 * ---------------------------------------------------------------------- */
const B64 = /[A-Za-z0-9+/]{200,}={0,2}/g;
const BUILTIN_SECRETS = [
  [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, '[REDACTED-JWT]'],
  [/\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{16,}/gi, '[REDACTED-AUTH]'],
  [/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g, '[REDACTED-AWS-KEY]'],
  [/\b(?:gh[pousr]|github_pat)_[A-Za-z0-9_]{20,}/g, '[REDACTED-GH-TOKEN]'],
  [/\bsk-[A-Za-z0-9_-]{20,}/g, '[REDACTED-API-KEY]'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/g, '[REDACTED-SLACK]'],
  [/-----BEGIN[^-]*PRIVATE KEY-----[\s\S]*?-----END[^-]*PRIVATE KEY-----/g, '[REDACTED-PRIVATE-KEY]'],
  [/\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/]+:[^\s@/]+@/gi, '[REDACTED-URL-CREDS]'],
  [/((?:password|passwd|pwd|secret|api[_-]?key|token|auth)\s*(?:is|[:=])\s*)(?!\[REDACTED)\S+/gi, '$1[REDACTED]'],
];

/* ---------- entity patterns (for INDEX.md) ------------------------------
 * Generic and useful in any repo. Project-specific entities (ticket
 * formats, table prefixes, invoice numbers) come from .claude/continue.json.
 * ---------------------------------------------------------------------- */
const BUILTIN_ENTITIES = {
  'File': /\b[\w.-]+\.(?:js|ts|tsx|jsx|py|php|go|rs|rb|java|cs|sql|md|json|ya?ml|sh|ps1)\b/g,
  'URL': /https?:\/\/[^\s"')\]]+/g,
  'Git SHA': /\b[0-9a-f]{7,40}\b/g,
  'Ticket': /\b[A-Z][A-Z0-9]{1,9}-\d{1,6}\b/g,
  'Error/Exception': /\b\w*(?:Error|Exception|Warning|Fatal)\b/g,
  'Command': /\b(?:npm|npx|node|git|docker|php|python|pytest|cargo|go|make|claude)\s+[\w:-]+/g,
};

/* ---------- per-project config ---------- */
function loadConfig(startDir) {
  // walk up from cwd looking for .claude/continue.json
  let dir = path.resolve(startDir || process.cwd());
  for (let i = 0; i < 6; i++) {
    const p = path.join(dir, '.claude', 'continue.json');
    if (fs.existsSync(p)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
        return { cfg, path: p };
      } catch (e) {
        console.error(`WARNING: ${p} is not valid JSON (${e.message}) — using built-ins only.`);
        return { cfg: {}, path: null };
      }
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return { cfg: {}, path: null };
}

function buildRules(cfg) {
  const secrets = [...BUILTIN_SECRETS];
  const s = cfg.secrets || {};
  for (const lit of s.literals || []) {
    secrets.push([new RegExp(lit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '[REDACTED-LOCAL]']);
  }
  for (const pat of s.patterns || []) {
    try { secrets.push([new RegExp(pat, 'g'), '[REDACTED-LOCAL]']); }
    catch (e) { console.error(`WARNING: bad secret pattern ${pat}: ${e.message}`); }
  }
  const entities = { ...BUILTIN_ENTITIES };
  for (const [name, pat] of Object.entries(cfg.entities || {})) {
    try { entities[name] = new RegExp(pat, 'g'); }
    catch (e) { console.error(`WARNING: bad entity pattern ${name}: ${e.message}`); }
  }
  return { secrets, entities };
}

let RULES = buildRules({});

const scrub = s => {
  s = String(s).replace(B64, '[BASE64-STRIPPED]');
  for (const [re, to] of RULES.secrets) s = s.replace(re, to);
  return s;
};
const clip = (s, head = 600, tail = 200) => {
  s = scrub(s);
  return s.length <= head + tail + 80 ? s
    : s.slice(0, head) + `\n…[CLIPPED ${s.length - head - tail} chars]…\n` + s.slice(-tail);
};
const textOf = c => typeof c === 'string' ? c
  : Array.isArray(c) ? c.filter(b => b.type === 'text').map(b => b.text).join('\n') : '';

/* ---------- checkdir: is this output path safe? -------------------------
 * A cleaned transcript is a full conversation behind a fail-open denylist.
 * Writing one into a tracked directory is how it reaches a remote. The skill
 * calls this BEFORE clean and refuses to write on "unsafe".
 * ---------------------------------------------------------------------- */
function checkdir(target) {
  const abs = path.resolve(target);
  const out = { path: abs };
  // The target usually does not exist yet, and `git -C <missing dir>` errors — which
  // would look identical to "not a repo" and fail OPEN on a tracked path. Walk up to
  // the nearest EXISTING ancestor before asking git anything.
  let probe = abs;
  while (!fs.existsSync(probe)) {
    const up = path.dirname(probe);
    if (up === probe) break;
    probe = up;
  }
  let repoRoot = null;
  try {
    repoRoot = execFileSync('git', ['-C', probe, 'rev-parse', '--show-toplevel'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch { /* genuinely not a git repo */ }

  if (!repoRoot) {
    out.inRepo = false; out.ignored = null; out.verdict = 'safe';
    out.reason = 'Not inside a git repository — nothing can be staged from here.';
  } else {
    out.inRepo = true; out.repoRoot = repoRoot;
    let ignored = false;
    try {
      execFileSync('git', ['-C', repoRoot, 'check-ignore', '-q', abs], { stdio: 'ignore' });
      ignored = true;
    } catch { ignored = false; }
    out.ignored = ignored;
    out.verdict = ignored ? 'safe' : 'unsafe';
    out.reason = ignored
      ? 'Inside a git repo, but the path is gitignored — it cannot be staged.'
      : 'INSIDE A GIT REPO AND NOT GITIGNORED. Writing a cleaned transcript here risks committing an entire conversation. Choose an external path, or add this path to .gitignore first.';
  }
  out.suggestedExternal = path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'continue');
  console.log(JSON.stringify(out, null, 2));
  if (out.verdict === 'unsafe') process.exitCode = 2;
}

/* ---------- find ---------- */
function walk(dir, depth = 3, out = []) {
  if (depth < 0) return out;
  let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, depth - 1, out);
    else if (e.name.endsWith('.jsonl')) out.push(p);
  }
  return out;
}
function find(needle) {
  if (!needle) { console.error('usage: find "<session title>"'); process.exitCode = 1; return; }
  const want = needle.toLowerCase();
  const hits = [];
  for (const store of STORES) {
    for (const f of walk(store)) {
      let title = null, txt;
      try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
      if (!txt.includes('ai-title')) continue;
      for (const l of txt.split('\n')) {
        if (!l.includes('"ai-title"')) continue;
        try { const o = JSON.parse(l); if (o.aiTitle) title = o.aiTitle; } catch {}
      }
      // Match the session TITLE, not file contents — otherwise a session that merely
      // TALKS ABOUT that title (like the /continue session itself) gets caught too.
      if (!title || !title.toLowerCase().includes(want)) continue;
      const st = fs.statSync(f);
      hits.push({ file: f, title, mb: +(st.size / 1e6).toFixed(2), mtime: st.mtime.toISOString().slice(0, 16) });
    }
  }
  hits.sort((a, b) => b.mtime.localeCompare(a.mtime));
  console.log(JSON.stringify(hits, null, 2));
}

/* ---------- clean ---------- */
function clean(src, outdir) {
  if (!src || !outdir) { console.error('usage: clean <jsonl> <outdir>'); process.exitCode = 1; return; }
  const { cfg, path: cfgPath } = loadConfig(process.cwd());
  RULES = buildRules(cfg);
  fs.mkdirSync(outdir, { recursive: true });
  const outFile = path.join(outdir, 'transcript-clean.md');
  const out = fs.createWriteStream(outFile);
  let n = 0;
  const rl = readline.createInterface({ input: fs.createReadStream(src) });
  rl.on('line', l => {
    n++;
    let o; try { o = JSON.parse(l); } catch { return; }
    const ts = (o.timestamp || '').slice(0, 16).replace('T', ' ');
    const c = o.message && o.message.content;
    if (o.type === 'user') {
      const results = Array.isArray(c) ? c.filter(b => b.type === 'tool_result') : [];
      const speech = textOf(c).trim();
      for (const r of results) {
        let b = r.content;
        if (Array.isArray(b)) b = b.map(x => x.type === 'text' ? x.text : `[${x.type}]`).join('\n');
        out.write(`\n<-- [L${n}] RESULT${r.is_error ? ' ERROR' : ''}\n${clip(b || '')}\n`);
      }
      if (speech) {
        const tag = /^<task-notification>/.test(speech) ? 'TASK-NOTIF'
          : /^<command-name>|^# \//.test(speech) ? 'SLASH-CMD' : 'USER';
        out.write(`\n\n### [L${n}] ${tag} ${ts}\n${clip(speech, 4000, 400)}\n`);
      }
    } else if (o.type === 'assistant') {
      const speech = textOf(c).trim();
      if (speech) out.write(`\n### [L${n}] ASSISTANT ${ts}\n${clip(speech, 4000, 400)}\n`);
      if (Array.isArray(c)) for (const b of c) if (b.type === 'tool_use')
        out.write(`--> [L${n}] TOOL ${b.name}: ${clip(JSON.stringify(b.input || {}), 500, 120)}\n`);
    } else if (o.type === 'attachment') {
      const p = (o.attachment && (o.attachment.path || o.attachment.filename)) || 'unknown';
      out.write(`\n[L${n}] ATTACHMENT: ${path.basename(String(p))}\n`);
    } else if (o.type === 'system' && o.content) {
      const s = scrub(o.content).trim();
      if (s && s.length < 1200) out.write(`[L${n}] SYSTEM: ${s.slice(0, 400)}\n`);
    }
  });
  rl.on('close', () => out.end(() => buildIndex(src, outdir, n, cfgPath)));
}

function buildIndex(src, outdir, totalLines, cfgPath) {
  const clean = fs.readFileSync(path.join(outdir, 'transcript-clean.md'), 'utf8').split('\n');
  let cur = 0;
  const rows = clean.map(l => { const m = l.match(/\[L(\d+)\]/); if (m) cur = +m[1]; return [cur, l]; });
  const maxAnchor = Math.max(...rows.map(r => r[0]));

  // real user turns
  const turns = [];
  rows.forEach(([, l], i) => {
    const m = l.match(/^### \[L(\d+)\] (USER|SLASH-CMD) ([\d-]+ [\d:]+)/);
    if (m) turns.push({ n: +m[1], ts: m[3], txt: rows.slice(i + 1, i + 4).map(r => r[1]).join(' ').trim().slice(0, 110).replace(/\s+/g, ' ') });
  });
  if (!turns.length) {
    console.error('No user turns found — is this a Claude Code transcript?');
    process.exitCode = 1; return;
  }

  // VOLUME-based segmentation, cut at the nearest user-turn boundary.
  // (Cutting at the largest time gap was tried and rejected: the biggest gap is
  //  someone sleeping, not a topic boundary — it produced one 388KB segment
  //  and one 5KB segment.)
  const totalBytes = rows.reduce((s, r) => s + r[1].length + 1, 0);
  const NSEG = Math.max(2, Math.min(8, Math.ceil(totalBytes / 110_000)));
  const target = totalBytes / NSEG;
  const cuts = [];
  let acc = 0, want = target;
  for (let i = 0; i < turns.length; i++) {
    while (acc < turns[i].n && acc < maxAnchor) acc = turns[i].n;
    const bytesUpTo = rows.filter(([n]) => n < turns[i].n).reduce((s, r) => s + r[1].length + 1, 0);
    if (bytesUpTo >= want && cuts.length < NSEG - 1) { cuts.push(i); want += target; }
  }
  const bounds = [0, ...cuts, turns.length];
  const segs = [];
  for (let s = 0; s < bounds.length - 1; s++) {
    const a = turns[bounds[s]].n;
    const b = bounds[s + 1] < turns.length ? turns[bounds[s + 1]].n : maxAnchor + 1;
    if (b > a) segs.push({ name: String.fromCharCode(65 + segs.length), a, b });
  }

  // Segment files — the HEADER states the valid anchor range. This is one of three
  // defenses against anchor confusion (subagents citing file line numbers); the
  // others are the extraction rule in SKILL.md and the `verify` pass. All three needed.
  for (const sg of segs) {
    const body = rows.filter(([n]) => n >= sg.a && n < sg.b).map(r => r[1]).join('\n');
    const hdr = `<!-- SEGMENT ${sg.name} | VALID ANCHORS: L${sg.a}..L${sg.b - 1} | ` +
      `Do NOT use this file's line numbers as anchors — only [L…] tokens written below. -->\n\n`;
    fs.writeFileSync(path.join(outdir, `seg-${sg.name}.md`), hdr + body);
    sg.kb = (body.length / 1024) | 0;
  }

  const ent = {};
  for (const [name, re] of Object.entries(RULES.entities)) {
    const hits = {};
    for (const [n, l] of rows) {
      const ms = l.match(re);
      if (ms) for (const m of ms) (hits[m] = hits[m] || new Set()).add(n);
    }
    const list = Object.entries(hits).map(([k, v]) => [k, [...v]]).sort((a, b) => b[1].length - a[1].length);
    if (list.length) ent[name] = list;
  }

  let md = `# INDEX — transcript\n\nSource: \`${src}\`\nCleaned: \`transcript-clean.md\`\n`
    + `JSONL lines: ${totalLines} · user turns: ${turns.length} · **max valid anchor: L${maxAnchor}**\n`
    + `Local config: ${cfgPath ? `\`${cfgPath}\`` : '_none — built-in patterns only_'}\n\n`
    + `> Redaction is a denylist and fails open. This file and \`transcript-clean.md\` still\n`
    + `> contain a full conversation — do not share them off this machine.\n\n`
    + `## How to go deeper\n\`Grep -n "\\[L1234\\]" transcript-clean.md\` → \`Read\` with offset/limit.\n\n`
    + `## Segments\n| Seg | Anchors | Size |\n|---|---|---|\n`;
  for (const s of segs) md += `| ${s.name} | L${s.a}–${s.b - 1} | ${s.kb} KB |\n`;
  md += `\n## User-turn timeline\n| Anchor | Time | Message |\n|---|---|---|\n`;
  for (const t of turns) md += `| [L${t.n}] | ${t.ts} | ${t.txt.replace(/\|/g, '\\|')} |\n`;
  md += `\n## Entity index\n`;
  for (const [name, list] of Object.entries(ent)) {
    md += `\n### ${name}\n`;
    for (const [k, ns] of list.slice(0, 25))
      md += `- \`${k}\` — ${ns.slice(0, 12).map(n => 'L' + n).join(', ')}${ns.length > 12 ? ` …(+${ns.length - 12})` : ''}\n`;
  }
  fs.writeFileSync(path.join(outdir, 'INDEX.md'), md);
  fs.writeFileSync(path.join(outdir, '.maxanchor'), String(maxAnchor));

  console.log(JSON.stringify({
    out: outdir, maxAnchor, userTurns: turns.length,
    config: cfgPath || null,
    cleanMB: +(fs.statSync(path.join(outdir, 'transcript-clean.md')).size / 1e6).toFixed(2),
    srcMB: +(fs.statSync(src).size / 1e6).toFixed(2),
    segments: segs.map(s => ({ seg: s.name, range: `L${s.a}-${s.b - 1}`, kb: s.kb })),
  }, null, 2));
}

/* ---------- verify: do the subagents' cited anchors actually exist? ------
 * Correctness must not depend on a subagent behaving. This checks every cited
 * [L…] against the real file and exits non-zero if any is invalid.
 * ---------------------------------------------------------------------- */
function verify(outdir) {
  if (!outdir) { console.error('usage: verify <outdir>  (extracts on stdin)'); process.exitCode = 1; return; }
  const clean = fs.readFileSync(path.join(outdir, 'transcript-clean.md'), 'utf8');
  const max = +fs.readFileSync(path.join(outdir, '.maxanchor'), 'utf8');
  const input = fs.readFileSync(0, 'utf8');
  const cited = [...new Set((input.match(/\[L(\d+)\]/g) || []).map(s => +s.slice(2, -1)))];
  const bad = cited.filter(n => n > max || !clean.includes(`[L${n}]`));
  console.log(JSON.stringify({ maxAnchor: max, cited: cited.length, invalid: bad }, null, 2));
  if (bad.length) process.exitCode = 1;
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'find') find(a);
else if (cmd === 'checkdir') checkdir(a);
else if (cmd === 'clean') clean(a, b);
else if (cmd === 'verify') verify(a);
else console.log('usage: find "<title>" | checkdir <dir> | clean <jsonl> <outdir> | verify <outdir> (stdin)');
