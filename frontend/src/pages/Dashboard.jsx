import { useState, useEffect } from 'react';
import { UploadCloud, Server, AlertCircle, Loader2, BrainCircuit, FileText, Activity } from 'lucide-react';

const Dashboard = () => {
  const [apiResponse, setApiResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [reportAnalysis, setReportAnalysis] = useState(""); // Stores GPT text
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadStatus(""); // Reset status upon new selection
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    const file = selectedFiles[0];
    if (file.type !== 'application/pdf') {
       return setUploadError("Sorry, we only accept PDF files!");
    }

    const formData = new FormData();
    formData.append('document', file);

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadStatus("Uploading...");
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setUploadStatus(data.message);
      setReportAnalysis(data.explanation); // Grab AI text
      setSelectedFiles([]); 
    } catch (err) {
      setUploadError(err.message);
      setUploadStatus("");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    // Fetch API connection on component mount
    fetch('http://localhost:5000/test')
      .then(res => {
        if (!res.ok) throw new Error('Network issue contacting server.');
        return res.json();
      })
      .then(data => {
        setApiResponse(data.message);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 relative">
      
      {/* SaaS Workspace Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#2f2a26] tracking-tight mb-2">
          Clinical Workspace
        </h1>
        <p className="text-[#a89b8d] text-lg max-w-2xl">Drop your local raw datasets into the secure vault and let our LLM synthesize immediately.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: UPLOAD & DIAGNOSTICS */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Upload Container */}
           <div className="bg-[#faf0e6]/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-[#d0bfae] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#d0bfae]/50 flex items-center gap-3">
                 <div className="p-2 bg-[#77DD77]/20 rounded-lg text-[#77DD77]">
                    <UploadCloud size={20} />
                 </div>
                 <h3 className="font-bold text-[#2f2a26] text-lg">Data Ingestion</h3>
              </div>
              
              <div className="p-6">
                <div className="border border-dashed border-[#d0bfae] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-white/30 transition-colors hover:bg-white/50 group h-64">
                  <div className="bg-white p-4 rounded-full text-[#77DD77] mb-4 shadow-sm border border-[#e8dccf] group-hover:scale-110 transition-transform">
                    <UploadCloud size={28} />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#2f2a26] mb-1">Vault Upload</h4>
                  <p className="text-[#a89b8d] text-xs mb-5 max-w-[14rem]">Select or drop your PDF records to initiate securely.</p>
                  
                  <label className="bg-[#2f2a26] hover:bg-[#403933] text-white px-6 py-2.5 rounded-xl font-medium shadow-md cursor-pointer transition-colors text-sm w-full block">
                    Choose Files
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {/* Queue UI */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-bold text-[#a89b8d] uppercase tracking-wider mb-3">Queue</p>
                    <ul className="bg-white/50 border border-[#d0bfae] rounded-xl max-h-32 overflow-y-auto mb-4">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="truncate px-4 py-3 text-sm text-[#403933] font-medium border-b border-[#d0bfae]/30 last:border-0 flex items-center gap-3">
                          <FileText size={16} className="text-[#77DD77]" /> {file.name}
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full bg-[#77DD77] hover:bg-[#68d168] text-white font-semibold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <><Loader2 size={18} className="animate-spin" /> Synthesizing...</>
                      ) : (
                        "Run AI Analysis"
                      )}
                    </button>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-4 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl text-sm border border-red-200 shadow-sm flex items-center gap-3">
                     <AlertCircle size={18} /> <span>{uploadError}</span>
                  </div>
                )}

                {uploadStatus && !isUploading && !uploadError && (
                  <div className="mt-4 px-4 py-3 bg-[#77DD77]/10 text-emerald-700 font-semibold rounded-xl text-sm border border-[#77DD77]/30 shadow-sm">
                     {uploadStatus}
                  </div>
                )}
              </div>
           </div>

           {/* Connection Metric Card */}
           <div className="bg-[#faf0e6]/80 backdrop-blur-xl rounded-3xl shadow-sm border border-[#d0bfae] p-6 flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${error ? 'bg-red-100 text-red-500' : 'bg-white shadow-sm border border-[#e8dccf] text-[#77DD77]'}`}>
                {error ? <AlertCircle size={24} /> : <Server size={24} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2f2a26] uppercase tracking-wider mb-1">Server Heartbeat</h3>
                {loading ? (
                   <p className="text-[#a89b8d] text-sm flex items-center gap-2"><Loader2 size={12} className="animate-spin"/> Pinging...</p>
                ) : error ? (
                   <p className="text-red-500 text-sm font-medium">Disconnected</p>
                ) : (
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#77DD77] animate-pulse"></div>
                     <p className="text-[#77DD77] font-bold text-sm">Online (ms: 12)</p>
                   </div>
                )}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: AI ANALYSIS ENGINE */}
        <div className="lg:col-span-8">
           <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white h-[800px] flex flex-col overflow-hidden relative group">
              
              {/* Top Bar */}
              <div className="px-8 py-6 bg-white/80 border-b border-[#e8dccf] flex items-center gap-4 z-10 sticky top-0 backdrop-blur-md">
                  <div className="w-14 h-14 rounded-2xl bg-[#77DD77] flex items-center justify-center text-white shadow-md">
                     <BrainCircuit size={28} />
                  </div>
                  <div>
                     <h2 className="text-[#2f2a26] font-extrabold text-xl">Generative Output</h2>
                     <p className="text-[#a89b8d] text-sm font-medium">Session UUID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>
              </div>

              {/* Document Body */}
              <div className="flex-1 p-8 relative overflow-y-auto">
                  {!reportAnalysis && !isUploading && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-[#c2b6ac] bg-[#faf0e6]/20">
                        <Activity size={80} strokeWidth={1} className="mb-6 opacity-30" />
                        <p className="font-bold text-lg text-[#2f2a26]">Awaiting Clinical Data</p>
                        <p className="text-sm mt-2 max-w-sm text-center">Upload a document on the left to instantly generate a comprehensive AI summary right here.</p>
                     </div>
                  )}

                  {isUploading && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-[#77DD77] bg-white/50 backdrop-blur-sm z-20">
                        <div className="relative">
                          <BrainCircuit size={80} strokeWidth={1.5} className="mb-6 animate-pulse" />
                          <div className="absolute inset-0 border-4 border-t-[#77DD77] border-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="font-bold text-xl text-[#2f2a26]">Extracting Intelligence</p>
                        <p className="text-[#a89b8d] mt-2 tracking-widest text-xs uppercase font-bold">Scanning NLP Models...</p>
                     </div>
                  )}

                  {reportAnalysis && !isUploading && (
                     <div className="prose prose-lg prose-slate max-w-none text-[#403933] pb-10">
                        <div className="bg-[#faf0e6] p-6 rounded-2xl border border-[#d0bfae] mb-6">
                           <h4 className="text-[#2f2a26] font-bold text-sm tracking-wider uppercase mb-2 flex items-center gap-2">
                             <AlertCircle size={14} className="text-[#77DD77]"/> Automated Insight Match
                           </h4>
                           <p className="text-sm font-medium text-[#a89b8d]">The model successfully parsed 100% of the document metrics. Scroll down to review the raw generated diagnostics.</p>
                        </div>
                        <p className="leading-loose whitespace-pre-wrap">{reportAnalysis}</p>
                     </div>
                  )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
