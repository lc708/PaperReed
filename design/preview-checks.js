// Runs only when appended to a temporary HTML preview, never in the delivered prototype.
const checkResults = [];
function check(name, fn) {
  try { fn(); checkResults.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { checkResults.push({ name, passed: false }); console.error('FAIL ' + name + ': ' + error.message); }
}
function ok(value, message = 'assertion failed') { if (!value) throw new Error(message); }
function click(selector) { const element = document.querySelector(selector); ok(element, 'Missing ' + selector); element.click(); }
function input(id, value, event = 'input') { $(id).value = value; $(id).dispatchEvent(new Event(event, { bubbles: true })); }
check('Seven pages and unique IDs', () => {
  for (const page of ['inbox', 'thread', 'compose', 'search', 'snooze', 'accounts', 'agents']) {
    click('[data-preview="' + page + '"]'); ok(S.page === page);
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
    ok(ids.length === new Set(ids).size, 'Duplicate IDs on ' + page);
    ok($('screen').scrollWidth <= $('screen').clientWidth + 1, 'Horizontal screen overflow on ' + page);
  }
});
check('Account filter and metadata', () => {
  preview('inbox'); click('[data-act="scope"]'); click('[data-act="scope-set"][data-id="personal"]');
  ok(rowsFor('inbox').every(m => m.account === 'personal')); ok(!document.querySelector('.sender-account'));
  click('[data-act="scope"]'); click('[data-act="scope-set"][data-id="all"]');
});
check('Unread filter and read transition', () => {
  $('unread-filter').checked = true; $('unread-filter').dispatchEvent(new Event('change'));
  ok(rowsFor('inbox').length === 3); click('[data-act="open"][data-id="2"]');
  ok(!getMail(2).unread); click('[data-act="back"]'); ok(rowsFor('inbox').length === 2);
  $('unread-filter').checked = false; $('unread-filter').dispatchEvent(new Event('change'));
});
check('Search filters and empty state', () => {
  preview('search'); input('search-query', '校样'); ok(searchItems().length === 3);
  $('search-attachment').checked = true; $('search-attachment').dispatchEvent(new Event('change'));
  ok(searchItems().length === 2); input('search-account', 'personal', 'change'); ok(searchItems().length === 0);
  ok($('search-results').textContent.includes('没有找到')); click('[data-act="search-clear"]');
  ok(S.query === '' && S.searchAccount === 'all' && !S.hasAttachment);
});
check('Search → thread → search preserves query', () => {
  input('search-query', '校样'); click('[data-act="open"][data-id="2"]');
  click('[data-act="back"]'); ok(S.page === 'search' && $('search-query').value === '校样');
});
check('Archive and undo', () => {
  preview('inbox'); click('[data-act="open"][data-id="2"]'); click('[data-act="archive"]');
  ok(getMail(2).folder === 'archive'); click('[data-act="undo"]');
  ok(getMail(2).folder === 'inbox' && S.page === 'thread' && S.selected === 2);
});
check('Snooze through anchored menu and undo', () => {
  click('[data-act="snooze-menu"]'); ok(!$('popover').hidden);
  click('[data-act="snooze-set"][data-id="今天 18:00"]'); ok(getMail(2).folder === 'snooze');
  preview('snooze'); ok(document.querySelector('.snooze-date').textContent.includes('今天'));
  ok(document.querySelector('.snooze-date').textContent.includes('11 月 14 日'));
  click('[data-act="undo"]'); ok(getMail(2).folder === 'inbox');
});
check('Reply draft persists in drafts', () => {
  click('[data-act="reply"]'); input('reply-text', '确认了，周一见。');
  go('drafts'); ok(rowsFor('drafts').some(m => m.id === 2));
  click('[data-act="open"][data-id="2"]'); click('[data-act="reply"]'); ok($('reply-text').value === '确认了，周一见。');
});
check('New draft autosave, validation, and revisit', () => {
  preview('inbox'); click('[data-act="compose-new"]'); click('[data-act="compose-send"]');
  ok($('toast-text').textContent.includes('收件人'));
  input('compose-to', 'maya@example.com'); input('compose-subject', '下周见'); input('compose-body', '周一上午见。');
  const id = S.composer.id; ok(getMail(id).folder === 'draft');
  preview('inbox'); preview('compose'); ok($('compose-body').value === '周一上午见。');
  click('[data-act="compose-send"]'); ok(getMail(id).folder === 'draft'); ok($('toast-text').textContent.includes('没有发送真实邮件'));
});
check('CC and attachment removal', () => {
  click('[data-act="toggle-cc"]'); ok(!$('cc-field').hidden); input('compose-cc', 'review@example.com');
  S.composer.files = [{ name: '校样.pdf', size: '1 MB' }]; render();
  click('[data-act="remove-file"][data-id="0"]'); ok(S.composer.files.length === 0);
});
check('Account preferences and authorization entry', () => {
  preview('accounts'); input('default-sender', 'personal', 'change'); ok(S.defaultSender === 'personal');
  click('[data-act="remote-images"]'); ok(S.remoteImages);
  click('[data-act="reconnect"]'); ok($('modal').textContent.includes('授权已过期')); click('[data-act="modal-close"]');
  click('[data-act="add-account"]'); ok(document.querySelectorAll('.provider-option').length === 4); click('[data-act="modal-close"]');
});
check('Agent access scopes and simulated connection', () => {
  preview('agents'); click('[data-act="agent-enable"]'); ok(!S.enabled); ok(document.querySelector('[data-act="agent-connect"]').disabled);
  click('[data-act="agent-enable"]'); click('[data-act="agent-client"][data-id="claude"]');
  const organize = document.querySelector('[data-permission="organize"]'); organize.checked = true; organize.dispatchEvent(new Event('change'));
  click('[data-act="agent-connect"]'); ok($('modal').textContent.includes('Claude Code'));
  ok($('modal').textContent.includes('整理与草拟')); click('[data-act="agent-simulate"]'); ok(S.agentConnected.claude);
});
check('Keyboard selection and command focus', () => {
  preview('inbox'); S.selected = 1; render(); document.activeElement.blur();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', bubbles: true })); ok(S.selected === 2 && S.page === 'inbox');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); ok(S.page === 'thread');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })); ok(!$('overlay').hidden);
  $('command-query').focus(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  ok($('modal').contains(document.activeElement)); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); ok($('overlay').hidden);
});
check('No page overflow', () => ok(document.documentElement.scrollWidth <= innerWidth));
console.log('RESULT ' + checkResults.filter(r => r.passed).length + '/' + checkResults.length);
preview('inbox'); S.unreadOnly = false; S.account = 'all'; getMail(2).unread = true; S.selected = 2; render(); $('toast').hidden = true;

check('Custom account color and shape',()=>{
 preview('accounts');click('[data-act="manage-account"][data-id="work"]');$('account-color').value='#aa5599';$('account-shape').value='diamond';click('[data-act="save-account-name"]');
 preview('inbox');ok(document.querySelector('.account-mark.diamond'));ok(!document.querySelector('.sender-account'));ok(document.querySelector('.account-mark').style.getPropertyValue('--account-color')==='#aa5599');
});
check('CLI onboarding and context-preserving Agent setup',()=>{
 S.cliInstalled=false;S.agentConnected={};S.agent='codex';S.enabled=true;S.permissions.read=true;S.agentAccounts.work=true;
 preview('compose');click('[data-act="agent-entry"]');ok($('modal').textContent.includes('安装本机 CLI'));click('[data-act="cli-preview"]');ok(S.cliInstalled);ok($('modal').textContent.includes('当前草稿'));ok(document.querySelector('[data-act="handoff-preview"]').disabled);
 click('[data-act="handoff-config"]');ok(S.page==='agents');click('[data-act="agent-connect"]');click('[data-act="agent-simulate"]');ok(S.page==='compose');ok(!$('overlay').hidden);ok($('modal').textContent.includes('当前草稿'));ok(!document.querySelector('[data-act="handoff-preview"]').disabled);click('[data-act="handoff-preview"]');
});
check('Unapproved mailbox cannot be handed off',()=>{
 S.agentAccounts.personal=false;S.selected=4;go('thread');click('[data-act="agent-entry"]');ok(document.querySelector('[data-act="handoff-preview"]').disabled);ok($('modal').textContent.includes('不在授权范围'));closeModal();
});
console.log('REVISED RESULT '+checkResults.filter(r=>r.passed).length+'/'+checkResults.length);
preview('inbox');$('toast').hidden=true;

check('Folder navigation without account menu',()=>{for(const page of ['drafts','sent','spam','trash','archive']){click('#mail-nav [data-act="goto"][data-id="'+page+'"]');ok(S.page===page)}go('inbox')});
check('Categories remain within inbox',()=>{click('[data-act="category"][data-id="notifications"]');ok(rowsFor('inbox').length===1&&rowsFor('inbox')[0].sender==='Linear');click('[data-act="category"][data-id="subscriptions"]');ok(rowsFor('inbox').length===2);click('[data-act="category"][data-id="all"]')});
check('Batch selection and Agent scope',()=>{const boxes=[...document.querySelectorAll('[data-mail-check]')];for(const id of [1,2]){const b=document.querySelector('[data-mail-check="'+id+'"]');b.checked=true;b.dispatchEvent(new Event('change'))}ok(S.checked.size===2);ok(agentContext().label==='选中邮件'&&agentContext().count===2);click('[data-act="bulk-archive"]');ok(getMail(1).folder==='archive'&&getMail(2).folder==='archive');click('[data-act="undo"]');ok(getMail(1).folder==='inbox'&&getMail(2).folder==='inbox')});
check('Create and apply custom label',()=>{go('organize');click('[data-act="label-new"]');$('label-name').value='客户 A';click('[data-act="label-save"]');const tag=labels.find(l=>l.name==='客户 A');ok(tag);go('inbox');const c=document.querySelector('[data-mail-check="2"]');c.checked=true;c.dispatchEvent(new Event('change'));click('[data-act="bulk-label"]');click('[data-act="bulk-label-set"][data-id="'+tag.id+'"]');click('[data-act="open-label"][data-id="'+tag.id+'"]');ok(S.page==='label'&&rowsFor('label').some(m=>m.id===2))});
check('Rule preview, opt-in retroactive application, undo',()=>{go('organize');click('[data-act="organize-tab"][data-id="rules"]');click('[data-act="rule-new"]');$('rule-query').value='校样';$('rule-action').value='category:notifications';click('[data-act="rule-preview"]');ok($('rule-preview').textContent.includes('3 封'));ok(!$('rule-apply').checked);$('rule-apply').checked=true;click('[data-act="rule-save"]');ok(getMail(2).category==='notifications');click('[data-act="undo"]');ok(getMail(2).category==='people')});
check('Spam and trash restore preserve original folder on undo',()=>{for(const [folder,id] of [['spam',21],['trash',22]]){go(folder);click('[data-act="open"][data-id="'+id+'"]');click('[data-act="restore-current"]');ok(getMail(id).folder==='inbox');click('[data-act="undo"]');ok(getMail(id).folder===folder)}});
check('Search checkbox actions stay bound after typing',()=>{go('search');input('search-query','校样');const c=document.querySelector('[data-mail-check="2"]');c.checked=true;c.dispatchEvent(new Event('change'));ok(S.checked.has(2));ok(document.querySelector('[data-act="bulk-label"]'))});
console.log('V7 RESULT '+checkResults.filter(r=>r.passed).length+'/'+checkResults.length);S.account='all';S.category='all';S.unreadOnly=false;go('inbox');$('toast').hidden=true;

check('Search excludes discarded mail until explicitly included',()=>{go('search');S.hasAttachment=false;S.searchAccount='all';input('search-query','本周推广');ok(searchItems().length===0);$('search-discarded').checked=true;$('search-discarded').dispatchEvent(new Event('change'));ok(searchItems().length===1);click('[data-act="search-clear"]');ok(!S.includeDiscarded)});
