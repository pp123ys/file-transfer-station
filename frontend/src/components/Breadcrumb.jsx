export default function Breadcrumb({ path, onNavigate }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <button
            onClick={() => onNavigate(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            全部文件
          </button>
        </li>
        {path.map((item, index) => (
          <li key={item.id} className="flex items-center">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <button
              onClick={() => onNavigate(item)}
              className={`ml-2 ${
                index === path.length - 1
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
