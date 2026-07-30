import { type MotionValue, type Variants } from "framer-motion";
export interface AboutHeroBackgroundProps {
  bgY1: MotionValue<number>;
  bgY2: MotionValue<number>;
  bgY3: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

export interface AboutHeroContentProps {
  textY: MotionValue<number>;
  textOpacity: MotionValue<number>;
  textScale: MotionValue<number>;
  containerVariants: Variants;
  itemVariants: Variants;
}

export interface FloatingTechIconProps {
  icon: React.ComponentType<{ className?: string }>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  scrollY: MotionValue<number>;
  intensity?: number;
  floatDuration?: number;
  scrollIntensity?: number;
  className?: string;
}
