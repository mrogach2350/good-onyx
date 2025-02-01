export default function GridTextEditor({ value, onValueChange }: any) {
  return (
    <input
      className="pl-4"
      type="text"
      value={value || ""}
      onChange={({ target: { value } }) =>
        onValueChange(value === "" ? null : value)
      }
    />
  );
}
