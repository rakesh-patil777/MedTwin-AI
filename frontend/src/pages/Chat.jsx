import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am MedTwin AI, your intelligent medical analytics assistant. How can I help you understand your health data today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => { 
    if (!localStorage.getItem('medtwin_session')) {
      window.location.href = '/login';
    }
    scrollToBottom(); 
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const sessionId = localStorage.getItem('medtwin_session');
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim(), sessionId: sessionId }) 
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error tracking request');
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf0e6] flex flex-col pt-20 px-4 pb-8">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-[#faf0e6] border border-[#d0bfae] rounded-2xl shadow-md overflow-hidden">
        
        {/* Header UI */}
        <div className="bg-[#77DD77]/20 px-6 py-4 border-b border-[#77DD77]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#77DD77] text-white rounded-lg shadow-sm">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">MedTwin Consult</h2>
              <p className="text-xs text-slate-500">Medical AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Messaging Interface */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#faf0e6]/50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#77DD77] flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              
              <div className={`px-5 py-3.5 max-w-[75%] rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-[#77DD77] text-white rounded-tr-sm shadow-sm' 
                : 'bg-[#faf0e6] border border-[#d0bfae] text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-slate-500" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 justify-start">
               <div className="w-8 h-8 rounded-full bg-[#77DD77] flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot size={16} className="text-white" />
               </div>
               <div className="bg-[#faf0e6] border border-[#d0bfae] rounded-2xl px-5 py-4 rounded-tl-sm shadow-sm flex items-center gap-2">
                 <p className="text-slate-400 text-sm font-medium italic">Generating response...</p>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-[#faf0e6] border-t border-[#d0bfae]">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Message MedTwin AI..."
              className="w-full bg-[#faf0e6] border border-[#d0bfae] text-slate-800 text-[15px] rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#77DD77] focus:border-transparent resize-none shadow-sm"
              rows={1}
              style={{ minHeight: '52px', maxHeight: '150px' }}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 bg-[#77DD77] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ marginBottom: '2px' }}
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-3 pb-1">
             <p className="text-[11px] text-slate-400 font-medium pb-1">MedTwin AI can make mistakes. Always verify important clinical information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
