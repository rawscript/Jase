import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import RocketLaunch from "./rocket-launch";

interface ContactScreenProps {
  onClose: () => void;
}

export default function ContactScreen({ onClose }: ContactScreenProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [launching, setLaunching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check if content overflows and needs scrolling
  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isOverflowing = scrollHeight > clientHeight;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        
        setShowScrollIndicator(isOverflowing && !isAtBottom);
      }
    };

    // Initial check
    checkScroll();
    
    // Check on resize and scroll
    if (containerRef.current) {
      containerRef.current.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const valid = form.name.trim() && form.email.trim() && form.message.trim();

  const handleTransmit = async () => {
    if (!valid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("subject", "Portfolio inquiry from " + form.name);
      formData.append("message", form.message);
      
      // Send to Formspree
      const response = await fetch("https://formspree.io/f/xeebvqvz", {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (response.ok) {
        setLaunching(true);
        // Clear form
        setForm({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (launching) {
    return <RocketLaunch onComplete={onClose} />;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(250, 248, 244, 0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'IBM Plex Mono', monospace",
        overflowY: "auto",
      }}
    >
      <button
        onClick={onClose}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#111")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
        style={{
          position: "absolute",
          top: isMobile ? 16 : 32,
          left: isMobile ? 20 : 40,
          background: "none",
          border: "none",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "#9CA3AF",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "color 0.2s",
        }}
      >
        ← BACK TO MAP
      </button>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "60px 24px 24px" : "80px 40px 40px",
        }}
      >
        <div style={{ width: "min(640px, 100%)" }}>
          <p
            style={{
              margin: isMobile ? "0 0 10px" : "0 0 18px",
              fontSize: 9,
              letterSpacing: "0.22em",
              color: "#9CA3AF",
            }}
          >
            TRANSMISSION CONSOLE
          </p>
          <h2
            style={{
              margin: isMobile ? "0 0 24px" : "0 0 48px",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: isMobile ? "36px" : "clamp(40px, 7vw, 80px)",
              color: "#111",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}
          >
            Get in
            <br />
            touch.
          </h2>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              {
                key: "name" as const,
                label: "FULL NAME",
                placeholder: "Your name",
                type: "text",
              },
              {
                key: "email" as const,
                label: "EMAIL ADDRESS",
                placeholder: "your@email.com",
                type: "email",
              },
            ].map((f) => (
              <div
                key={f.key}
                style={{
                  borderBottom: "1.5px solid #E5E7EB",
                  paddingBottom: 4,
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    color: "#9CA3AF",
                    paddingTop: isMobile ? 16 : 28,
                    marginBottom: 6,
                  }}
                >
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    outline: "none",
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: isMobile ? "20px" : "clamp(22px, 3.5vw, 32px)",
                    color: "#111",
                    paddingBottom: isMobile ? 8 : 14,
                    letterSpacing: "-0.02em",
                    caretColor: "#D4500A",
                  }}
                />
              </div>
            ))}

            <div
              style={{
                borderBottom: "1.5px solid #E5E7EB",
                paddingBottom: 4,
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  color: "#9CA3AF",
                  paddingTop: isMobile ? 16 : 28,
                  marginBottom: 6,
                }}
              >
                MESSAGE
              </label>
              <textarea
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                placeholder="What are you working on?"
                rows={isMobile ? 2 : 3}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? "16px" : "clamp(18px, 3vw, 26px)",
                  color: "#111",
                  paddingBottom: isMobile ? 8 : 14,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.35,
                  caretColor: "#D4500A",
                }}
              />
            </div>

            <div style={{ marginTop: isMobile ? 24 : 36 }}>
              <button
                onClick={handleTransmit}
                disabled={!valid || isSubmitting}
                style={{
                  background: valid ? "#111" : "#E5E7EB",
                  border: "none",
                  color: valid ? "#FAF8F4" : "#9CA3AF",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  padding: isMobile ? "12px 28px" : "16px 36px",
                  cursor: valid ? "pointer" : "default",
                  transition: "all 0.25s",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {isSubmitting ? "TRANSMITTING..." : "TRANSMIT MESSAGE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
