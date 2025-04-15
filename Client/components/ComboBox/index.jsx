'use client';

import { useState } from 'react';
import styles from './ComboBox.module.scss';

export default function ComboBox({ options, onChange }) {
  const [selected, setSelected] = useState('');
  const [open, setOpen] = useState(false);

  const handleSelect = (option) => {
    setSelected(option);
    onChange(option);
    setOpen(false);
  };

  return (
    <div className={styles.comboBox}>
      <div
        className={styles.selected}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected || 'Select an option'}
        <span className={styles.arrow}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <ul className={styles.options}>
          {options.map((opt) => (
            <li key={opt} onClick={() => handleSelect(opt)}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}