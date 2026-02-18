import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  image: string;
  content: string;
  rating: number;
}

export default function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    // {
    //   name: "Sarah Johnson",
    //   role: "CEO",
    //   company: "TechStart Inc.",
    //   image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50",
    //   content: "James delivered an exceptional e-commerce platform that exceeded our expectations. The attention to detail and user experience is outstanding.",
    //   rating: 5,
    // },
    // {
    //   name: "Michael Chen",
    //   role: "Marketing Director",
    //   company: "Digital Agency",
    //   image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50",
    //   content: "The AI content generation tool James built for us has revolutionized our content marketing. Highly recommend his technical expertise.",
    //   rating: 5,
    // },
    // {
    //   name: "Emily Davis",
    //   role: "Brand Manager",
    //   company: "Creative Studio",
    //   image: "https://images.unsplash.com/photo-1494790108755-2616b45b2ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50",
    //   content: "James's video work is absolutely stunning. The brand commercial he created for us has significantly boosted our engagement rates.",
    //   rating: 5,
    // },
  ];

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--portfolio-secondary)' }}>
      <div className="container mx-auto px-8">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl minimal-heading mb-8 gradient-text"
          >
            {/* Testimonials */}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-lg body-text max-w-2xl mx-auto"
          >
            {/* What clients say about working with me. */}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="premium-card rounded-none p-8"
            >
              <div className="flex items-center mb-6">
                <div className="flex text-black/40 mr-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
                <span className="text-black/60 text-sm font-light">5.0</span>
              </div>
              <p className="body-text mb-8 text-sm leading-relaxed italic">{testimonial.content}</p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full mr-4 grayscale"
                />
                <div>
                  <h4 className="font-light text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-black/60 font-light">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
