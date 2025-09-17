import React, { createContext, ReactNode, useContext } from 'react';
import { Todo } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { makeId } from '../utils/id';

type TodoContextType = {
  todos: Todo[];
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, title: string) => void;
  clearCompleted: () => void;
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);

  const addTodo = (title: string) => {
    const newTodo: Todo = {
      id: makeId(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    if (!newTodo.title) return;
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const editTodo = (id: string, title: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, title: title.trim() } : t)));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted }} >
      {children}
    </TodoContext.Provider>
  );
};

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos must be used within TodoProvider');
  return ctx;
}
