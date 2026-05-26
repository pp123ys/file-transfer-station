import { useState, useEffect } from "react";
import { adminAnnouncementsAPI } from "../api/admin";

const DISPLAY_TYPE_LABELS = {
  banner: "横幅",
  modal: "弹窗",
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [displayType, setDisplayType] = useState("banner");
  const [isPinned, setIsPinned] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await adminAnnouncementsAPI.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("加载公告失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDisplayType("banner");
    setIsPinned(false);
    setIsActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { title, content, display_type: displayType, is_pinned: isPinned, is_active: isActive };

    try {
      if (editingId) {
        await adminAnnouncementsAPI.updateAnnouncement(editingId, data);
      } else {
        await adminAnnouncementsAPI.createAnnouncement(data);
      }
      resetForm();
      loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.detail || "操作失败");
    }
  };

  const handleEdit = (ann) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setDisplayType(ann.display_type);
    setIsPinned(ann.is_pinned);
    setIsActive(ann.is_active);
    setShowForm(true);
  };

  const handleToggle = async (id) => {
    try {
      await adminAnnouncementsAPI.toggleAnnouncement(id);
      loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.detail || "操作失败");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除此公告吗？")) return;
    try {
      await adminAnnouncementsAPI.deleteAnnouncement(id);
      loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.detail || "删除失败");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">公告管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新建公告
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? "编辑公告" : "新建公告"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容（支持 Markdown：**粗体**、[链接](url)、换行）
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                required
              />
            </div>
            <div className="flex gap-6 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">展示形式</label>
                <select
                  value={displayType}
                  onChange={(e) => setDisplayType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="banner">横幅</option>
                  <option value="modal">弹窗</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isPinned" className="text-sm text-gray-700">置顶</label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">立即生效</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? "保存修改" : "发布公告"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">\U0001f4e2</div>
          <p className="text-gray-500">暂无公告</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">置顶</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {announcements.map((ann) => (
                <tr key={ann.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ann.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {DISPLAY_TYPE_LABELS[ann.display_type]}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {ann.is_pinned && (
                      <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                        置顶
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ann.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {ann.is_active ? "生效中" : "已停用"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ann.created_at).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleToggle(ann.id)}
                      className="text-yellow-600 hover:text-yellow-800 mr-3"
                    >
                      {ann.is_active ? "停用" : "启用"}
                    </button>
                    <button
                      onClick={() => handleEdit(ann)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
