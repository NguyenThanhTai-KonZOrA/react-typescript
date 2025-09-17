import React, { useState } from 'react';
import { Button, TextField } from "@mui/material";

type Props = {
  onAdd: (title: string) => void;
};

const TodoForm: React.FC<Props> = ({ onAdd }) => {
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <TextField
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="What needs to be done?"
        aria-label="Add todo"
        style={{ flex: 1, padding: '0.5rem' }}
      />
      <Button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Add
      </Button>
    </form>
  );
};

export default TodoForm;
