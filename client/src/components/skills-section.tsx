import { motion } from "framer-motion";
import { Code, Server, Bot, Camera } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface SkillItem {
  name: string;
  level: number;
}

interface SkillCategory {
  icon: React.ElementType;
  title: string;
  skills: SkillItem[];
}

export default function SkillsSection() {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
  });

  const skillCategories: SkillCategory[] = [
    {
      icon: Code,
      title: "Frontend",
      skills: [
        { name: "React/Next.js", level: 95 },
        { name: "TypeScript", level: 90 },
        { name: "Vue.js", level: 85 },
      ],
    },
    {
      icon: Server,
      title: "Backend",
      skills: [
        { name: "Node.js", level: 92 },
        { name: "Python", level: 88 },
        { name: "PostgreSQL", level: 85 },
      ],
    },
    {
      icon: Bot,
      title: "AI Engineering",
      skills: [
        { name: "Machine Learning", level: 87 },
        { name: "TensorFlow", level: 82 },
        { name: "OpenAI API", level: 90 },
      ],
    },
    {
      icon: Camera,
      title: "Creative Media",
      skills: [
        { name: "Adobe Premiere", level: 93 },
        { name: "Photography", level: 89 },
        { name: "After Effects", level: 84 },
      ],
    },
  ];

  return (
    <section id="skills" className="section-spacing" ref={ref}>
      <div className="container mx-auto px-8">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl minimal-heading mb-8 gradient-text"
          >
            Expertise
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-lg body-text max-w-2xl mx-auto"
          >
            A comprehensive skill set covering modern web technologies, AI development, and creative media production.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="premium-card rounded-none p-8"
            >
              <div className="text-center mb-8">
                <category.icon 
                  size={32} 
                  className="mx-auto mb-6 text-black/80"
                />
                <h3 className="text-lg font-light mb-2 tracking-wide">{category.title}</h3>
              </div>
              <div className="space-y-6">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skill.name} className="skill-item">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-light text-black/80">{skill.name}</span>
                      <span className="text-sm font-light text-black/60">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-black/10 h-px">
                      <motion.div
                        className="skill-bar"
                        initial={{ width: 0 }}
                        animate={isIntersecting ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 2, delay: skillIndex * 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
