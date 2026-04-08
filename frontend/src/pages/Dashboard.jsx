import { UploadCloud } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
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
          <button className="bg-medGreen-500 hover:bg-medGreen-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            Select Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
