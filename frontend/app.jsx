import React, { useState, useEffect } from 'react';
import { MessageCircle, Wallet, TrendingUp, TrendingDown, DollarSign, BarChart3, Calculator, Bot, User, RefreshCw } from 'lucide-react';

const Web3DeFiChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  // Backend API base URL - IMPORTANT: Update this to your deployed backend URL for production
  // For local testing, keep it as 'http://localhost:8000/api'
  const API_BASE = 'http://localhost:8000/api';

  // Fetch market data from backend
  const fetchMarketData = async () => {
    try {
      const response = await fetch(`${API_BASE}/market`);
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Fallback for demo if backend is not running or accessible
      setMarketData({
        eth: { price: 3500, price_change_24h: 1.5 },
        lido: { price: 2.5, price_change_24h: 0.8, tvl: 15000000000, apy: 3.8 },
        aave: { price: 120, price_change_24h: -0.5, tvl: 10000000000, borrow_rate: 2.1 }
      });
      addBotMessage("Warning: Could not connect to backend for live market data. Displaying simulated data.", "warning");
    }
  };

  // Fetch wallet data from backend
  const fetchWalletData = async (address) => {
    try {
      const response = await fetch(`${API_BASE}/wallet/${address}`);
      const data = await response.json();
      setWalletData(data);
      return data;
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      addBotMessage("Warning: Could not connect to backend for live wallet data. Displaying simulated data.", "warning");
      // Fallback for demo if backend is not running or accessible
      return {
        total_value_usd: 15000,
        eth_balance: 2.5,
        eth_value_usd: 8750,
        lido_balance: 1000,
        lido_value_usd: 2500,
        aave_balance: 30,
        aave_value_usd: 3600
      };
    }
  };

  // Get investment analysis from backend
  const getInvestmentAnalysis = async (amount, token) => {
    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, token })
      });
      const data = await response.json();
      setAnalysisData(data);
      return data;
    } catch (error) {
      console.error('Error getting investment analysis:', error);
      addBotMessage("Warning: Could not connect to backend for investment analysis. Displaying simulated data.", "warning");
      // Fallback for demo if backend is not running or accessible
      return {
        ai_analysis: `Based on a simulated analysis for investing $${amount.toLocaleString()} in ${token.toUpperCase()}, the market sentiment is cautiously optimistic.`,
        projections: { '1month': amount * 1.02, '3months': amount * 1.05, '1year': amount * 1.15, '2years': amount * 1.30 },
        recommendation: `Consider a diversified approach.`,
        risk_score: { level: 'Medium', score: 0.5 },
        accuracy_factor: 0.95
      };
    }
  };

  // Compare investments
  const compareInvestments = async (amount) => {
    try {
      const response = await fetch(`${API_BASE}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      return await response.json();
    } catch (error) {
      console.error('Error comparing investments:', error);
      addBotMessage("Warning: Could not connect to backend for investment comparison. Displaying simulated data.", "warning");
      // Fallback for demo if backend is not running or accessible
      return {
        lido: {
          ai_analysis: `LIDO shows strong staking yields and growing TVL (simulated).`,
          projections: { '2years': amount * 1.25 }
        },
        aave: {
          ai_analysis: `AAVE offers robust lending/borrowing opportunities with established liquidity (simulated).`,
          projections: { '2years': amount * 1.20 }
        },
        recommendation: {
          diversification: `Diversifying between LIDO and AAVE can balance yield and lending exposure (simulated).`,
          preferred: 'LIDO'
        }
      };
    }
  };

  // Send chat query to backend
  const sendChatQuery = async (query) => {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          wallet_address: walletAddress
        })
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending chat query:', error);
      addBotMessage("Warning: Could not connect to backend for general chat queries. Providing a simple response.", "warning");
      return 'Sorry, I encountered an error processing your request. (This is a simulated response due to backend connectivity issues.)';
    }
  };

  // Simulate Web3 connection
  const connectWallet = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would connect to MetaMask or another Web3 provider
      setTimeout(async () => {
        const demoAddress = '0x742d35Cc6634C0532925a3b8D4C414764B1E8DD8'; // Example address
        setWalletConnected(true);
        setWalletAddress(demoAddress);

        // Fetch wallet data from backend (or simulate)
        const walletInfo = await fetchWalletData(demoAddress);
        setLoading(false);

        if (walletInfo) {
          addBotMessage(`🟢 Wallet connected successfully!

Address: ${demoAddress}
Total Portfolio Value: $${walletInfo.total_value_usd?.toLocaleString() || '0'}

Holdings:
• ETH: ${walletInfo.eth_balance?.toFixed(4) || '0'} ETH ($${walletInfo.eth_value_usd?.toLocaleString() || '0'})
• LIDO: ${walletInfo.lido_balance?.toFixed(4) || '0'} LDO ($${walletInfo.lido_value_usd?.toLocaleString() || '0'})
• AAVE: ${walletInfo.aave_balance?.toFixed(4) || '0'} AAVE ($${walletInfo.aave_value_usd?.toLocaleString() || '0'})

Connected to Ganache blockchain via your RPC endpoint!
You can now ask me about investments, analysis, and strategies.`);
        }
      }, 2000); // Simulate network delay
    } catch (error) {
      setLoading(false);
      addBotMessage('❌ Failed to connect wallet. Please try again.');
    }
  };

  const addBotMessage = (content, type = 'general') => {
    setMessages(prev => [...prev, { type: 'bot', content, messageType: type, timestamp: new Date() }]);
  };

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, { type: 'user', content, timestamp: new Date() }]);
  };

  const processUserQuery = async (query) => {
    const input = query.toLowerCase();

    // Investment analysis queries
    if (input.includes('invest') && (input.includes('lido') || input.includes('aave') || input.includes('$'))) {
      const amount = parseFloat(input.match(/(\d+\.?\d*)/)?.[0] || '0');
      let token = '';
      if (input.includes('lido')) token = 'lido';
      else if (input.includes('aave')) token = 'aave';
      else token = 'eth'; // Default if no specific token mentioned but amount is present

      if (amount > 0) {
        const analysis = await getInvestmentAnalysis(amount, token);
        if (analysis) {
          return `📊 AI-Enhanced Investment Analysis for $${amount.toLocaleString()} in ${token.toUpperCase()}

${analysis.ai_analysis}

💰 Projections:
• 1 Month: $${analysis.projections?.['1month']?.toLocaleString() || 'N/A'}
• 3 Months: $${analysis.projections?.['3months']?.toLocaleString() || 'N/A'}
• 1 Year: $${analysis.projections?.['1year']?.toLocaleString() || 'N/A'}
• 2 Years: $${analysis.projections?.['2years']?.toLocaleString() || 'N/A'}

🎯 Recommendation: ${analysis.recommendation}

⚠️ Risk Score: ${analysis.risk_score?.level || 'N/A'} (${(analysis.risk_score?.score * 100)?.toFixed(1) || 'N/A'}%)
🔍 Accuracy Factor: ${(analysis.accuracy_factor * 100)?.toFixed(0) || 'N/A'}%`;
        }
      }
    }

    // Compare investments
    if (input.includes('compare') || input.includes('vs')) {
      const amount = parseFloat(input.match(/(\d+\.?\d*)/)?.[0] || '1000'); // Default to $1000 for comparison
      const comparison = await compareInvestments(amount);

      if (comparison) {
        return `⚖️ AI-Enhanced Investment Comparison ($${amount.toLocaleString()})

🔷 LIDO Analysis:
${comparison.lido?.ai_analysis || 'Analysis unavailable'}

🟣 AAVE Analysis:
${comparison.aave?.ai_analysis || 'Analysis unavailable'}

📊 2-Year Projections:
• LIDO: $${comparison.lido?.projections?.['2years']?.toLocaleString() || 'N/A'}
• AAVE: $${comparison.aave?.projections?.['2years']?.toLocaleString() || 'N/A'}

🎯 Recommendation: ${comparison.recommendation?.diversification || 'Analysis unavailable'}
🏆 Preferred: ${comparison.recommendation?.preferred?.toUpperCase() || 'N/A'}`;
      }
    }

    // Market data queries
    if (input.includes('market') || input.includes('price') || input.includes('trends')) {
      if (marketData) {
        return `📈 Current Market Data

🔷 LIDO (LDO):
• Price: $${marketData.lido?.price?.toFixed(4) || 'N/A'}
• 24h Change: ${marketData.lido?.price_change_24h?.toFixed(2) || 'N/A'}%
• TVL: $${(marketData.lido?.tvl / 1000000000)?.toFixed(1) || 'N/A'}B
• APY: ${marketData.lido?.apy?.toFixed(2) || 'N/A'}%

🟣 AAVE:
• Price: $${marketData.aave?.price?.toFixed(2) || 'N/A'}
• 24h Change: ${marketData.aave?.price_change_24h?.toFixed(2) || 'N/A'}%
• TVL: $${(marketData.aave?.tvl / 1000000000)?.toFixed(1) || 'N/A'}B
• Borrow Rate: ${marketData.aave?.borrow_rate?.toFixed(2) || 'N/A'}%

⚡ ETH: $${marketData.eth?.price?.toFixed(0) || 'N/A'} (${marketData.eth?.price_change_24h?.toFixed(2) || 'N/A'}%)`;
      } else {
        return 'Fetching market data... please try again in a moment.';
      }
    }

    // Wallet queries
    if (input.includes('wallet') || input.includes('balance') || input.includes('portfolio')) {
      if (walletConnected && walletData) {
        return `💼 Portfolio Overview

📍 Address: ${walletAddress}
💰 Total Value: $${walletData.total_value_usd?.toLocaleString() || '0'}

Holdings:
• ETH: ${walletData.eth_balance?.toFixed(4) || '0'} ETH ($${walletData.eth_value_usd?.toLocaleString() || '0'})
• LIDO: ${walletData.lido_balance?.toFixed(4) || '0'} LDO ($${walletData.lido_value_usd?.toLocaleString() || '0'})
• AAVE: ${walletData.aave_balance?.toFixed(4) || '0'} AAVE ($${walletData.aave_value_usd?.toLocaleString() || '0'})

Connected to Ganache blockchain ✅`;
      } else {
        return 'Please connect your wallet first to view balance information. Type "Connect wallet" to proceed.';
      }
    }

    // Connect wallet query
    if (input.includes('connect wallet')) {
        if (!walletConnected) {
            connectWallet();
            return 'Connecting your wallet... please wait.';
        } else {
            return 'Your wallet is already connected!';
        }
    }

    // Default AI response
    return await sendChatQuery(query);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = input.trim();
    setInput('');
    addUserMessage(userMessage);
    setIsTyping(true);

    try {
      const response = await processUserQuery(userMessage);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(response);
      }, 1000); // Simulate bot response time
    } catch (error) {
      setIsTyping(false);
      addBotMessage('❌ Sorry, I encountered an error processing your request. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Initialize with welcome message and fetch market data on component mount
  useEffect(() => {
    addBotMessage(`🚀 Welcome to Web3 DeFi Investment Assistant!

I'm powered by AI and connected to the Ethereum blockchain (via Ganache). I can help you with:

💰 Investment Analysis (LIDO & AAVE)
📊 Market Data & Trends
🔍 Portfolio Management
⚖️ Risk Assessment
🎯 Personalized Recommendations

Try asking:
• "Connect wallet"
• "Invest $10,000 in LIDO"
• "Compare LIDO vs AAVE"
• "Show market data"
• "Analyze my portfolio"

Connect your wallet to get started!`);

    fetchMarketData();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white font-inter antialiased">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-6 py-4 rounded-b-xl shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Web3 DeFi Assistant</h1>
              <p className="text-sm text-gray-300">AI-Powered Investment Analysis</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {marketData && (
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 px-3 py-1 bg-white/5 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>ETH: ${marketData.eth?.price?.toFixed(0) || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 bg-white/5 rounded-full">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <span>LDO: ${marketData.lido?.price?.toFixed(3) || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 bg-white/5 rounded-full">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>AAVE: ${marketData.aave?.price?.toFixed(0) || 'N/A'}</span>
                </div>
              </div>
            )}

            <button
              onClick={connectWallet}
              disabled={loading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md
                ${walletConnected
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                } ${loading ? 'cursor-not-allowed' : ''}`
              }
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              <span>{walletConnected ? 'Connected' : 'Connect Wallet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 h-[70vh] flex flex-col shadow-xl">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold">AI Investment Assistant</h2>
                    <p className="text-xs text-gray-400">Powered by Llama3-70b & Web3</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                          : 'bg-gray-800/40 text-gray-100 border border-gray-700/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          message.type === 'user'
                            ? 'bg-blue-500'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-3 h-3 text-white" />
                          ) : (
                            <Bot className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                            {message.content}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800/40 border border-gray-700/30 rounded-2xl px-4 py-3 shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-white/10">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about investments, market data, or portfolio analysis..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={input.trim() === '' || isTyping}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Info */}
            {walletConnected && walletData && (
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-blue-300">
                  <Wallet className="w-5 h-5 mr-2 text-blue-400" />
                  Portfolio Overview
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-gray-300">Total Value</span>
                    <span className="font-bold text-green-400 text-lg">
                      ${walletData.total_value_usd?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-300">
                        <img src="https://placehold.co/16x16/000000/FFFFFF?text=E" className="rounded-full mr-2" alt="ETH icon" /> ETH
                      </span>
                      <span className="font-medium">{walletData.eth_balance?.toFixed(4) || '0'} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-300">
                        <img src="https://placehold.co/16x16/000000/FFFFFF?text=L" className="rounded-full mr-2" alt="LIDO icon" /> LIDO
                      </span>
                      <span className="font-medium">{walletData.lido_balance?.toFixed(4) || '0'} LDO</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-gray-300">
                        <img src="https://placehold.co/16x16/000000/FFFFFF?text=A" className="rounded-full mr-2" alt="AAVE icon" /> AAVE
                      </span>
                      <span className="font-medium">{walletData.aave_balance?.toFixed(4) || '0'} AAVE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-xl">
              <h3 className="font-semibold text-lg mb-4 flex items-center text-purple-300">
                <Calculator className="w-5 h-5 mr-2 text-purple-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setInput('Show market data')}
                  className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>Market Data</span>
                </button>
                <button
                  onClick={() => setInput('Invest $5000 in LIDO')}
                  className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span>Analyze Investment</span>
                </button>
                <button
                  onClick={() => setInput('Compare LIDO vs AAVE')}
                  className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span>Compare Tokens</span>
                </button>
                <button
                  onClick={() => setInput('Show wallet balance')}
                  className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span>Portfolio Overview</span>
                </button>
              </div>
            </div>

            {/* Market Overview */}
            {marketData && (
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="font-semibold text-lg mb-4 flex items-center text-green-300">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Live Market Overview
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="flex items-center text-gray-300">
                      <img src="https://placehold.co/16x16/000000/FFFFFF?text=E" className="rounded-full mr-2" alt="ETH icon" /> ETH
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${marketData.eth?.price?.toFixed(0) || 'N/A'}</div>
                      <div className={`text-xs ${
                        (marketData.eth?.price_change_24h || 0) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {marketData.eth?.price_change_24h?.toFixed(2) || '0'}% (24h)
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="flex items-center text-gray-300">
                      <img src="https://placehold.co/16x16/000000/FFFFFF?text=L" className="rounded-full mr-2" alt="LIDO icon" /> LDO
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${marketData.lido?.price?.toFixed(4) || 'N/A'}</div>
                      <div className={`text-xs ${
                        (marketData.lido?.price_change_24h || 0) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {marketData.lido?.price_change_24h?.toFixed(2) || '0'}% (24h)
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-gray-300">
                      <img src="https://placehold.co/16x16/000000/FFFFFF?text=A" className="rounded-full mr-2" alt="AAVE icon" /> AAVE
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${marketData.aave?.price?.toFixed(0) || 'N/A'}</div>
                      <div className={`text-xs ${
                        (marketData.aave?.price_change_24h || 0) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {marketData.aave?.price_change_24h?.toFixed(2) || '0'}% (24h)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        body {
          font-family: "Inter", sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Web3DeFiChatbot;
