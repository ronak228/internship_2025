import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
import '../styles/DocumentEditor.css';

const DocumentEditor = () => {
  // const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentContent, setDocumentContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('Auto-saved');
  const [showExportModal, setShowExportModal] = useState(false);
  const [fontFamily, setFontFamily] = useState('Times New Roman, serif');
  const [fontSize, setFontSize] = useState('16px');
  const [notification, setNotification] = useState('');

  const editorRef = useRef(null);
  const autoSaveInterval = useRef(null);

  useEffect(() => {
    loadDocuments();
    startAutoSave();
    
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = fontFamily;
      editorRef.current.style.fontSize = fontSize;
    }
  }, [fontFamily, fontSize]);

  useEffect(() => {
    if (editorRef.current && documentContent) {
      editorRef.current.value = documentContent;
    }
  }, [documentContent]);

  // Initialize editor on mount
  useEffect(() => {
    if (editorRef.current) {
      // Set initial content if empty
      if (!editorRef.current.value || editorRef.current.value.trim() === '') {
        editorRef.current.value = 'Start typing here...';
      }
      
      // Force text direction settings
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.style.unicodeBidi = 'normal';
      editorRef.current.style.writingMode = 'horizontal-tb';
      editorRef.current.setAttribute('dir', 'ltr');
      editorRef.current.setAttribute('lang', 'en');
    }
  }, [editorRef.current]);



  const loadDocuments = () => {
    const saved = localStorage.getItem('doc_editor_documents');
    if (saved) {
      const docs = JSON.parse(saved);
      setDocuments(docs);
      if (docs.length === 0) {
        createNewDocument();
      } else {
        loadDocument(docs[0].id);
      }
    } else {
      createNewDocument();
    }
  };

  const saveDocuments = (docs) => {
    localStorage.setItem('doc_editor_documents', JSON.stringify(docs));
    setDocuments(docs);
  };

  const createNewDocument = () => {
    const newDoc = {
      id: Date.now(),
      title: 'Untitled Document',
      content: 'Welcome to your new document!\n\nStart writing here...',
      wordCount: 8,
      charCount: 50,
      lastModified: new Date().toLocaleDateString(),
      created: new Date().toISOString()
    };

    const updatedDocs = [newDoc, ...documents];
    saveDocuments(updatedDocs);
    
    // Set current document first, then load it
    setCurrentDocId(newDoc.id);
    setDocumentTitle(newDoc.title);
    setDocumentContent(newDoc.content);
    
    // Initialize editor content
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.value = newDoc.content;
        editorRef.current.focus();
      }
    }, 100);
    
    showNotification('New document created!');
  };

  const loadDocument = (docId) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setCurrentDocId(docId);
    setDocumentTitle(doc.title);
    setDocumentContent(doc.content);
    
    // Set content after a small delay to ensure the ref is available
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.value = doc.content;
        editorRef.current.focus();
      }
    }, 100);
  };

  const saveDocument = () => {
    if (!currentDocId) return;

    const doc = documents.find(d => d.id === currentDocId);
    if (!doc) return;

    const title = documentTitle.trim() || 'Untitled Document';
    const content = editorRef.current ? editorRef.current.value : documentContent;
    const wordCount = countWords(content);
    const charCount = countCharacters(content);

    const updatedDoc = {
      ...doc,
      title,
      content,
      wordCount,
      charCount,
      lastModified: new Date().toLocaleDateString()
    };

    const updatedDocs = documents.map(d => d.id === currentDocId ? updatedDoc : d);
    saveDocuments(updatedDocs);
    setSaveStatus('Saved');
    showNotification('Document saved successfully!');
  };

  const deleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocs = documents.filter(d => d.id !== docId);
      saveDocuments(updatedDocs);
      
      if (currentDocId === docId) {
        if (updatedDocs.length > 0) {
          loadDocument(updatedDocs[0].id);
        } else {
          createNewDocument();
        }
      }
      
      showNotification('Document deleted');
    }
  };

  const formatText = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      setSaveStatus('Modified');
      // Update content after formatting
      setDocumentContent(editorRef.current.innerHTML);
    }
  };

  const insertText = (text) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, text);
      setSaveStatus('Modified');
      // Update content after insertion
      setDocumentContent(editorRef.current.innerHTML);
    }
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    setDocumentContent(content);
    setSaveStatus('Modified');
  };

  const handleKeyDown = (e) => {
    // Ensure text direction remains correct during typing
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.style.unicodeBidi = 'normal';
    }
  };

  const handleTitleChange = (e) => {
    setDocumentTitle(e.target.value);
    setSaveStatus('Modified');
  };

  const countWords = (text) => {
    const plainText = text.replace(/<[^>]*>/g, '');
    return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const countCharacters = (text) => {
    return text.replace(/<[^>]*>/g, '').length;
  };

  const startAutoSave = () => {
    autoSaveInterval.current = setInterval(() => {
      if (saveStatus === 'Modified') {
        saveDocument();
      }
    }, 30000); // Auto-save every 30 seconds
  };

  const exportAsHTML = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : documentContent;
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <title>${documentTitle}</title>
    <style>
        body { font-family: ${fontFamily}; line-height: 1.6; margin: 40px; }
        h1, h2, h3 { color: #333; }
    </style>
</head>
<body>
    <h1>${documentTitle}</h1>
    <div>${content}</div>
</body>
</html>`;

    downloadFile(fullHTML, `${documentTitle}.html`, 'text/html');
    setShowExportModal(false);
  };

  const exportAsText = () => {
    const content = editorRef.current ? editorRef.current.innerText : documentContent.replace(/<[^>]*>/g, '');
    const fullText = `${documentTitle}\n\n${content}`;

    downloadFile(fullText, `${documentTitle}.txt`, 'text/plain');
    setShowExportModal(false);
  };

  const printDocument = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : documentContent;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>${documentTitle}</title>
        <style>
          body { font-family: ${fontFamily}; line-height: 1.6; margin: 40px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>${documentTitle}</h1>
        <div>${content}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    
    setShowExportModal(false);
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type: type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const currentDoc = documents.find(d => d.id === currentDocId);
  const wordCount = currentDoc ? currentDoc.wordCount : countWords(documentContent);
  const charCount = currentDoc ? currentDoc.charCount : countCharacters(documentContent);

  return (
    <div className="document-editor">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="fas fa-file-alt"></i> Document Editor
          </Link>
          <div className="navbar-nav ms-auto">
            <button className="nav-link btn-link" onClick={createNewDocument}>
              <i className="fas fa-plus"></i> New
            </button>
            <button className="nav-link btn-link" onClick={saveDocument}>
              <i className="fas fa-save"></i> Save
            </button>
            <button className="nav-link btn-link" onClick={() => setShowExportModal(true)}>
              <i className="fas fa-download"></i> Export
            </button>
            <Link className="nav-link" to="/">
              <i className="fas fa-home"></i> Dashboard
            </Link>
            {/* {user && (
              <button className="nav-link btn-link" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            )} */}
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 col-md-4">
            <div className="sidebar mt-3">
              <div className="sidebar-title">
                <i className="fas fa-folder"></i> My Documents
              </div>
              
              <button className="btn btn-primary btn-sm mb-3" onClick={createNewDocument}>
                <i className="fas fa-plus"></i> New Document
              </button>
              
              <div className="document-list">
                {documents.length === 0 ? (
                  <p className="text-muted text-center">No documents yet</p>
                ) : (
                  documents.map(doc => (
                    <div 
                      key={doc.id}
                      className={`document-item ${doc.id === currentDocId ? 'active' : ''}`}
                      onClick={() => loadDocument(doc.id)}
                    >
                      <div className="document-name">{doc.title}</div>
                      <div className="document-meta">
                        {doc.lastModified} • {doc.wordCount} words
                        <button 
                          className="btn btn-danger btn-sm float-right"
                          onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }}
                          style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Document Stats */}
            <div className="sidebar">
              <div className="sidebar-title">
                <i className="fas fa-chart-bar"></i> Statistics
              </div>
              <div className="stats">
                <p><i className="fas fa-file-alt"></i> {documents.length} Documents</p>
                <p><i className="fas fa-clock"></i> Last saved: {currentDoc?.lastModified || 'Never'}</p>
                <p><i className="fas fa-keyboard"></i> {wordCount} Words</p>
                <p><i className="fas fa-text-height"></i> {charCount} Characters</p>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="col-lg-9 col-md-8">
            <div className="editor-container">
              {/* Document Header */}
              <div className="editor-header">
                <input 
                  type="text" 
                  className="document-title" 
                  placeholder="Untitled Document"
                  value={documentTitle}
                  onChange={handleTitleChange}
                />
              </div>

              {/* Toolbar */}
              <div className="toolbar">
                {/* Text Formatting */}
                <div className="toolbar-group">
                  <select 
                    className="toolbar-select" 
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                  >
                    <option value="Times New Roman, serif">Times New Roman</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="Courier New, monospace">Courier New</option>
                  </select>
                  <select 
                    className="toolbar-select"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                  >
                    <option value="12px">12</option>
                    <option value="14px">14</option>
                    <option value="16px">16</option>
                    <option value="18px">18</option>
                    <option value="20px">20</option>
                    <option value="24px">24</option>
                    <option value="28px">28</option>
                    <option value="32px">32</option>
                  </select>
                </div>

                {/* Text Style */}
                <div className="toolbar-group">
                  <button className="toolbar-btn" onClick={() => formatText('bold')} title="Bold">
                    <i className="fas fa-bold"></i>
                  </button>
                  <button className="toolbar-btn" onClick={() => formatText('italic')} title="Italic">
                    <i className="fas fa-italic"></i>
                  </button>
                  <button className="toolbar-btn" onClick={() => formatText('underline')} title="Underline">
                    <i className="fas fa-underline"></i>
                  </button>
                </div>

                {/* Alignment */}
                <div className="toolbar-group">
                  <button className="toolbar-btn" onClick={() => formatText('justifyLeft')} title="Align Left">
                    <i className="fas fa-align-left"></i>
                  </button>
                  <button className="toolbar-btn" onClick={() => formatText('justifyCenter')} title="Center">
                    <i className="fas fa-align-center"></i>
                  </button>
                  <button className="toolbar-btn" onClick={() => formatText('justifyRight')} title="Align Right">
                    <i className="fas fa-align-right"></i>
                  </button>
                  <button className="toolbar-btn" onClick={() => formatText('justifyFull')} title="Justify">
                    <i className="fas fa-align-justify"></i>
                  </button>
                </div>

                {/* Lists */}
                <div className="toolbar-group">
                  <button className="toolbar-btn" onClick={() => formatText('insertUnorderedList')} title="Bullet List">
                    <i className="fas fa-list-ul"></i>
                  </button>
                  <button className="toolbar-btn" onClick={() => formatText('insertOrderedList')} title="Numbered List">
                    <i className="fas fa-list-ol"></i>
                  </button>
                </div>

                {/* Actions */}
                <div className="toolbar-group">
                  <button className="toolbar-btn" onClick={() => insertText('• ')} title="Add Bullet">
                    <i className="fas fa-list-ul"></i>
                  </button>
                  <button className="toolbar-btn" onClick={() => insertText('1. ')} title="Add Number">
                    <i className="fas fa-list-ol"></i>
                  </button>
                  <button className="toolbar-btn" onClick={() => formatText('removeFormat')} title="Clear Format">
                    <i className="fas fa-remove-format"></i>
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="editor-content">
                <textarea
                  className="document-editor-textarea"
                  ref={editorRef}
                  value={documentContent.replace(/<[^>]*>/g, '')}
                  onChange={(e) => {
                    setDocumentContent(e.target.value);
                    setSaveStatus('Modified');
                  }}
                  style={{ 
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'normal',
                    writingMode: 'horizontal-tb'
                  }}
                  spellCheck="true"
                  dir="ltr"
                  lang="en"
                  placeholder="Start typing here..."
                />
              </div>

              {/* Document Stats */}
              <div className="document-stats">
                <div>
                  {wordCount} words • {charCount} characters
                </div>
                <div>
                  {saveStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {notification && (
        <div className="success-notification">
          <i className="fas fa-check-circle"></i> {notification}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title"><i className="fas fa-download"></i> Export Document</h5>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => setShowExportModal(false)}
              >
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>Choose how you want to export your document:</p>
              <div className="export-options">
                <button className="btn btn-outline-primary mb-2" onClick={exportAsHTML}>
                  <i className="fas fa-code"></i> Export as HTML
                </button>
                <button className="btn btn-outline-secondary mb-2" onClick={exportAsText}>
                  <i className="fas fa-file-alt"></i> Export as Plain Text
                </button>
                <button className="btn btn-outline-success" onClick={printDocument}>
                  <i className="fas fa-print"></i> Print Document
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;