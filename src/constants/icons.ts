import type { Component } from 'vue'
import {
  Apple, BookMarked, BookOpen, Bike, Brain, Briefcase, Calendar, CircleCheck, Code, Coffee, Droplets, Dumbbell,
  Flame, Footprints, Heart, HeartPulse, Languages, Leaf, Lightbulb, ListChecks, Moon, Music, Pencil, Rocket,
  Shapes, Sprout, Star, Sun, Target, Timer, Trophy, Waves, Wallet,
} from '@lucide/vue'

/** Ícones Lucide disponíveis para metas, hábitos e categorias (mapa explícito mantém o tree-shaking). */
export const ICONS: Record<string, Component> = {
  Apple, BookMarked, BookOpen, Bike, Brain, Briefcase, Calendar, CircleCheck, Code, Coffee, Droplets, Dumbbell,
  Flame, Footprints, Heart, HeartPulse, Languages, Leaf, Lightbulb, ListChecks, Moon, Music, Pencil, Rocket,
  Shapes, Sprout, Star, Sun, Target, Timer, Trophy, Waves, Wallet,
}
export const ICON_NAMES = Object.keys(ICONS)
export const iconFor = (name: string): Component => ICONS[name] ?? Target
