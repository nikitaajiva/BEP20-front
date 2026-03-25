"use client";

import { useState } from "react";
import "./ThemedToggle.css";

export default function ThemedToggle({ id, defaultChecked = false, onChange }) {
  const [enabled, setEnabled] = useState(defaultChecked);

  const handleChange = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    if (onChange) onChange(newValue, id); // Pass state + id back to parent
  };

  return (
    <label className="toggle" htmlFor={id}>
      <input
        type="checkbox"
        name={id}
        id={id}
        className="toggle-input"
        checked={enabled}
        onChange={handleChange}
      />
      <span className="switch"></span>
    </label>
  );
}
