import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useProperty,
  usePropertyMedia,
  usePropertyDocuments,
  useUploadMedia,
  useSetCoverMedia,
  useDeleteMedia,
  useUploadDocument,
  useDeleteDocument,
} from '../../hooks/useProperties';
import { ArrowLeft, Image as ImageIcon, FileText, Upload, Trash2, Star, Download } from 'lucide-react';

export function PropertyMediaPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'media' | 'documents'>('media');

  const { data: property } = useProperty(id || '');
  const { data: mediaList, isLoading: isMediaLoading } = usePropertyMedia(id || '');
  const { data: documentList, isLoading: isDocsLoading } = usePropertyDocuments(id || '');

  const uploadMediaMutation = useUploadMedia();
  const setCoverMutation = useSetCoverMedia();
  const deleteMediaMutation = useDeleteMedia();

  const uploadDocMutation = useUploadDocument();
  const deleteDocMutation = useDeleteDocument();

  // Document form state
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('brochure');
  const [docVisibility, setDocVisibility] = useState('public');
  const [docFile, setDocFile] = useState<File | null>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && id) {
      const formData = new FormData();
      Array.from(e.target.files).forEach((file) => {
        formData.append('files', file);
      });
      await uploadMediaMutation.mutateAsync({ propertyId: id, formData });
      e.target.value = '';
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !id) return;

    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('name', docName || docFile.name);
    formData.append('type', docType);
    formData.append('visibility', docVisibility);

    await uploadDocMutation.mutateAsync({ propertyId: id, formData });
    setDocFile(null);
    setDocName('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/properties" className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Media & Documents: {property?.title || 'Property'}
            </h1>
            <p className="text-sm text-gray-500">Manage high-resolution images, floor plans, and legal files.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'media' ? 'bg-[#004274] text-white' : 'bg-white border text-gray-700'
            }`}
          >
            <ImageIcon className="inline h-4 w-4 mr-1.5" />
            Photo Gallery ({mediaList?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'documents' ? 'bg-[#004274] text-white' : 'bg-white border text-gray-700'
            }`}
          >
            <FileText className="inline h-4 w-4 mr-1.5" />
            Document Hub ({documentList?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab 1: Image Gallery */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Uploader Box */}
          <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center hover:border-[#004274] transition">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-900">Upload Property Photos</h4>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Select multiple JPEG, PNG, or WebP files. Images are automatically converted to optimized WebP thumbnails and web versions.
            </p>
            <label className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#004274] hover:bg-[#00335a] cursor-pointer shadow-sm">
              <span>Select Photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMediaUpload}
                disabled={uploadMediaMutation.isPending}
                className="hidden"
              />
            </label>
            {uploadMediaMutation.isPending && (
              <p className="text-xs text-[#004274] font-medium mt-3 animate-pulse">Processing and uploading images with Sharp...</p>
            )}
          </div>

          {/* Media Grid */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Uploaded Images</h3>
            {isMediaLoading ? (
              <div className="py-12 text-center text-gray-500">Loading gallery...</div>
            ) : (!mediaList || mediaList.length === 0) ? (
              <div className="py-12 text-center text-gray-400">No images uploaded yet. Upload above.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaList.map((m: any) => (
                  <div key={m._id} className="group relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    <img
                      src={m.thumbnailUrl || m.webUrl || m.originalUrl}
                      alt={m.fileName}
                      className="h-36 w-full object-cover group-hover:scale-105 transition duration-200"
                    />

                    {/* Cover badge */}
                    {m.isCover && (
                      <span className="absolute top-2 left-2 bg-[#004274] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        Cover Photo
                      </span>
                    )}

                    {/* Actions overlay */}
                    <div className="p-2 flex items-center justify-between bg-white border-t border-gray-100">
                      {!m.isCover ? (
                        <button
                          onClick={() => setCoverMutation.mutate({ id: m._id, propertyId: id! })}
                          className="text-xs font-semibold text-gray-600 hover:text-[#004274] flex items-center gap-1"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Set Cover
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          Active Cover
                        </span>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm('Delete this photo?')) {
                            deleteMediaMutation.mutate({ id: m._id, propertyId: id! });
                          }
                        }}
                        className="text-gray-400 hover:text-red-600 p-1 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Document Hub */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document Upload Form */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Attach Property Document</h3>
            <form onSubmit={handleDocumentUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architectural Floor Plan"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#004274] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="brochure">Sales Brochure</option>
                  <option value="floor_plan">Floor Plan</option>
                  <option value="energy_certificate">Energy Certificate (BER)</option>
                  <option value="legal">Legal Title / Registry</option>
                  <option value="contract">Draft Contract / Agreement</option>
                  <option value="owner_document">Owner / Identity Document</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Access Visibility</label>
                <select
                  value={docVisibility}
                  onChange={(e) => setDocVisibility(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-[#004274] focus:outline-none"
                >
                  <option value="public">Public (Visible on Website)</option>
                  <option value="internal">Internal (Staff & Agents only)</option>
                  <option value="admin_only">Admin Only (Confidential / Legal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">File (PDF / DOC) *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#004274] hover:file:bg-blue-100"
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={uploadDocMutation.isPending || !docFile}
                  className="px-5 py-2 rounded-lg bg-[#004274] text-white text-sm font-semibold hover:bg-[#00335a] disabled:opacity-50 transition"
                >
                  {uploadDocMutation.isPending ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>

          {/* Document List Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-900">
              Attached Documents
            </div>
            {isDocsLoading ? (
              <div className="p-12 text-center text-gray-500">Loading documents...</div>
            ) : (!documentList || documentList.length === 0) ? (
              <div className="p-12 text-center text-gray-400">No documents attached yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Visibility</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documentList.map((doc: any) => (
                    <tr key={doc._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        <FileText className="inline h-4 w-4 mr-2 text-gray-400" />
                        {doc.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 capitalize">{doc.type.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          doc.visibility === 'public'
                            ? 'bg-green-100 text-green-800'
                            : doc.visibility === 'internal'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.visibility}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-500 hover:text-[#004274] hover:bg-gray-100 rounded-lg"
                            title="Download / View"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this document?')) {
                                deleteDocMutation.mutate({ id: doc._id, propertyId: id! });
                              }
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
