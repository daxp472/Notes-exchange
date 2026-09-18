import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Coins, 
  Sparkles, 
  Upload, 
  Download, 
  Star, 
  Zap, 
  ShieldCheck, 
  Gift, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Lock,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

const RewardsStorePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'store' | 'earn' | 'history'>('store');
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

  const userCoins = user?.contributionScore || 50;

  const rewards = [
    {
      id: 'ai-summary',
      title: 'AI Exam Summarizer (5 Tokens)',
      description: 'Generate high-yield key formulas, bullet summaries, and flashcards for any 50-page lecture note.',
      cost: 15,
      category: 'AI Study Tools',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Popular'
    },
    {
      id: 'verified-badge',
      title: 'Verified Scholar Badge',
      description: 'Display an official verified campus checkmark badge on your profile and next to your uploaded notes.',
      cost: 50,
      category: 'Profile Perks',
      icon: ShieldCheck,
      color: 'from-purple-500 to-pink-600',
      badge: 'Prestigious'
    },
    {
      id: 'featured-boost',
      title: 'Campus Feed Priority Boost',
      description: 'Pin your uploaded study pack at the top of your university and department search feed for 7 days.',
      cost: 30,
      category: 'Distribution',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      badge: 'High Reach'
    },
    {
      id: 'pro-cheatsheets',
      title: 'Pro Solved Question Bank Access',
      description: 'Unlock 10 past exam solved master papers with detailed step-by-step marking scheme solutions.',
      cost: 25,
      category: 'Exam Content',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Exam Ready'
    }
  ];

  const earnWays = [
    {
      action: 'Upload a Study Module',
      reward: '+25 NoteCoins',
      description: 'Upload lecture notes, unit summaries, or lab manuals. Coins are credited upon instant scan.',
      icon: Upload,
      color: 'text-blue-600 bg-blue-50 border-blue-100'
    },
    {
      action: 'Classmate Downloads Your Note',
      reward: '+5 NoteCoins / download',
      description: 'Earn residual NoteCoins every time a student from your college or another university downloads your note.',
      icon: Download,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      action: 'Receive a 5-Star Peer Review',
      reward: '+10 NoteCoins',
      description: 'When peers rate your diagrams and handwriting 5 stars, you earn bonus reputation karma.',
      icon: Star,
      color: 'text-amber-600 bg-amber-50 border-amber-100'
    },
    {
      action: 'Daily Study & Search Streak',
      reward: '+5 NoteCoins / day',
      description: 'Log in and prepare for your semester daily to maintain a multiplier streak.',
      icon: Flame,
      color: 'text-rose-600 bg-rose-50 border-rose-100'
    }
  ];

  const handleRedeem = (reward: typeof rewards[0]) => {
    if (unlockedItems.includes(reward.id)) {
      addToast({
        type: 'info',
        message: `You have already redeemed "${reward.title}"!`
      });
      return;
    }

    if (userCoins < reward.cost) {
      addToast({
        type: 'error',
        title: 'Insufficient NoteCoins',
        message: `You need ${reward.cost} NoteCoins. Upload notes or invite peers to earn more!`
      });
      return;
    }

    setUnlockedItems(prev => [...prev, reward.id]);
    addToast({
      type: 'success',
      title: 'Reward Unlocked! 🎉',
      message: `Successfully redeemed "${reward.title}". Your perk is now active!`
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Hero Header & Wallet Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5" />
                <span>Campus Study Economy</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                NoteCoins & Rewards Hub
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                The student rewards program that pays you for sharing great lecture notes. Earn NoteCoins whenever peers study from your materials, and redeem for pro exam tools.
              </p>
            </div>

            {/* Live Balance Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[220px]">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Your Balance</span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 my-1 flex items-center justify-center space-x-2 font-mono">
                <span>{userCoins}</span>
                <span className="text-2xl">🪙</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Top 10% Contributor</span>
              </span>
              <button
                onClick={() => navigate('/upload')}
                className="mt-3 w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition active:scale-98"
              >
                + Earn More Coins
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              activeTab === 'store'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Redeem Rewards</span>
          </button>

          <button
            onClick={() => setActiveTab('earn')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              activeTab === 'earn'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>How to Earn</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Earnings Ledger</span>
          </button>
        </div>

        {/* TAB 1: Rewards Marketplace */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
            {rewards.map((r) => {
              const Icon = r.icon;
              const isUnlocked = unlockedItems.includes(r.id);

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          {r.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                          {r.badge}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center space-x-1 font-mono font-bold text-amber-600 text-base">
                      <span>{r.cost} NoteCoins</span>
                      <span>🪙</span>
                    </div>

                    <button
                      onClick={() => handleRedeem(r)}
                      disabled={isUnlocked}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${
                        isUnlocked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-98'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Active / Unlocked</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Redeem Perk</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: How to Earn */}
        {activeTab === 'earn' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earnWays.map((way, idx) => {
                const Icon = way.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-start space-x-4"
                  >
                    <div className={`p-3 rounded-2xl border ${way.color} shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{way.action}</h4>
                      </div>
                      <span className="inline-block text-xs font-extrabold text-amber-600 font-mono">
                        {way.reward}
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                        {way.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-600 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-600/20">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold">Have clean lecture notes from this term?</h3>
                <p className="text-xs text-blue-100">Upload your PDF or handwritten notes now to start collecting NoteCoins.</p>
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition shrink-0"
              >
                Upload & Earn +25 NoteCoins →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Earnings Ledger */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Activity & Rewards Log</h3>
            <div className="space-y-3">
              {[
                { title: 'Welcome Contributor Bonus', coins: '+50 🪙', date: 'Just now', type: 'credit' },
                { title: 'Uploaded: NumPy & Data Structures Guide', coins: '+25 🪙', date: 'Today', type: 'credit' },
                { title: 'Peer Download Bonus', coins: '+5 🪙', date: 'Yesterday', type: 'credit' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                      🪙
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{log.title}</div>
                      <div className="text-[11px] text-slate-400">{log.date}</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {log.coins}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RewardsStorePage;
