"use client";
import { FC } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onRemove?: () => void;
}

const ContributorInput: FC<Props> = ({ value, onChange, onRemove }) => (
  <div className="flex gap-2 mb-2 items-center">
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Nome do contribuidor"
      className="border p-1 flex-1"
      required
    />
    {onRemove && <button type="button" className="bg-red-500 text-white px-2" onClick={onRemove}>X</button>}
  </div>
);

export default ContributorInput;
