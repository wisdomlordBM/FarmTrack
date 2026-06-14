import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  type = 'danger'
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl shadow-slate-300/40 overflow-hidden"
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top colored bar */}
          <div className={`h-2 w-full ${type === 'danger' ? 'bg-rose-500' : 'bg-amber-500'}`} />

          <div className="p-7">
            {/* Icon */}
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
              type === 'danger' ? 'bg-rose-50' : 'bg-amber-50'
            }`}>
              {type === 'danger'
                ? <Trash2 size={28} className="text-rose-500" />
                : <AlertTriangle size={28} className="text-amber-500" />
              }
            </div>

            {/* Text */}
            <h2 className="text-xl font-black text-slate-900 text-center mb-2">{title}</h2>
            <p className="text-slate-500 text-sm text-center leading-6">{message}</p>

            {/* Buttons */}
            <div className="flex gap-3 mt-7">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <motion.button
                onClick={() => { onConfirm(); onClose(); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 rounded-2xl text-white font-bold transition-all shadow-lg ${
                  type === 'danger'
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                }`}>
                {confirmText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}