import { Sparkles } from "lucide-react";
import * as m from "motion/react-m";

export function AvatarBadge() {
  return (
    <m.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-max p-3 rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-purple-500/30 shadow-2xl"
      style={{ transform: "translateZ(40px)" }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <Sparkles size={18} className="animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">
            Available for Hire
          </p>
          <p className="text-xs text-gray-400 font-medium">
            Open to Full-time & Freelance
          </p>
        </div>
      </div>
    </m.div>
  );
}
