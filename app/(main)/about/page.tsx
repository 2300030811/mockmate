"use client";

import { m } from "framer-motion";
import { Github, Linkedin, Code2, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/providers/providers";

const team = [
  {
    name: "Bhima Mahesh Sai",
    role: "Full Stack Developer",
    description:
      "Passionate about building intelligent web applications and crafting seamless user experiences. Specializes in AI integrations and scalable backend systems.",
    image: "/mahesh_avatar.png",
    github: "https://github.com/2300030811",
    linkedin: "https://www.linkedin.com/in/mahesh-sai-bhima-038243286",
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "rgba(59,130,246,0.3)",
    skills: ["React", "Next.js", "Node.js", "AI/ML"],
  },
  {
    name: "Kondaveti Tejaswanth",
    role: "Full Stack Developer",
    description:
      "Dedicated to creating innovative solutions with cutting-edge technologies. Passionate about AI-driven products, cloud architecture, and delivering high-quality software.",
    image: "/tejaswanth_avatar.png",
    github: "https://github.com/ktejaswanth",
    linkedin: "https://www.linkedin.com/in/ktejaswanth/",
    gradient: "from-purple-500 to-pink-500",
    glowColor: "rgba(168,85,247,0.3)",
    skills: ["TypeScript", "Spring Boot", "Cloud", "DevOps"],
  },
];

export default function AboutPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen pt-32 pb-20 px-4 transition-colors duration-500 ${isDark ? "bg-gray-950 text-gray-300" : "bg-gray-50 text-gray-700"
        }`}
    >
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
            <Users size={18} className="text-blue-500" />
            <span className="text-sm font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Meet the Team
            </span>
          </div>

          <h1
            className={`text-5xl md:text-6xl font-black mb-6 leading-tight ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            The Minds Behind{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              MockMate
            </span>
          </h1>

          <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto leading-relaxed">
            Two developers united by a passion for AI and a mission to help
            everyone land their dream job.
          </p>
        </m.div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {team.map((member, index) => (
            <m.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative"
            >
              {/* Glow effect */}
              <div
                className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: member.glowColor }}
              />

              <div
                className={`relative rounded-3xl overflow-hidden border transition-all duration-300 ${isDark
                    ? "bg-gray-900 border-gray-800 group-hover:border-gray-600"
                    : "bg-white border-gray-200 group-hover:border-gray-300 shadow-lg"
                  }`}
              >
                {/* Top gradient bar */}
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${member.gradient}`}
                />

                {/* Card Content */}
                <div className="p-8">
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div
                        className={`absolute -inset-1 rounded-full bg-gradient-to-r ${member.gradient} opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-300`}
                      />
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-900">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="text-center mb-4">
                    <h2
                      className={`text-2xl font-black mb-1 ${isDark ? "text-white" : "text-gray-900"
                        }`}
                    >
                      {member.name}
                    </h2>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${member.gradient} text-white`}
                    >
                      <Code2 size={13} />
                      {member.role}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-center text-sm leading-relaxed opacity-70 mb-6">
                    {member.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-2 mb-7">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark
                            ? "bg-gray-800 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-4">
                    <Link
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} GitHub`}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${isDark
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                    >
                      <Github size={16} />
                      GitHub
                    </Link>

                    <Link
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} LinkedIn`}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r ${member.gradient} text-white hover:opacity-90 hover:scale-105`}
                    >
                      <Linkedin size={16} />
                      LinkedIn
                    </Link>
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`text-center p-10 rounded-3xl border ${isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200 shadow-md"
            }`}
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white w-6 h-6" />
            </div>
          </div>
          <h3
            className={`text-2xl font-black mb-3 ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            Built with ❤️ and AI
          </h3>
          <p className="opacity-60 max-w-md mx-auto mb-6 text-sm leading-relaxed">
            MockMate is crafted with passion, powered by cutting-edge AI, and
            designed to give every job seeker an unfair advantage.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold transition-all hover:opacity-90 hover:scale-105"
          >
            <Sparkles size={16} />
            Explore MockMate
          </Link>
        </m.div>
      </div>
    </div>
  );
}
