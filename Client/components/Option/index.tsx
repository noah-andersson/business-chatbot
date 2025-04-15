import React, { ChangeEvent, FC, useState } from 'react';
import styles from '../../App.module.scss';
import { Option } from '@/types';

const OptionView: FC<Option> = (props) => {
  const { options, onSelect, selected } = props;

  return (
    <div className={styles.options}>
      <div style={{ maxHeight: 500, overflowY: 'scroll' }}>
        {options
          .filter((option: { label: string, value: string }) => option.label.toLowerCase())
          .map((option: { label: string, value: string }, index) => (
            <div key={index}>
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

export default OptionView;