
const STORAGE_KEY = 'todo-app.todos-v1'
let todos = []
let filter = 'all'

const el = id => document.getElementById(id)
const q = s => document.querySelector(s)

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    todos = raw ? JSON.parse(raw) : []
  } catch (e) { todos = [] }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

function addTodo(text) {
  if (!text || !text.trim()) return
  todos.unshift({ id: uid(), text: text.trim(), completed: false, createdAt: Date.now() })
  save(); render()
}

function updateTodo(id, fields) {
  todos = todos.map(t => t.id === id ? Object.assign({}, t, fields) : t)
  save(); render()
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id)
  save(); render()
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed)
  save(); render()
}

function filteredTodos() {
  if (filter === 'active') return todos.filter(t => !t.completed)
  if (filter === 'completed') return todos.filter(t => t.completed)
  return todos
}

function render() {
  const list = el('todo-list')
  list.innerHTML = ''
  const items = filteredTodos()
  for (const t of items) {
    const li = document.createElement('li')
    li.className = 'todo-item' + (t.completed ? ' completed' : '')

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = t.completed
    checkbox.addEventListener('change', () => updateTodo(t.id, { completed: checkbox.checked }))

    const label = document.createElement('div')
    label.className = 'label'
    label.textContent = t.text
    label.title = 'Double-click to edit'
    label.addEventListener('dblclick', () => startEdit(li, t))

    const editBtn = document.createElement('button')
    editBtn.innerText = '✏️'
    editBtn.title = 'Edit'
    editBtn.addEventListener('click', () => startEdit(li, t))

    const delBtn = document.createElement('button')
    delBtn.innerText = '🗑️'
    delBtn.title = 'Delete'
    delBtn.addEventListener('click', () => deleteTodo(t.id))

    li.appendChild(checkbox)
    li.appendChild(label)
    li.appendChild(editBtn)
    li.appendChild(delBtn)

    list.appendChild(li)
  }

  el('items-left').textContent = `${todos.filter(t => !t.completed).length} item${todos.filter(t => !t.completed).length !== 1 ? 's' : ''} left`
}

function startEdit(li, todo) {
  li.innerHTML = ''
  li.classList.remove('completed')
  const input = document.createElement('input')
  input.className = 'edit-input'
  input.value = todo.text
  li.appendChild(input)

  const saveBtn = document.createElement('button')
  saveBtn.innerText = 'Save'
  saveBtn.addEventListener('click', () => {
    const v = input.value.trim()
    if (v) updateTodo(todo.id, { text: v })
    else deleteTodo(todo.id)
  })

  const cancelBtn = document.createElement('button')
  cancelBtn.innerText = 'Cancel'
  cancelBtn.addEventListener('click', render)

  li.appendChild(saveBtn)
  li.appendChild(cancelBtn)
  input.focus()
  input.select()
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn.click()
    if (e.key === 'Escape') cancelBtn.click()
  })
}

function setup() {
  load(); render()
  const form = el('todo-form')
  const input = el('todo-input')
  form.addEventListener('submit', (e) => {
    e.preventDefault(); addTodo(input.value); input.value = ''
  })

  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      filter = btn.dataset.filter; render()
    })
  })

  el('clear-completed').addEventListener('click', clearCompleted)
}

window.addEventListener('DOMContentLoaded', setup)