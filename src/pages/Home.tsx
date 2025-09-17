import React, { useState } from 'react';
import { useTodos } from '../context/TodoContext';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import { Filter } from '../types';

const Home: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const remaining = todos.filter(t => !t.completed).length;

  return (
    <section>
      <h1>Todo (React + TypeScript)</h1>
      <TodoForm onAdd={addTodo} />
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setFilter('all')} disabled={filter === 'all'}>All</button>
        <button onClick={() => setFilter('active')} disabled={filter === 'active'} style={{ marginLeft: 8 }}>Active</button>
        <button onClick={() => setFilter('completed')} disabled={filter === 'completed'} style={{ marginLeft: 8 }}>Completed</button>
      </div>

      <TodoList todos={filtered} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} />

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <span>{remaining} item(s) left</span>
        <button onClick={() => clearCompleted()}>Clear completed</button>
      </div>
    </section>
  );
};

export default Home;
