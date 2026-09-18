import React, { useState, useEffect } from 'react';
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
  Flame, 
  Clock, 
  BookOpen,
  Loader2,
  RefreshCw,
  Layers,
  Sparkle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { rewardsAPI } from '../services/api';

interface StorePerk {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: string;
  badge: string;
  type: string;
}

interface LedgerItem {
  id: string;
  title: string;
  actionType: string;
  points: string;
  isCredit: boolean;
  date: string;
}

const RewardsStorePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'store' | 'earn' | 'history'>('store');
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [claimingDaily, setClaimingDaily] = useState(false);
  
  const [liveBalance, setLiveBalance] = useState<number>(user?.contributionScore || 0);
  const [unlockedPerks, setUnlockedPerks] = useState<string[]>([]);
  const [canClaimDaily, setCanClaimDaily] = useState<boolean>(true);
  const [nextClaimHours, setNextClaimHours] = useState<number>(0);
  const [history, setHistory] = useState<LedgerItem[]>([]);

  const defaultRewards: StorePerk[] = [
    {
      id: 'ai-summary',
      title: 'AI Exam Summarizer (5 Tokens)',
      description: 'Generate high-yield key formulas, bullet summaries, and flashcards for any 50-page lecture note.',
      cost: 15,
      category: 'AI Study Tools',
      badge: 'Popular',
      type: 'consumable'
    },
    {
      id: 'verified-badge',
      title: 'Verified Scholar Badge',
      description: 'Display an official verified campus checkmark badge on your profile and next to your uploaded notes.',
      cost: 50,
      category: 'Profile Perks',
      badge: 'Prestigious',
      type: 'permanent'
    },
    {
      id: 'featured-boost',
      title: 'Campus Feed Priority Boost',
      description: 'Pin your uploaded study pack at the top of your university and department search feed for 7 days.',
      cost: 30,
      category: 'Distribution',
      badge: 'High Reach',
      type: 'duration'
    },
    {
      id: 'pro-cheatsheets',
      title: 'Pro Solved Question Bank Access',
      description: 'Unlock past exam solved master papers with detailed step-by-step marking scheme solutions.',
      cost: 25,
      category: 'Exam Content',
      badge: 'Exam Ready',
      type: 'permanent'
    },
    {
      id: 'custom-frame',
      title: 'Gold Contributor Profile Frame',
      description: 'Equip an exclusive animated golden halo aura avatar frame across your profile and group chats.',
      cost: 20,
      category: 'Profile Perks',
      badge: 'Exclusive',
      type: 'permanent'
    },
    {
      id: 'ad-free',
      title: 'Distraction-Free Dark Study Mode',
      description: 'Permanently remove all community promotions and access ultra-clean focus reading layout.',
      cost: 10,
      category: 'Experience',
      badge: 'Focus',
      type: 'permanent'
    }
  ];

  const [perks, setPerks] = useState<StorePerk[]>(defaultRewards);

  const earnWays = [
    {
      action: 'Upload a Study Module',
      reward: '+25 NoteCoins',
      description: 'Upload lecture notes, unit summaries, or lab manuals. Coins are credited instantly upon upload.',
      icon: Upload,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      action: 'Classmate Downloads Your Note',
      reward: '+5 NoteCoins / download',
      description: 'Earn residual NoteCoins every time a student from your college or another university downloads your note.',
      icon: Download,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      action: 'Receive a 5-Star Peer Review',
      reward: '+20 NoteCoins',
      description: 'When peers rate your diagrams and handwriting 5 stars, you earn bonus reputation karma.',
      icon: Star,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    {
      action: 'Join a Campus Study Group',
      reward: '+20 NoteCoins',
      description: 'Participate in active semester study groups and exchange resources with peers.',
      icon: Layers,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    },
    {
      action: 'Leave a Helpful Discussion Comment',
      reward: '+5 NoteCoins',
      description: 'Answer questions, clarify doubts, and contribute constructively in note comment threads.',
      icon: Sparkles,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      action: 'Daily Study Streak',
      reward: '+15 NoteCoins / day',
      description: 'Claim your daily attendance bonus once every 24 hours to fuel your study tools.',
      icon: Flame,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    }
  ];

  const fetchStore = async () => {
    try {
      const data = await rewardsAPI.getStore();
      if (data) {
        if (typeof data.balance === 'number') {
          setLiveBalance(data.balance);
        }
        if (Array.isArray(data.perks) && data.perks.length > 0) {
          setPerks(data.perks);
        }
        if (Array.isArray(data.unlockedPerks)) {
          setUnlockedPerks(data.unlockedPerks);
        }
        if (data.canClaimDaily !== undefined) {
          setCanClaimDaily(Boolean(data.canClaimDaily));
          setNextClaimHours(data.nextClaimHours || 0);
        }
        if (Array.isArray(data.history)) {
          setHistory(data.history);
        }
      }
    } catch (err) {
      console.warn('Could not load live rewards store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const handleRedeem = async (reward: StorePerk) => {
    if (reward.type === 'permanent' && unlockedPerks.includes(reward.id)) {
      addToast({
        type: 'info',
        title: 'Already Unlocked',
        message: `You already own "${reward.title}". This perk is active on your account.`
      });
      return;
    }

    if (liveBalance < reward.cost) {
      addToast({
        type: 'error',
        title: 'Insufficient NoteCoins',
        message: `You need ${reward.cost} NoteCoins. You have ${liveBalance} 🪙. Upload notes to earn more!`
      });
      return;
    }

    setRedeemingId(reward.id);
    try {
      const res = await rewardsAPI.redeemPerk(reward.id);
      
      const newBal = typeof res.newBalance === 'number' ? res.newBalance : (liveBalance - reward.cost);
      setLiveBalance(newBal);
      
      if (Array.isArray(res.unlockedPerks)) {
        setUnlockedPerks(res.unlockedPerks);
      } else {
        setUnlockedPerks(prev => [...prev, reward.id]);
      }

      // Sync user profile state in AuthContext
      await updateProfile({
        contributionScore: newBal,
        contribution_score: newBal,
        badges: res.badges || user?.badges || [],
        settings: res.user?.settings || user?.settings
      } as any);

      addToast({
        type: 'success',
        title: 'Perk Unlocked! 🎉',
        message: res.message || `Successfully redeemed "${reward.title}". -${reward.cost} NoteCoins.`
      });

      // Refresh store & transaction history
      fetchStore();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Redemption Failed',
        message: err.response?.data?.error || err.message || 'Could not process redemption'
      });
    } finally {
      setRedeemingId(null);
    }
  };

  const handleClaimDaily = async () => {
    if (!canClaimDaily) {
      addToast({
        type: 'info',
        title: 'Already Claimed',
        message: `Daily reward is on cooldown. Available again in ~${nextClaimHours} hours.`
      });
      return;
    }

    setClaimingDaily(true);
    try {
      const res = await rewardsAPI.claimDaily();
      const newBal = typeof res.newBalance === 'number' ? res.newBalance : (liveBalance + 15);
      setLiveBalance(newBal);
      setCanClaimDaily(false);
      setNextClaimHours(24);

      await updateProfile({
        contributionScore: newBal,
        contribution_score: newBal,
      } as any);

      addToast({
        type: 'success',
        title: 'Daily Streak Bonus! 🔥',
        message: res.message || '+15 NoteCoins added to your balance.'
      });

      fetchStore();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Claim Failed',
        message: err.response?.data?.error || err.message || 'Could not claim daily bonus'
      });
    } finally {
      setClaimingDaily(false);
    }
  };

  const getPerkIcon = (id: string) => {
    switch (id) {
      case 'ai-summary': return Sparkles;
      case 'verified-badge': return ShieldCheck;
      case 'featured-boost': return Zap;
      case 'pro-cheatsheets': return BookOpen;
      case 'custom-frame': return Sparkle;
      case 'ad-free': return Award;
      default: return Gift;
    }
  };

  const getPerkColor = (id: string) => {
    switch (id) {
      case 'ai-summary': return 'from-blue-500 to-indigo-600';
      case 'verified-badge': return 'from-purple-500 to-pink-600';
      case 'featured-boost': return 'from-amber-500 to-orange-600';
      case 'pro-cheatsheets': return 'from-emerald-500 to-teal-600';
      case 'custom-frame': return 'from-yellow-400 to-amber-600';
      case 'ad-free': return 'from-cyan-500 to-blue-600';
      default: return 'from-slate-700 to-slate-900';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Hero Header & Live Wallet Bento Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/60 dark:to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800/80">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5" />
                <span>NoteCoins Academic Economy</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Rewards & NoteCoins Hub
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Earn verified NoteCoins by sharing quality notes, receiving 5-star peer reviews, and daily study streaks. Spend coins on AI exam summaries, verified scholar badges, and question banks.
              </p>
            </div>

            {/* Live Balance Card */}
            <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-white/20 dark:border-slate-700/60 text-center shrink-0 min-w-[240px]">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Your Live Balance</span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 my-1.5 flex items-center justify-center space-x-2 font-mono">
                <span>{liveBalance}</span>
                <span className="text-2xl">🪙</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center space-x-1 mb-3">
                <TrendingUp className="w-3 h-3" />
                <span>Verified Campus Balance</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/upload')}
                  className="py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition active:scale-98"
                >
                  + Upload & Earn
                </button>
                <button
                  onClick={handleClaimDaily}
                  disabled={!canClaimDaily || claimingDaily}
                  className={`py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center space-x-1 ${
                    canClaimDaily
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-98 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {claimingDaily ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : canClaimDaily ? (
                    <span>🔥 Daily +15</span>
                  ) : (
                    <span>⏳ {nextClaimHours}h</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'store'
                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Redeem Store Perks ({perks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('earn')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'earn'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>How to Earn Coins</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Earnings & Spend Ledger</span>
          </button>
        </div>

        {/* TAB 1: Rewards Marketplace */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {perks.map((r) => {
              const Icon = getPerkIcon(r.id);
              const colorGradient = getPerkColor(r.id);
              const isUnlocked = unlockedPerks.includes(r.id);
              const isRedeeming = redeemingId === r.id;
              const hasEnoughCoins = liveBalance >= r.cost;

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorGradient} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                          {r.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-bold">
                          {r.badge}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{r.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{r.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-1.5 font-mono font-black text-amber-600 dark:text-amber-400 text-base">
                      <span>{r.cost} NoteCoins</span>
                      <span>🪙</span>
                    </div>

                    <button
                      onClick={() => handleRedeem(r)}
                      disabled={isUnlocked || isRedeeming || (!hasEnoughCoins && !isUnlocked)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${
                        isUnlocked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                          : isRedeeming
                          ? 'bg-slate-800 text-white cursor-wait'
                          : !hasEnoughCoins
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                          : 'bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white shadow-sm active:scale-98'
                      }`}
                    >
                      {isRedeeming ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Deducting...</span>
                        </>
                      ) : isUnlocked ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Active Perk</span>
                        </>
                      ) : !hasEnoughCoins ? (
                        <span>Need {r.cost - liveBalance} 🪙</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Redeem (-{r.cost}🪙)</span>
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
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnWays.map((way, idx) => {
                const Icon = way.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-4"
                  >
                    <div className={`p-3 rounded-2xl border ${way.color} shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{way.action}</h4>
                      <span className="inline-block text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                        {way.reward}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
                        {way.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-600/20">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold">Have clean lecture notes or past papers?</h3>
                <p className="text-xs text-blue-100">Upload your PDF or notes now to instantly receive +25 NoteCoins per module.</p>
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition shrink-0 active:scale-98"
              >
                Upload & Earn +25 NoteCoins →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Earnings Ledger */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                NoteCoins Transactions & Activity Ledger
              </h3>
              <button
                onClick={fetchStore}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No transactions recorded yet</p>
                <p className="text-xs text-slate-400">Upload notes, participate in study groups, or claim your daily streak to see history here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        log.isCredit 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      }`}>
                        {log.isCredit ? '🪙' : '🎁'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{log.title}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{log.date}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg border ${
                      log.isCredit
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                    }`}>
                      {log.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default RewardsStorePage;
