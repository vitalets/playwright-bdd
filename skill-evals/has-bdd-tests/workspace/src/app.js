/* global document */
const form = document.querySelector('#add-task');
const input = document.querySelector('#task-title');
const tasks = document.querySelector('#tasks');
const error = document.querySelector('#error');
const emptyList = document.querySelector('#empty-list');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) {
    error.textContent = 'Enter a task title.';
    input.focus();
    return;
  }

  const task = document.createElement('li');
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  const text = document.createElement('span');
  text.textContent = title;
  label.append(checkbox, text);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Delete';
  remove.setAttribute('aria-label', `Delete ${title}`);
  remove.addEventListener('click', () => {
    task.remove();
    emptyList.hidden = tasks.children.length > 0;
  });

  task.append(label, remove);
  tasks.append(task);
  emptyList.hidden = true;
  error.textContent = '';
  form.reset();
  input.focus();
});
