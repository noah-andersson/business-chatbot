import React, { ChangeEvent, FC, useState } from 'react';
import styles from '../../App.module.scss';

interface Props {
  options: { label: string, value: string }[];
  onSelect: (option: string) => void;
  selected: string[];
}
const Options: FC<Props> = (props) => {
  const { options, onSelect, selected } = props;
  const [search, setSearch] = useState('');
  const onSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    setSearch(e.target.value);
  };
  return (
    <div className={styles.options}>
      <div style={{ maxHeight: 160, overflowY: 'scroll' }}>
        {options
          .filter((option: { label: string, value: string }) => option.label.toLowerCase().includes(search.toLowerCase()))
          .map((option: { label: string, value: string }) => (
            <div key={option.value}>
              <button
                onClick={() => onSelect(option.value)}
                className={[styles.option, selected.includes(option.value) ? styles.selected : ''].join(' ')}
              >
                {option.label}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Options;
