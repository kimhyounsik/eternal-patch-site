type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="실험체 이름 검색..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border p-3"
    />
  );
}