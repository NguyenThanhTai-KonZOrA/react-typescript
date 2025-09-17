import React from 'react';
import { Todo } from '../types';
import TodoItem from './TodoItem';

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
};

const TodoList: React.FC<Props> = ({ todos, onToggle, onDelete, onEdit }) => {
  if (todos.length === 0) return <p>No todos yet.</p>;
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map(t => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
};

export default TodoList;
