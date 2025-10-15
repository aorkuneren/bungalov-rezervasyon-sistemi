import React from 'react';
import Modal from './ui/Modal';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const TermsModal = ({ isOpen, onClose, selectedTerm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedTerm?.title || "Sözleşme Detayı"}
      size="lg"
    >
      {selectedTerm ? (
        <div className="max-h-96 overflow-y-auto">
          <div 
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: selectedTerm.content }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Sözleşme bulunamadı</p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TermsModal;
