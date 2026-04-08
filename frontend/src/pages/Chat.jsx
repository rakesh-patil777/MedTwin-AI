import { Send } from 'lucide-react';

const Chat = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 h-[85vh] flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            MedTwin Assistant
          </h2>
          <p className="text-sm text-slate-500">Ask questions about your data</p>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex">
            <div className="bg-slate-100 text-slate-800 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[80%]">
              Hello. How can I assist you with your health records today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-medGreen-500 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%]">
              Extract the key symptoms from the latest uploaded document.
            </div>
          </div>
        </div>

        {/* Input Box Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-medGreen-500/50 focus:border-medGreen-500 text-slate-700"
            />
            <button className="bg-medGreen-500 hover:bg-medGreen-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center">
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Chat;
