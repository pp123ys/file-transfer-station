import { motion, AnimatePresence } from 'framer-motion';

export default function ActionSheet({ isOpen, onClose, title, actions }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-canvas rounded-t-xl shadow-level-5 z-50 safe-area-bottom"
          >
            {title && (
              <div className="px-4 py-3 border-b border-hairline text-center">
                <p className="text-body-md-strong text-ink">{title}</p>
              </div>
            )}
            <div className="p-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  disabled={action.disabled}
                  className={`w-full flex items-center justify-center px-4 py-4 rounded-lg text-body-md transition-colors touch-target ${
                    action.destructive
                      ? 'text-error hover:bg-error-soft'
                      : action.disabled
                      ? 'text-mute cursor-not-allowed'
                      : 'text-ink hover:bg-canvas-soft'
                  }`}
                >
                  {action.icon && <span className="mr-3">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
            <div className="p-2 pt-0">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center px-4 py-4 rounded-lg text-body-md text-ink bg-canvas-soft hover:bg-hairline transition-colors touch-target"
              >
                取消
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
