import { useState, useEffect } from 'react';
import { UploadCloud, Server, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [apiResponse, setApiResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [reportAnalysis, setReportAnalysis] = useState(""); // Stores GPT Output

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadStatus(""); // Reset status upon new selection
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    const file = selectedFiles[0];
    if (file.type !== 'application/pdf') {
       return alert("Sorry, we only accept PDF files!");
    }

    const formData = new FormData();
    formData.append('document', file);

    try {
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
      setUploadStatus("Error: " + err.message);
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
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-8">
          Dashboard
        </h1>
        
        {/* Upload Area / Placeholder */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 transition-colors hover:bg-slate-100">
          <div className="bg-medGreen-100 p-4 rounded-full text-medGreen-600 mb-4">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            Upload Patient Data
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md">
            Drag and drop medical files, CSVs, or imagery here. Our AI will automatically process and structure the documents.
          </p>
          <label className="bg-medGreen-500 hover:bg-medGreen-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer inline-block mt-2">
            Select Files
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>

          {/* Display chosen files conditionally */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 w-full max-w-xs text-left">
              <p className="text-sm font-semibold text-slate-700 mb-2">Selected Files:</p>
              <ul className="text-sm text-slate-600 bg-white border border-slate-100 p-3 rounded-lg max-h-32 overflow-y-auto mb-4">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="truncate py-1 break-all border-b border-slate-50 last:border-0">
                    📄 {file.name}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={handleUpload}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg shadow-md transition-all active:scale-95"
              >
                Upload to AI Backend
              </button>
            </div>
          )}

          {/* Inline Upload Status Notification */}
          {uploadStatus && (
            <div className="mt-4 px-4 py-2 bg-medGreen-100 text-medGreen-600 font-semibold rounded-lg text-sm border border-medGreen-500/20 shadow-sm animate-pulse">
               {uploadStatus}
            </div>
          )}

          {/* AI Analysis Block */}
          {reportAnalysis && (
            <div className="mt-8 text-left w-full">
              <h3 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2">AI Analysis</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {reportAnalysis}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backend Connection Verification Block */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4">
        <div className={`p-3 rounded-full ${error ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
          {error ? <AlertCircle size={24} /> : <Server size={24} />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700">API Connection Status</h3>
          
          {loading ? (
             <p className="text-slate-500 mt-1">Connecting to backend /test route...</p>
          ) : error ? (
             <p className="text-red-500 mt-1 font-medium">Failed to connect: {error}</p>
          ) : (
             <p className="text-medGreen-600 mt-1 font-medium bg-medGreen-50 px-3 py-1 rounded-md inline-block">
               {apiResponse}
             </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
