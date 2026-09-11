export interface AboutHeroBackgroundProps {
  bgY1: number;
  bgY2: number;
  bgY3: number;
  mouseX: number;
  mouseY: number;
}

export interface AboutHeroContentProps {
  scrollYProgress: number;
}

export interface FloatingTechIconProps {
  icon: React.ComponentType<{ className?: string }>;
  intensity?: number;
  floatDuration?: number;
  scrollIntensity?: number;
  className?: string;
}