'use client';

import React from 'react';
import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ConfirmationDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center p-2">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
          isDestructive ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
        }`}>
          <AlertCircle className="h-6 w-6" />
        </div>
        
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {message}
        </p>

        <div className="mt-6 flex w-full gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/10'
                : 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/10'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
