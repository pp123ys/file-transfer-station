export default function Breadcrumb({ path, onNavigate }) {
  return (
    <nav className="flex items-center space-x-2">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center text-body-sm text-body hover:text-link transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="hidden sm:inline">全部文件</span>
      </button>
      
      {path.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <svg className="w-4 h-4 mx-2 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <button
            onClick={() => onNavigate(item)}
            className="text-body-sm text-body hover:text-link transition-colors truncate max-w-32"
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  );
}
