import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useProperty,
  usePropertyMedia,
  usePropertyDocuments,
  useUploadMedia,
  useAddEmbedMedia,
  useSetCoverMedia,
  useDeleteMedia,
  useUploadDocument,
  useDeleteDocument,
} from '../../hooks/useProperties';
import {
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Upload,
  Trash2,
  Star,
  Download,
  Video,
  Layers,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export function PropertyMediaPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'floorplans' | 'documents'>('photos');

  const { data: property } = useProperty(id || '');
  const { data: mediaList = [], isLoading: isMediaLoading } = usePropertyMedia(id || '');
  const { data: documentList = [], isLoading: isDocsLoading } = usePropertyDocuments(id || '');

  const uploadMediaMutation = useUploadMedia();
  const addEmbedMutation = useAddEmbedMedia();
  const setCoverMutation = useSetCoverMedia();
  const deleteMediaMutation = useDeleteMedia();

  const uploadDocMutation = useUploadDocument();
  const deleteDocMutation = useDeleteDocument();

  // Video embed form state
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedType, setEmbedType] = useState<'video' | 'virtual_tour'>('video');
  const [embedSuccess, setEmbedSuccess] = useState(false);
  const [embedError, setEmbedError] = useState<string | null>(null);

  // Floor plan upload state
  const [floorPlanTitle, setFloorPlanTitle] = useState('');
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);

  // Document form state
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('brochure');
  const [docVisibility, setDocVisibility] = useState('public');
  const [docFile, setDocFile] = useState<File | null>(null);

  // Filter media by type
  const photos = mediaList.filter((m: any) => m.type === 'image' || !m.type);
  const videos = mediaList.filter((m: any) => m.type === 'video' || m.type === 'virtual_tour');
  const floorPlans = documentList.filter((d: any) => d.type === 'floor_plan');
  const documents = documentList.filter((d: any) => d.type !== 'floor_plan');

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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && id && e.target.files[0]) {
      const formData = new FormData();
      formData.append('files', e.target.files[0]);
      await uploadMediaMutation.mutateAsync({ propertyId: id, formData });
      e.target.value = '';
    }
  };

  const handleAddEmbed = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmbedError(null);
    if (!embedUrl.trim() || !id) return;

    try {
      await addEmbedMutation.mutateAsync({
        propertyId: id,
        url: embedUrl.trim(),
        type: embedType,
        title: embedTitle.trim() || (embedType === 'virtual_tour' ? '3D Virtual Walkthrough' : 'Video Tour'),
      });
      setEmbedUrl('');
      setEmbedTitle('');
      setEmbedSuccess(true);
      setTimeout(() => setEmbedSuccess(false), 3000);
    } catch (err: any) {
      setEmbedError(err?.response?.data?.message || err.message || 'Failed to attach embed URL');
    }
  };

  const handleFloorPlanUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floorPlanFile || !id) return;

    const formData = new FormData();
    formData.append('file', floorPlanFile);
    formData.append('name', floorPlanTitle || 'Floor Plan Schematic');
    formData.append('type', 'floor_plan');
    formData.append('visibility', 'public');

    await uploadDocMutation.mutateAsync({ propertyId: id, formData });
    setFloorPlanFile(null);
    setFloorPlanTitle('');
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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/properties" className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Media & Documents Hub
              </h1>
              {property?.isPublished && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Published
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {property?.title || 'Property'} • {property?.city || 'Location'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'photos' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Photos ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'videos' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            Videos & 3D Tours ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('floorplans')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'floorplans' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Floor Plans ({floorPlans.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'documents' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            PDFs & Legal Docs ({documents.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Image Gallery */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Uploader Box */}
          <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-indigo-200 text-center hover:border-indigo-500 transition shadow-sm">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-gray-900">Upload Property High-Res Photos</h4>
            <p className="text-xs text-gray-500 mt-1 mb-4 max-w-md mx-auto">
              Select multiple JPEG, PNG, or WebP files. Files are automatically processed into full-res, web-optimized, and thumbnail formats.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-md transition">
              <ImageIcon className="w-4 h-4" />
              <span>Select Photos from Computer</span>
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
              <p className="text-xs text-indigo-600 font-semibold mt-3 animate-pulse">
                Optimizing images with Sharp & saving...
              </p>
            )}
          </div>

          {/* Media Grid */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Uploaded Gallery ({photos.length})</h3>
              <span className="text-xs text-gray-400">Click star to designate listing primary cover photo</span>
            </div>
            {isMediaLoading ? (
              <div className="py-12 text-center text-gray-400">Loading gallery...</div>
            ) : photos.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No photos uploaded yet. Select images above.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((m: any) => (
                  <div key={m._id} className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-xs">
                    <img
                      src={m.thumbnailUrl || m.webUrl || m.originalUrl}
                      alt={m.fileName}
                      className="h-40 w-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Cover badge */}
                    {m.isCover && (
                      <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        Primary Cover
                      </span>
                    )}

                    {/* Actions overlay */}
                    <div className="p-2 flex items-center justify-between bg-white border-t border-gray-100">
                      {!m.isCover ? (
                        <button
                          onClick={() => setCoverMutation.mutate({ id: m._id, propertyId: id! })}
                          className="text-xs font-semibold text-gray-600 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Set Cover
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          Cover
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <a
                          href={m.webUrl || m.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-indigo-600 p-1"
                          title="View Full Size"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this photo?')) {
                              deleteMediaMutation.mutate({ id: m._id, propertyId: id! });
                            }
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 transition"
                          title="Delete Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Videos & Virtual 3D Tours */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Video File */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Upload Video File (MP4, WebM, MOV)</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Upload walkthrough video files directly (up to 100MB). Visitors can stream full HD video directly on the property page.
                </p>
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Choose Video File</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/mov"
                    onChange={handleVideoUpload}
                    disabled={uploadMediaMutation.isPending}
                    className="hidden"
                  />
                </label>
                {uploadMediaMutation.isPending && (
                  <p className="text-xs text-amber-600 font-semibold mt-2 animate-pulse">Uploading and preparing video...</p>
                )}
              </div>
            </div>

            {/* Embed Video / 3D Virtual Tour Link */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Embed Video or 3D Virtual Tour URL</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Embed external YouTube, Vimeo, or interactive Matterport / Kuula 3D Walkthroughs.
              </p>

              {embedSuccess && (
                <div className="p-2.5 mb-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Embed tour linked successfully!</span>
                </div>
              )}
              {embedError && (
                <div className="p-2.5 mb-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{embedError}</span>
                </div>
              )}

              <form onSubmit={handleAddEmbed} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Media Type</label>
                  <select
                    value={embedType}
                    onChange={(e: any) => setEmbedType(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="video">Video (YouTube / Vimeo / Direct Link)</option>
                    <option value="virtual_tour">3D Virtual Tour (Matterport / Kuula / 360° Walkthrough)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title / Caption</label>
                  <input
                    type="text"
                    placeholder="e.g. Master Penthouse 4K Cinematic Walkthrough"
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Embed or Video URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or https://my.matterport.com/show/..."
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addEmbedMutation.isPending || !embedUrl.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition"
                >
                  {addEmbedMutation.isPending ? 'Linking...' : 'Attach Video / 3D Tour'}
                </button>
              </form>
            </div>
          </div>

          {/* Videos List */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Attached Video Tours & 3D Walkthroughs ({videos.length})</h3>
            {videos.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No video tours attached yet. Upload a video file or embed a link above.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((vid: any) => {
                  return (
                    <div key={vid._id} className="border border-gray-200 rounded-xl overflow-hidden bg-slate-900 text-white">
                      <div className="relative aspect-video bg-black flex items-center justify-center">
                        {vid.originalUrl.endsWith('.mp4') || vid.originalUrl.endsWith('.webm') ? (
                          <video src={vid.originalUrl} controls className="w-full h-full object-cover" />
                        ) : vid.originalUrl.includes('youtube') ? (
                          <iframe
                            src={vid.originalUrl.replace('watch?v=', 'embed/')}
                            title={vid.fileName}
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        ) : vid.originalUrl.includes('matterport') ? (
                          <iframe
                            src={vid.originalUrl}
                            title={vid.fileName}
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Video className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                            <a
                              href={vid.originalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-300 hover:underline inline-flex items-center gap-1"
                            >
                              <span>Open External Stream</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-100">{vid.fileName}</p>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            {vid.type === 'virtual_tour' ? '3D Virtual Walkthrough' : 'Video Stream'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this video tour?')) {
                              deleteMediaMutation.mutate({ id: vid._id, propertyId: id! });
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Floor Plans */}
      {activeTab === 'floorplans' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-2">Upload Architectural Floor Plan</h3>
            <p className="text-xs text-gray-500 mb-4">
              Attach architectural diagrams, level blueprints, and 2D/3D floor layouts (PDF, PNG, or JPEG).
            </p>
            <form onSubmit={handleFloorPlanUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Floor Plan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Floor & Garden Layout"
                  value={floorPlanTitle}
                  onChange={(e) => setFloorPlanTitle(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">File (PDF, PNG, JPEG) *</label>
                <input
                  type="file"
                  required
                  accept="application/pdf,image/*"
                  onChange={(e) => setFloorPlanFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={uploadDocMutation.isPending || !floorPlanFile}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition"
                >
                  {uploadDocMutation.isPending ? 'Uploading Floor Plan...' : 'Upload Floor Plan'}
                </button>
              </div>
            </form>
          </div>

          {/* Floor Plans List */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Property Floor Plans ({floorPlans.length})</h3>
            {floorPlans.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No floor plans attached yet. Upload blueprint above.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {floorPlans.map((fp: any) => (
                  <div key={fp._id} className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{fp.name}</h4>
                        <span className="text-[10px] text-gray-500">
                          {fp.fileSize ? `${Math.round(fp.fileSize / 1024)} KB` : 'Blueprint'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <a
                        href={fp.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        View / Download
                      </a>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this floor plan?')) {
                            deleteDocMutation.mutate({ id: fp._id, propertyId: id! });
                          }
                        }}
                        className="text-gray-400 hover:text-rose-600 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Legal & Documents Hub */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document Upload Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-2">Attach Property PDF or Legal Document</h3>
            <p className="text-xs text-gray-500 mb-4">
              Upload sales brochures, BER energy certificates, deeds, contracts, and title registers with privacy controls.
            </p>
            <form onSubmit={handleDocumentUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architectural Sales Brochure"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="brochure">Sales Brochure (PDF)</option>
                  <option value="energy_certificate">Energy Certificate (BER / EPC)</option>
                  <option value="legal">Legal Title / Property Deed</option>
                  <option value="contract">Draft Agreement / Contract</option>
                  <option value="owner_document">Owner / Identification Document</option>
                  <option value="other">General Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Access Visibility</label>
                <select
                  value={docVisibility}
                  onChange={(e) => setDocVisibility(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="public">Public (Visible on Website for Clients)</option>
                  <option value="internal">Internal (Agents & Staff Only)</option>
                  <option value="admin_only">Admin Only (Confidential Legal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">File (PDF / DOC) *</label>
                <input
                  type="file"
                  required
                  accept="application/pdf,.doc,.docx"
                  onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={uploadDocMutation.isPending || !docFile}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                >
                  {uploadDocMutation.isPending ? 'Uploading Document...' : 'Upload PDF Document'}
                </button>
              </div>
            </form>
          </div>

          {/* Document List Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-900">
              Attached Documents ({documents.length})
            </div>
            {isDocsLoading ? (
              <div className="p-12 text-center text-gray-500">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No documents attached yet. Upload brochure or legal PDF above.</div>
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
                  {documents.map((doc: any) => (
                    <tr key={doc._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        <FileText className="inline h-4 w-4 mr-2 text-indigo-600" />
                        {doc.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 capitalize">{doc.type.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          doc.visibility === 'public'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : doc.visibility === 'internal'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {doc.visibility}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs font-mono">
                        {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
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
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
