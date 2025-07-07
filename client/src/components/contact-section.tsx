import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Instagram } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const { toast } = useToast();
  
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    contactMutation.mutate(data);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "alex.chen@example.com",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (555) 123-4567",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "San Francisco, CA",
    },
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/rawscript", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/james-mwaura-8ba2a5293/", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/raw.script/", label: "Instagram" },
  ];

  return (
    <section id="contact" className="section-spacing">
      <div className="container mx-auto px-8">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl minimal-heading mb-8 gradient-text"
          >
            Contact
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-lg body-text max-w-2xl mx-auto"
          >
            Ready to bring your project to life? Let's discuss how we can work together.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            {contactInfo.map((info, index) => (
              <div key={index} className="flex items-center space-x-6">
                <div className="w-px h-12 bg-black/20"></div>
                <div>
                  <h3 className="font-light text-sm tracking-wide text-black/60 mb-1">{info.title.toUpperCase()}</h3>
                  <p className="text-black font-light">{info.value}</p>
                </div>
              </div>
            ))}

            <div className="pt-12">
              <h3 className="font-light text-sm tracking-wide text-black/60 mb-6">SOCIAL</h3>
              <div className="flex space-x-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black/60 hover:text-black transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="premium-card rounded-none p-8"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-light tracking-wide text-black/60">NAME</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Name"
                          {...field}
                          className="bg-transparent border-0 border-b border-black/20 rounded-none text-black placeholder-black/40 focus:border-black font-light text-sm pb-3"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-light tracking-wide text-black/60">EMAIL</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          className="bg-transparent border-0 border-b border-black/20 rounded-none text-black placeholder-black/40 focus:border-black font-light text-sm pb-3"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-light tracking-wide text-black/60">SUBJECT</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Project Inquiry"
                          {...field}
                          className="bg-transparent border-0 border-b border-black/20 rounded-none text-black placeholder-black/40 focus:border-black font-light text-sm pb-3"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-light tracking-wide text-black/60">MESSAGE</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell me about your project..."
                          rows={4}
                          {...field}
                          className="bg-transparent border-0 border-b border-black/20 rounded-none text-black placeholder-black/40 focus:border-black font-light text-sm resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="accent-button w-full py-4 rounded-none font-light text-sm tracking-wide"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? "SENDING..." : "SEND MESSAGE"}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
