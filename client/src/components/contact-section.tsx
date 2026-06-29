import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RocketLaunch from "./rocket-launch";

interface ContactScreenProps {
  onClose: () => void;
}

export default function ContactScreen({ onClose }: ContactScreenProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [launching, setLaunching] = useState(false);

  const contactMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; subject: string; message: string }) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      setLaunching(true);
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const valid =
    form.name.trim() && form.email.trim() && form.message.trim();

  const handleTransmit = () => {
    if (!valid || contactMutation.isPending) return;
    contactMutation.mutate({
      name: form.name,
      email: form.email,
      subject: "Portfolio inquiry",
      message: form.message,
    });
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
        background: "#FAF8F4",
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
          top: 32,
          left: 40,
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
          padding: "80px 40px 40px",
        }}
      >
        <div style={{ width: "min(640px, 100%)" }}>
          <p
            style={{
              margin: "0 0 18px",
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "#9CA3AF",
            }}
          >
            TRANSMISSION CONSOLE
          </p>
          <h2
            style={{
              margin: "0 0 48px",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(40px, 7vw, 80px)",
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
                    paddingTop: 28,
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
                    fontSize: "clamp(22px, 3.5vw, 32px)",
                    color: "#111",
                    paddingBottom: 14,
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
                  paddingTop: 28,
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
                rows={3}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(18px, 3vw, 26px)",
                  color: "#111",
                  paddingBottom: 14,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.35,
                  caretColor: "#D4500A",
                }}
              />
            </div>

            <div style={{ marginTop: 36 }}>
              <button
                onClick={handleTransmit}
                disabled={!valid || contactMutation.isPending}
                style={{
                  background: valid ? "#111" : "#E5E7EB",
                  border: "none",
                  color: valid ? "#FAF8F4" : "#9CA3AF",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  padding: "16px 36px",
                  cursor: valid ? "pointer" : "default",
                  transition: "all 0.25s",
                }}
              >
                {contactMutation.isPending ? "TRANSMITTING..." : "TRANSMIT MESSAGE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
