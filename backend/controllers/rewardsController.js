import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const STORE_PERKS = [
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

// Helper to award points to any user safely
export const awardPoints = async (userId, amount, actionType, details = '') => {
  if (!userId || !amount) return;
  try {
    const { data: user } = await supabase
      .from('users')
      .select('contribution_score')
      .eq('id', userId)
      .single();

    const currentScore = user?.contribution_score || 0;
    const newScore = Math.max(0, currentScore + amount);

    await supabase
      .from('users')
      .update({ contribution_score: newScore, updated_at: new Date().toISOString() })
      .eq('id', userId);

    await supabase
      .from('user_activity')
      .insert([{
        user_id: userId,
        action_type: actionType,
        points_earned: amount,
        created_at: new Date().toISOString()
      }]);
  } catch (err) {
    console.warn(`[Rewards] Failed to award ${amount} points for ${actionType}:`, err.message);
  }
};

// GET /api/users/rewards/store
export const getRewardsStore = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, contribution_score, badges, settings')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const settings = user.settings || {};
  const unlockedPerks = settings.unlocked_perks || [];
  
  // Also include verified badge if user already has it in badges array
  if (Array.isArray(user.badges) && user.badges.includes('verified') && !unlockedPerks.includes('verified-badge')) {
    unlockedPerks.push('verified-badge');
  }

  // Fetch recent activity ledger
  let history = [];
  try {
    const { data: activities } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (activities) {
      history = activities.map(act => {
        let title = 'Community Activity';
        let points = act.points_earned || 0;

        if (act.action_type === 'upload') {
          title = 'Uploaded Study Note';
          points = points || 25;
        } else if (act.action_type === 'download') {
          title = 'Peer Downloaded Your Note';
          points = points || 5;
        } else if (act.action_type === 'rating') {
          title = 'Received 5-Star Review';
          points = points || 10;
        } else if (act.action_type === 'daily_claim') {
          title = 'Daily Study Streak Bonus';
          points = points || 15;
        } else if (act.action_type === 'redeem_perk') {
          title = 'Redeemed Store Perk';
        } else if (act.action_type === 'join_group') {
          title = 'Joined Campus Study Group';
          points = points || 20;
        } else if (act.action_type === 'comment') {
          title = 'Helpful Discussion Contribution';
          points = points || 5;
        }

        return {
          id: act.id,
          title,
          actionType: act.action_type,
          points: points >= 0 ? `+${points} 🪙` : `${points} 🪙`,
          isCredit: points >= 0,
          date: new Date(act.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
      });
    }
  } catch (err) {
    console.warn('[Rewards] Could not fetch activity history:', err.message);
  }

  // Calculate daily streak availability
  let canClaimDaily = true;
  let nextClaimHours = 0;
  if (settings.last_daily_claim) {
    const lastClaim = new Date(settings.last_daily_claim).getTime();
    const now = Date.now();
    const diffMs = now - lastClaim;
    const cooldownMs = 24 * 60 * 60 * 1000;
    if (diffMs < cooldownMs) {
      canClaimDaily = false;
      nextClaimHours = Math.ceil((cooldownMs - diffMs) / (1000 * 60 * 60));
    }
  }

  res.json({
    balance: user.contribution_score || 0,
    perks: STORE_PERKS,
    unlockedPerks,
    badges: user.badges || [],
    settings,
    canClaimDaily,
    nextClaimHours,
    history
  });
});

// POST /api/users/rewards/redeem
export const redeemPerk = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { perkId } = req.body;

  if (!perkId) {
    return res.status(400).json({ error: 'Perk ID is required' });
  }

  const perk = STORE_PERKS.find(p => p.id === perkId);
  if (!perk) {
    return res.status(404).json({ error: 'Invalid perk selected' });
  }

  // Fetch fresh user data from database
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  const currentBalance = user.contribution_score || 0;
  const userSettings = user.settings || {};
  const unlockedPerks = Array.isArray(userSettings.unlocked_perks) ? [...userSettings.unlocked_perks] : [];
  const badges = Array.isArray(user.badges) ? [...user.badges] : [];

  // Check if already permanently unlocked
  if (perk.type === 'permanent' && unlockedPerks.includes(perk.id)) {
    return res.status(400).json({ error: `You have already unlocked "${perk.title}". This perk is permanently active!` });
  }

  // Strict Balance Verification
  if (currentBalance < perk.cost) {
    return res.status(400).json({ 
      error: `Insufficient NoteCoins! You currently have ${currentBalance} 🪙, but "${perk.title}" costs ${perk.cost} 🪙. Upload notes to earn more!` 
    });
  }

  // Apply Coin Deduction
  const newBalance = currentBalance - perk.cost;

  // Apply perk features to user model
  if (!unlockedPerks.includes(perk.id)) {
    unlockedPerks.push(perk.id);
  }

  if (perk.id === 'verified-badge') {
    if (!badges.includes('verified')) {
      badges.push('verified');
    }
  } else if (perk.id === 'ai-summary') {
    userSettings.ai_tokens = (userSettings.ai_tokens || 0) + 5;
  } else if (perk.id === 'featured-boost') {
    userSettings.priority_boost_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    if (!badges.includes('priority_boost')) {
      badges.push('priority_boost');
    }
  } else if (perk.id === 'pro-cheatsheets') {
    userSettings.pro_question_bank = true;
  } else if (perk.id === 'custom-frame') {
    userSettings.profile_frame = 'gold';
  } else if (perk.id === 'ad-free') {
    userSettings.ad_free = true;
  }

  userSettings.unlocked_perks = unlockedPerks;

  // Persist updates to Supabase
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      contribution_score: newBalance,
      badges,
      settings: userSettings,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (updateError) {
    console.error('[Rewards] Failed to persist perk redemption:', updateError);
    return res.status(500).json({ error: 'Failed to process perk redemption in database' });
  }

  // Record ledger activity
  try {
    await supabase
      .from('user_activity')
      .insert([{
        user_id: userId,
        action_type: 'redeem_perk',
        points_earned: -perk.cost,
        created_at: new Date().toISOString()
      }]);
  } catch (logErr) {
    console.warn('[Rewards] Could not record activity ledger:', logErr.message);
  }

  res.json({
    message: `🎉 Successfully unlocked "${perk.title}"! -${perk.cost} NoteCoins deducted.`,
    newBalance,
    unlockedPerks,
    badges: updatedUser.badges || badges,
    user: {
      ...req.user,
      ...updatedUser,
      contributionScore: newBalance,
      contribution_score: newBalance,
      badges: updatedUser.badges || badges,
      settings: userSettings
    }
  });
});

// POST /api/users/rewards/claim-daily
export const claimDailyStreak = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const settings = user.settings || {};
  const now = Date.now();
  const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

  if (settings.last_daily_claim) {
    const lastClaim = new Date(settings.last_daily_claim).getTime();
    const diffMs = now - lastClaim;
    if (diffMs < cooldownMs) {
      const remainingHours = Math.ceil((cooldownMs - diffMs) / (1000 * 60 * 60));
      return res.status(400).json({ 
        error: `Daily streak bonus already claimed today! Next reward unlocks in ~${remainingHours} hours.` 
      });
    }
  }

  const DAILY_BONUS = 15;
  const newBalance = (user.contribution_score || 0) + DAILY_BONUS;
  settings.last_daily_claim = new Date().toISOString();

  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      contribution_score: newBalance,
      settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (updateError) {
    return res.status(500).json({ error: 'Failed to claim daily reward' });
  }

  try {
    await supabase
      .from('user_activity')
      .insert([{
        user_id: userId,
        action_type: 'daily_claim',
        points_earned: DAILY_BONUS,
        created_at: new Date().toISOString()
      }]);
  } catch (err) {
    console.warn('[Rewards] Could not record daily claim:', err.message);
  }

  res.json({
    message: `🔥 Streak Bonus Claimed! +${DAILY_BONUS} NoteCoins added to your balance.`,
    newBalance,
    canClaimDaily: false,
    nextClaimHours: 24,
    user: {
      ...req.user,
      ...updatedUser,
      contributionScore: newBalance,
      contribution_score: newBalance,
      settings
    }
  });
});
