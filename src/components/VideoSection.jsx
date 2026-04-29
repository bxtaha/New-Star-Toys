"use client";

import { motion } from "framer-motion";
import SmartImage from "@/components/SmartImage";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

const VideoSection = ({ eyebrow, title, description, src, poster, className }) => {
  const posterUrl = poster && typeof poster === "object" && "src" in poster ? poster.src : poster;
  const hasVideo = Boolean(src);

  return (
    <section className={cn("section-padding", className)}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          {eyebrow && <span className="text-sm font-semibold uppercase tracking-widest text-accent">{eyebrow}</span>}
          <h2 className="mt-3 text-3xl font-heading font-bold text-foreground md:text-4xl">{title}</h2>
          {description && <p className="mt-4 text-muted-foreground">{description}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          {hasVideo ? (
            <video
              className="h-full w-full"
              src={src}
              controls
              preload="metadata"
              poster={posterUrl}
            />
          ) : poster ? (
            <div className="relative aspect-video">
              <SmartImage src={poster} alt={title} fill sizes="100vw" className="object-cover" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-xl ring-1 ring-border md:h-24 md:w-24">
                  <Play className="h-8 w-8 translate-x-0.5 md:h-10 md:w-10" />
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
