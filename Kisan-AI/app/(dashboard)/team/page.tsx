"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import { Github, Linkedin } from "lucide-react";

type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Deep Raj",
    role: "Frontend Developer",
    bio: "UI/UX aur frontend development",
  },
  {
    name: "Divyansh Yadav",
    role: "Backend Developer",
    bio: "Server, APIs aur database management",
  },
  {
    name: "Manish Singh",
    role: "AI/ML Engineer",
    bio: "AI models aur machine learning integration",
  },
  {
    name: "Vivek Kumar",
    role: "UI/UX Designer",
    bio: "Design aur user experience",
  },
];

export default function TeamPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Hamaari Team 👨‍💻</h1>
          <p className="text-[#B8A99A] mt-1">Kisan AI banane wale log</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.name} className="rounded-xl bg-white/5 border border-white/10 p-5">
              <div className="w-[200px] h-[200px] max-w-full mx-auto rounded-lg bg-[#333] border border-[#555] text-[#B8A99A] text-center flex items-center justify-center whitespace-pre-line">
                📷 Photo
Coming Soon
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-white">{member.name}</h2>
                <p className="text-[#E86B2E] font-semibold mt-1">{member.role}</p>
                <p className="text-sm text-[#B8A99A] mt-2">{member.bio}</p>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#242424] border border-[#3B322A] text-[#F5F0E8] hover:border-[#5A4636]"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#242424] border border-[#3B322A] text-[#F5F0E8] hover:border-[#5A4636]"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
