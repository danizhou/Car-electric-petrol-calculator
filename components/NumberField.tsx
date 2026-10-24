interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function NumberField({ id, label, value, onChange }: NumberFieldProps) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
