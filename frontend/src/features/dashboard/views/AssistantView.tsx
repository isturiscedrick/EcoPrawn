import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { useTanks } from "@/features/dashboard/context/TankContext";
import { deriveTankAlerts } from "@/features/dashboard/lib/alerts";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  text: string;
  category?: "diagnostics" | "water" | "feeding" | "biofloc" | "alerts";
  actions?: { label: string; href?: string; actionKey?: string }[];
}

const SUGGESTED_QUERIES = [
  {
    icon: "waves" as const,
    label: "Water Quality Check",
    query: "Evaluate current dissolved oxygen (DO) and pH levels across all active tanks.",
  },
  {
    icon: "leaf" as const,
    label: "Biofloc C:N Optimization",
    query: "What is the optimal molasses dosing to balance the C:N ratio for biofloc health?",
  },
  {
    icon: "utensils" as const,
    label: "Feeding Schedule Analysis",
    query: "Analyze our feeding rates based on current biomass density and water temperature.",
  },
  {
    icon: "bell-ring" as const,
    label: "Triage Active Alerts",
    query: "Are there any critical water parameter thresholds breached right now?",
  },
];

export function AssistantView() {
  const { tanks, loading } = useTanks();
  const liveAlerts = deriveTankAlerts(tanks);
  const activeAlertCount = liveAlerts.length;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-msg",
      sender: "assistant",
      timestamp: "Just now",
      text: `Hello Operator! I am your **EcoPrawn AI Aquaculture Assistant**. 
I have real-time access to your telemetry data, currently monitoring **${tanks.length} tanks** and **${activeAlertCount} active alert${activeAlertCount === 1 ? "" : "s"}**.

Ask me anything regarding water chemistry (DO, pH, ORP, Temp), biofloc microbial management, optimal feeding ratios, or alarm triage.`,
      category: "diagnostics",
      actions: [
        { label: "View Tanks", href: "/dashboard/tanks" },
        { label: "Water Quality", href: "/dashboard/water" },
        ...(activeAlertCount > 0 ? [{ label: `Review Alerts (${activeAlertCount})`, href: "/dashboard/alerts" }] : []),
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const generateAIResponse = (userText: string): ChatMessage => {
    const textLower = userText.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Water quality / Dissolved Oxygen / pH
    if (textLower.includes("oxygen") || textLower.includes("do") || textLower.includes("water") || textLower.includes("ph")) {
      const avgTemp = tanks.length > 0
        ? (tanks.reduce((acc, t) => acc + (t.temperature ?? 28), 0) / tanks.length).toFixed(1)
        : "28.4";
      const avgPh = tanks.length > 0
        ? (tanks.reduce((acc, t) => acc + (t.ph ?? 7.8), 0) / tanks.length).toFixed(2)
        : "7.75";
      const avgDo = tanks.length > 0
        ? (tanks.reduce((acc, t) => acc + (t.dissolvedOxygen ?? 6.2), 0) / tanks.length).toFixed(1)
        : "6.4";

      return {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        timestamp: timeStr,
        category: "water",
        text: `### 🌊 Telemetry Diagnostics: Water Quality Analysis

Based on real-time sensory inputs from your monitoring probes:
- **Average Dissolved Oxygen (DO):** \`${avgDo} mg/L\` (Target: 5.5 - 7.5 mg/L)
- **Mean Temperature:** \`${avgTemp} °C\` (Optimal range: 27.0 - 30.5 °C)
- **Mean pH:** \`${avgPh}\` (Optimal range: 7.50 - 8.30)

**Recommendations:**
1. **Aeration Output:** Maintain continuous paddlewheel/diffuser cycles. Low DO during early dawn hours (< 5.0 mg/L) is the primary stress factor for juvenile prawns.
2. **Buffer Capacity:** Your pH stability is nominal. Ensure total alkalinity stays above 120 mg/L CaCO₃ to avoid swings after rain events.`,
        actions: [
          { label: "Inspect Water Quality", href: "/dashboard/water" },
          { label: "Check Analytics", href: "/dashboard/analytics" },
        ],
      };
    }

    // Biofloc / C:N ratio / Molasses
    if (textLower.includes("biofloc") || textLower.includes("c:n") || textLower.includes("molasses") || textLower.includes("carbon")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        timestamp: timeStr,
        category: "biofloc",
        text: `### 🧪 Biofloc System & Carbon:Nitrogen Balance

In intensive zero-exchange Macrobrachium/Penaeid culture, maintaining a **C:N ratio of 15:1 to 20:1** is crucial to stimulate heterotrophic bacterial assimilation of total ammonia nitrogen (TAN).

**Dosing Calculation:**
- Assuming a commercial feed with 35% crude protein, approx. 16% is Nitrogen.
- To balance each 100g of nitrogen excreted, add **400–500g of carbon source** (e.g., standard industrial blackstrap molasses ~40% organic carbon).
- **Probiotic Inoculum:** Supplement Bacillus subtilis / nitrifiers once weekly during morning hours.

**Caution:** Monitor settleable floc volume (Imhoff Cone). Desirable volume: **15–25 mL/L**. If floc exceeds 35 mL/L, activate foam fractionator or partial foam purge to avoid gill fouling.`,
        actions: [
          { label: "View Tanks", href: "/dashboard/tanks" },
        ],
      };
    }

    // Alerts / Alarms
    if (textLower.includes("alert") || textLower.includes("alarm") || textLower.includes("critical") || textLower.includes("warning")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        timestamp: timeStr,
        category: "alerts",
        text: `### 🚨 Telemetry Alert Triage Summary

Currently detected facility notifications: **${activeAlertCount} active condition${activeAlertCount === 1 ? "" : "s"}**.

${
  activeAlertCount === 0
    ? "✅ **All systems are currently within nominal thresholds.** Dissolved oxygen, thermal levels, and sensor communication pings are green across all monitored tanks."
    : `⚠️ **Action Required:**
- Review highlighted warning tanks immediately.
- Ensure backup aerator circuits are energized.
- Verify ESP32 probe telemetry is broadcasting without packet loss.`
}

You can acknowledge or inspect each alert directly in the Alerts dashboard.`,
        actions: [
          { label: "Go to Alerts Page", href: "/dashboard/alerts" },
          { label: "View Tanks", href: "/dashboard/tanks" },
        ],
      };
    }

    // Feeding / Feed schedule / Nutrition
    if (textLower.includes("feed") || textLower.includes("nutrition") || textLower.includes("biomass") || textLower.includes("growth")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        timestamp: timeStr,
        category: "feeding",
        text: `### 🦐 Precision Feeding & Biomass Estimation

Prawn appetite is strongly correlated with water temperature and dissolved oxygen.

**Key Operating Guidelines:**
1. **Dynamic Rationing:** If dissolved oxygen falls below \`4.5 mg/L\`, reduce feed ration by 50% immediately to prevent feed decay and toxic un-ionized ammonia (NH₃) surges.
2. **Frequency:** Split daily rations into 4 distinct broadcast feedings (07:00, 11:30, 16:30, 21:00). Macrobrachium are nocturnal grazers and consume ~40% of their daily intake after dusk.
3. **Feed Tray Check:** Inspect feeding trays 2 hours post-broadcast. If > 10% uneaten feed remains, reduce the next feeding cycle by 15%.`,
        actions: [
          { label: "View Analytics", href: "/dashboard/analytics" },
          { label: "Water Quality", href: "/dashboard/water" },
        ],
      };
    }

    // Default intelligent aquaculture response
    return {
      id: `ai-${Date.now()}`,
      sender: "assistant",
      timestamp: timeStr,
      category: "diagnostics",
      text: `### 💡 Aquaculture Copilot Recommendation

Regarding: *"User query analysis"*

Here are operational best practices for your current facility state:
1. **Real-time Telemetry:** Probes are calibrated for high-density prawn grow-out.
2. **Water Stability:** Daily diurnal swings should remain < 1.0 pH units and < 3.0 °C.
3. **Preventive Biosecurity:** Conduct daily inspection of prawn uropods, antennae, and hepatopancreas coloration. Healthy prawns exhibit translucent carapace and full gut fullness.

Would you like me to analyze a specific tank's sensor stream or generate an automated facility report?`,
      actions: [
        { label: "View Tanks", href: "/dashboard/tanks" },
        { label: "Water Quality", href: "/dashboard/water" },
      ],
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend ?? inputQuery).trim();
    if (!query || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsGenerating(true);

    // Simulate smart agent processing
    setTimeout(() => {
      const response = generateAIResponse(query);
      setMessages((prev) => [...prev, response]);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div
      data-assistant-page
      className="dashboard-assistant-page mx-auto max-w-5xl space-y-6"
    >
      {/* Page Header */}
      <div
        data-assistant-header
        className="flex flex-col gap-4 border-b border-[var(--ep-line)] pb-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span data-assistant-brand className="flex h-6 items-center gap-1.5 rounded-full bg-[var(--ep-accent-tint)] px-2.5 text-[11px] font-semibold text-[var(--ep-primary)] border border-[var(--ep-accent)]/30">
              <Icon name="sparkles" size={13} className="text-[var(--ep-accent)] animate-pulse" />
              EcoPrawn Intelligence
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ep-text-muted)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span className="hidden sm:inline">Active Telemetry Linked</span>
              <span className="sm:hidden">Online</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ep-text)]">
            AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ep-text-muted)] mt-1">
            Real-time sensory analysis, biofloc diagnostics, and intelligent aquaculture recommendations.
          </p>
        </div>

        {/* Telemetry Stat Badges */}
        <div data-assistant-stats className="flex items-center gap-2 self-start sm:self-center">
          <div data-assistant-metric className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-xs">
            <Icon name="tank-stack" size={15} className="text-[var(--ep-primary)]" />
            <span className="font-semibold text-[var(--ep-text)]">{tanks.length}</span>
            <span className="text-[var(--ep-text-muted)]">Tanks</span>
          </div>
          <div data-assistant-metric className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-xs">
            <Icon name="bell-ring" size={15} className={activeAlertCount > 0 ? "text-amber-500" : "text-emerald-500"} />
            <span className="font-semibold text-[var(--ep-text)]">{activeAlertCount}</span>
            <span className="text-[var(--ep-text-muted)]">Alerts</span>
          </div>
          <button
            type="button"
            onClick={() => setMessages([messages[0]])}
            title="Reset conversation"
            aria-label="Reset conversation"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] text-[var(--ep-text-muted)] hover:text-[var(--ep-primary)] hover:bg-[var(--ep-tint)] transition-colors"
          >
            <Icon name="repeat" size={15} />
          </button>
        </div>
      </div>

      {/* Suggested Quick Inquiries */}
      <div data-assistant-suggestions className="space-y-2">
        <div data-assistant-suggestions-title className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ep-text-muted)]">
          Suggested Diagnostics
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SUGGESTED_QUERIES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSend(item.query)}
              data-assistant-suggestion
              className="flex min-w-0 items-start gap-2.5 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 text-left transition-all duration-200 group hover:border-[var(--ep-accent)]/50 hover:bg-[var(--ep-accent-tint)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--ep-tint)] text-[var(--ep-primary)] group-hover:scale-105 transition-transform">
                <Icon name={item.icon} size={15} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--ep-text)] group-hover:text-[var(--ep-primary)] transition-colors">
                  {item.label}
                </div>
                <div data-assistant-suggestion-copy className="text-[11px] text-[var(--ep-text-muted)] line-clamp-1">
                  {item.query}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Feed */}
      <div data-assistant-chat className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] shadow-sm">
        {/* Messages Container */}
        <div data-assistant-messages className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                  msg.sender === "user"
                    ? "bg-[var(--ep-primary)] text-white shadow-sm"
                    : "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm"
                }`}
              >
                {msg.sender === "user" ? (
                  <Icon name="user-round" size={16} />
                ) : (
                  <Icon name="sparkles" size={16} />
                )}
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[var(--ep-primary)] text-white font-medium rounded-tr-sm shadow-sm"
                      : "bg-[var(--ep-bg)] border border-[var(--ep-line)] text-[var(--ep-text)] rounded-tl-sm shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.text.split("\n\n").map((paragraph, idx) => (
                      <p key={idx} className="last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Optional Quick Action Buttons inside Assistant Message */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {msg.actions.map((act) => (
                      <Link
                        key={act.label}
                        to={act.href as never}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--ep-line)] bg-[var(--ep-surface)] text-xs font-medium text-[var(--ep-primary)] hover:bg-[var(--ep-tint)] hover:border-[var(--ep-accent)]/40 transition-colors shadow-2xs"
                      >
                        {act.label}
                        <Icon name="arrow-right" size={12} />
                      </Link>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-[var(--ep-text-muted)] px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                <Icon name="sparkles" size={16} className="animate-spin" />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--ep-bg)] border border-[var(--ep-line)] text-xs text-[var(--ep-text-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ep-primary)] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ep-primary)] animate-bounce [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ep-primary)] animate-bounce [animation-delay:0.3s]" />
                <span className="ml-1 font-medium">Analyzing telemetry & telemetry models…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div data-assistant-composer className="border-t border-[var(--ep-line)] bg-[var(--ep-surface)] p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Message your aquaculture assistant…"
                aria-label="Ask EcoPrawn AI Assistant"
                className="w-full min-h-12 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-4 py-2.5 text-sm text-[var(--ep-text)] placeholder:text-[var(--ep-text-muted)] focus:outline-none focus:border-[var(--ep-primary)] focus:ring-2 focus:ring-[var(--ep-primary)]/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              aria-label="Send message"
              className="flex min-h-12 px-5 items-center justify-center gap-2 rounded-xl bg-[var(--ep-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <span data-assistant-send-label>Ask</span>
              <Icon name="arrow-up" size={16} strokeWidth={2.2} />
            </button>
          </form>
          <div data-assistant-composer-hint className="flex items-center justify-between px-1 pt-2 text-[11px] text-[var(--ep-text-muted)]">
            <span>Powered by EcoPrawn Biofloc & Sensory Intelligence Model</span>
            <span>Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
