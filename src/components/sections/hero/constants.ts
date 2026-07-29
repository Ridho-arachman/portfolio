import { type MotionValue, type Variants } from "framer-motion";

export interface HeroContentProps {
  textY: MotionValue<number>;
  textOpacity: MotionValue<number>;
  textBlur: MotionValue<string>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  isMobile: boolean;
  containerVariants: Variants;
  itemVariants: Variants;
}

export interface HeroBackgroundProps {
  bgY: MotionValue<number>;
  bgScale: MotionValue<number>;
  gridY: MotionValue<number>;
  gridOpacity: MotionValue<number>;
}
