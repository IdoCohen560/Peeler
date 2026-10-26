'use strict';
const ns = 'http://www.w3.org/2000/svg', svg = document.querySelector('#wheel');
let menu = { mode: 'convert', choices: [] }, selected, page = 0;
const point = (r, angle) => [180 + Math.cos(angle) * r, 180 + Math.sin(angle) * r];
function element(tag, attributes, text) { const node = document.createElementNS(ns, tag); for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value); if (text) node.textContent = text; return node; }
function choose(value) { selected = value; for (const node of svg.querySelectorAll('.petal')) { node.classList.toggle('selected', node.dataset.value === value); node.setAttribute('aria-pressed', String(node.dataset.value === value)); } }
function render() {
  svg.replaceChildren(); const choices = menu.choices.slice(page * 8, page * 8 + 8), count = choices.length;
  choices.forEach((choice, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / count, a = angle - Math.PI / count + .035, b = angle + Math.PI / count - .035;
    const p1 = point(158, a), p2 = point(158, b), p3 = point(65, b), p4 = point(65, a), label = point(111, angle), large = b - a > Math.PI ? 1 : 0;
    const shape = element('path', { d: `M${p1} A158,158 0 ${large} 1 ${p2} L${p3} A65,65 0 ${large} 0 ${p4} Z`, class: 'petal', role: 'button', tabindex: '0', 'aria-label': choice.label, 'aria-pressed': 'false', 'data-value': choice.value });
    shape.onpointerenter = () => choose(choice.value); shape.ondragenter = event => { event.preventDefault(); choose(choice.value); }; shape.ondragover = event => { event.preventDefault(); choose(choice.value); };
    shape.onclick = () => { choose(choice.value); if (menu.pending) apply(); };
    shape.onkeydown = event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); choose(choice.value); if (menu.pending) apply(); } };
    svg.append(shape, element('text', { x: label[0], y: label[1], class: 'petal-label' }, choice.label));
  });
  svg.append(element('circle', { cx: 180, cy: 180, r: 59, class: 'center' }), element('text', { x: 180, y: 178, class: 'center-title' }, menu.mode === 'tools' ? 'File tools' : 'Convert'), element('text', { x: 180, y: 198, class: 'center-hint' }, menu.pending ? `${menu.fileCount} ${menu.fileCount === 1 ? 'file' : 'files'} ready` : 'Drop files here'));
  document.querySelector('#modes').hidden = !menu.pending;
  document.querySelector('#options').hidden = !menu.pending;
  document.querySelector('#convert-mode').setAttribute('aria-pressed', String(menu.mode === 'convert'));
  document.querySelector('#tools-mode').setAttribute('aria-pressed', String(menu.mode === 'tools'));
  document.querySelector('#more').hidden = menu.choices.length <= 8;
  document.querySelector('#hint').textContent = `${menu.pending ? 'Click a choice to apply. ' : ''}${menu.note || 'Drop files here, then choose. Escape cancels.'}`;
  if (!menu.choices.length) document.querySelector('#hint').textContent = menu.note || 'No shared conversions are available for these files.';
  if (selected) choose(selected);
}
async function apply() { try { await window.wheel.apply({ value: selected, mode: menu.mode }); } catch (error) { document.querySelector('#hint').textContent = error.message; } }
document.querySelector('#more').onclick = () => { page = (page + 1) % Math.ceil(menu.choices.length / 8); selected = undefined; render(); };
for (const [id, mode] of [['convert-mode', 'convert'], ['tools-mode', 'tools']]) document.querySelector(`#${id}`).onclick = async () => {
  try { await window.wheel.setMode(mode); } catch (error) { document.querySelector('#hint').textContent = error.message; }
};
document.querySelector('#close').onclick = () => window.wheel.close();
document.querySelector('#options').onclick = async () => { try { await window.wheel.options(); } catch (error) { document.querySelector('#hint').textContent = error.message; } };
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') window.wheel.close();
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault(); const choices = [...svg.querySelectorAll('.petal')], index = choices.indexOf(document.activeElement), direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
    if (choices.length) { const next = choices[(index + direction + choices.length) % choices.length]; next.focus(); choose(next.dataset.value); }
  }
});
document.addEventListener('dragover', event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; choose(event.target.closest?.('.petal')?.dataset.value); });
document.addEventListener('drop', async event => {
  event.preventDefault();
  try { await window.wheel.drop(Array.from(event.dataTransfer.files)); }
  catch (error) { document.querySelector('#hint').textContent = error.message; }
});
window.wheel.onMenu(value => { menu = value; selected = undefined; page = 0; render(); if (menu.pending) svg.querySelector('.petal')?.focus(); });
window.wheel.ready();
