import { useState, useEffect } from "react";
import { announcementsAPI } from "../api/announcements";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [modalAnn, setModalAnn] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementsAPI.getActive();
      const banners = data.filter((a) => a.display_type === "banner");
      const modals = data.filter((a) => a.display_type === "modal");
      setAnnouncements(banners);
      if (modals.length > 0) {
        setModalAnn(modals[0]);
      }
    } catch (err) {
      console.error("加载公告失败:", err);
    }
  };

  const handleDismissBanner = async (id) => {
    try {
      await announcementsAPI.dismiss(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("关闭公告失败:", err);
    }
  };

  const handleCloseModal = () => {
    setModalAnn(null);
  };

  const renderMarkdown = (text) => {
    let html = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
      .replace(/\n/g, "<br/>");
    return html;
  };

  return (
    <>
      {announcements.map((ann) => (
        <div
          key={ann.id}
          className={`mb-4 px-4 py-3 rounded-lg flex items-start justify-between ${
            ann.is_pinned
              ? "bg-amber-50 border border-amber-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {ann.is_pinned && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-medium">
                  置顶
                </span>
              )}
              <span className="text-sm font-semibold text-gray-800">
                {ann.title}
              </span>
            </div>
            <div
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(ann.content) }}
            />
          </div>
          <button
            onClick={() => handleDismissBanner(ann.id)}
            className="ml-3 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {modalAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {modalAnn.title}
            </h3>
            <div
              className="text-sm text-gray-600 mb-6"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(modalAnn.content) }}
            />
            <button
              onClick={handleCloseModal}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
}
