// lib/services/achievements.ts

export interface Achievement {
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const ACHIEVEMENTS_KEY = 'app_achievements';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    name: "Superland Discoverer",
    description: "Enter ExoVis for the first time",
    unlocked: false
  },
  {
    name: "Master of Atmospheres",
    description: "Create your first planet in ExoCreator",
    unlocked: false
  },
  {
    name: "ExoQuest Master",
    description: "Win ExoQuest by getting 6 or more correct answers",
    unlocked: false
  }
];

export const achievementsService = {
  initializeAchievements() {
    localStorage.clear();
    if (typeof window !== 'undefined') {
      const existingAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (!existingAchievements) {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(INITIAL_ACHIEVEMENTS));
      }
    }
  },

  getAllAchievements(): Achievement[] {
    if (typeof window !== 'undefined') {
      const achievements = localStorage.getItem(ACHIEVEMENTS_KEY);
      return achievements ? JSON.parse(achievements) : INITIAL_ACHIEVEMENTS;
    }
    return INITIAL_ACHIEVEMENTS;
  },

  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(achievement => achievement.unlocked);
  },

  unlockAchievement(name: string): Achievement | null {
    if (typeof window !== 'undefined') {
      const achievements = this.getAllAchievements();
      const achievementIndex = achievements.findIndex(a => a.name === name);
      
      if (achievementIndex !== -1 && !achievements[achievementIndex].unlocked) {
        achievements[achievementIndex].unlocked = true;
        achievements[achievementIndex].unlockedAt = new Date().toISOString();
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
        return achievements[achievementIndex];
      }
    }
    return null;
  },

  resetAchievements() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(INITIAL_ACHIEVEMENTS));
    }
  }
}