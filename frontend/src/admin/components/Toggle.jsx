export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`w-10 h-6 rounded-full transition-colors ${
            checked ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
