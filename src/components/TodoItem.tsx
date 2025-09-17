import React, { useState } from 'react';
import { Todo } from '../types';
import { Button, TextField, Container, Typography, List, ListItem, Checkbox } from "@mui/material";


type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
};

const TodoItem: React.FC<Props> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(todo.title);

  const save = () => {
    const t = editVal.trim();
    if (t) onEdit(todo.id, t);
    setIsEditing(false);
  };

  return (
    <ListItem style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
      <Checkbox  checked={todo.completed} onChange={() => onToggle(todo.id)} />
      {!isEditing ? (
        <div style={{ flex: 1 }}>
          <span
            onDoubleClick={() => setIsEditing(true)}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
          >
            {todo.title}
          </span>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
          <Checkbox 
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => (e.key === 'Enter' ? save() : e.key === 'Escape' && setIsEditing(false))}
            autoFocus
            style={{ flex: 1, padding: '0.25rem' }}
          />
          <Button onClick={save}>Save</Button>
          <Button onClick={() => { setIsEditing(false); setEditVal(todo.title); }}>Cancel</Button>
        </div>
      )}
      <Button onClick={() => onDelete(todo.id)} aria-label={`Delete ${todo.title}`}>Delete</Button>
    </ListItem>
  );
};

export default TodoItem;
