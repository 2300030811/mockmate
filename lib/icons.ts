import { 
  User, 
  Ghost, 
  Zap, 
  Sparkles, 
  Rocket, 
  Crown, 
  Cat, 
  Dog, 
  Pizza, 
  Gamepad2,
  LucideIcon
} from "lucide-react";

export const AVATAR_ICONS = [
  { id: "User", icon: User },
  { id: "Ghost", icon: Ghost },
  { id: "Zap", icon: Zap },
  { id: "Sparkles", icon: Sparkles },
  { id: "Rocket", icon: Rocket },
  { id: "Crown", icon: Crown },
  { id: "Cat", icon: Cat },
  { id: "Dog", icon: Dog },
  { id: "Pizza", icon: Pizza },
  { id: "Gamepad2", icon: Gamepad2 },
] as const;

export type AvatarIconId = typeof AVATAR_ICONS[number]["id"];

export const AVATAR_ICONS_MAP: Record<string, LucideIcon> = {
  User,
  Ghost,
  Zap,
  Sparkles,
  Rocket,
  Crown,
  Cat,
  Dog,
  Pizza,
  Gamepad2,
};

export const getAvatarIcon = (id: string | null | undefined): LucideIcon => {
  return (id && AVATAR_ICONS_MAP[id]) || User;
};
