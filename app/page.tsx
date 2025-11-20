"use client";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import FeaturedTournaments from "@/components/FeaturedTournaments";
import SportsOffered from "@/components/SportsOffered";
import CommunityHighlights from "@/components/CommunityHighlights";

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      {/* Image-driven sections only */}
      <SportsOffered />
      <FeaturedTournaments />
      <CommunityHighlights />
    </div>
  );
}
