import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Star,
  Gift,
  BookOpen,
  BarChart3,
  ArrowRight,
  Plug,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

interface ActionFeedback {
  tool: string;
  action: string;
  status: "success" | "failed";
  summary: string;
  summaryAr: string;
  link?: string;
  time: string;
}

export function AdminAICopilot() {
  const [command, setCommand] = useState("");
  const [lastAction, setLastAction] = useState<ActionFeedback | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // Form fields for AI API Config
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiUrlInput, setApiUrlInput] = useState("");
  const [modelInput, setModelInput] = useState("gpt-4o-mini");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const utils = trpc.useUtils();

  // Fetch current AI API config
  const { data: apiConfig, refetch: refetchApiConfig } = trpc.aiCommand.getApiConfig.useQuery(
    undefined,
    { staleTime: 60000 }
  );

  useEffect(() => {
    if (apiConfig) {
      setApiKeyInput(apiConfig.maskedKey || "");
      setApiUrlInput(apiConfig.apiUrl || "https://forge.manus.im/v1/chat/completions");
      setModelInput(apiConfig.model || "gpt-4o-mini");
    }
  }, [apiConfig]);

  const chatMutation = trpc.aiCommand.chat.useMutation({
    onSuccess: (data) => {
      if (data.executedAction) {
        setLastAction({
          tool: data.executedAction.tool,
          action: data.executedAction.action,
          status: data.executedAction.status,
          summary: data.executedAction.summary,
          summaryAr: data.executedAction.summaryAr,
          link: data.executedAction.link,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
        toast.success(data.executedAction.summary || "Action executed successfully");
        utils.invalidate();
      } else {
        toast.info("Request processed by AI Copilot");
      }
      setCommand("");
    },
    onError: (err) => {
      toast.error(`Command execution failed: ${err.message}`);
    },
  });

  const directActionMutation = trpc.aiCommand.executeAdminAction.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setLastAction({
          tool: data.tool,
          action: data.action,
          status: "success",
          summary: data.summary,
          summaryAr: data.summaryAr,
          link: data.link,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
        toast.success(data.summary || "Action executed successfully");
        utils.invalidate();
      } else {
        toast.error(data.summary || "Action execution failed");
      }
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  // Test API Connection mutation
  const testConnectionMutation = trpc.aiCommand.testApiConnection.useMutation({
    onSuccess: (data) => {
      setTestResult(data);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => {
      setTestResult({ success: false, message: err.message });
      toast.error(`Test failed: ${err.message}`);
    },
  });

  // Save API Config mutation
  const saveApiConfigMutation = trpc.aiCommand.saveApiConfig.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "AI API configuration saved");
      refetchApiConfig();
      setIsApiModalOpen(false);
    },
    onError: (err) => {
      toast.error(`Failed to save settings: ${err.message}`);
    },
  });

  const isPending = chatMutation.isPending || directActionMutation.isPending;

  const handleSendCommand = (text?: string) => {
    const textToSend = (text || command).trim();
    if (!textToSend) return;

    chatMutation.mutate({
      messages: [{ role: "user", content: textToSend }],
      taskType: "general",
    });
  };

  const handleSaveApiSettings = () => {
    saveApiConfigMutation.mutate({
      apiKey: apiKeyInput,
      apiUrl: apiUrlInput,
      model: modelInput,
    });
  };

  const handleTestApi = () => {
    setTestResult(null);
    testConnectionMutation.mutate({
      apiKey: apiKeyInput,
      apiUrl: apiUrlInput,
      model: modelInput,
    });
  };

  // Unified, elegant black & gold styling for all tools (no rainbow colors)
  const quickTools = [
    {
      label: "Approve Pending Reviews",
      icon: Star,
      action: () =>
        directActionMutation.mutate({
          tool: "reviews",
          action: "approveAllPending",
        }),
    },
    {
      label: "Create 20% Discount Offer",
      icon: Gift,
      action: () =>
        directActionMutation.mutate({
          tool: "offers",
          action: "create",
          params: {
            title: "Royal Egyptian Escapade - 20% Privilege",
            discountValue: "20",
            promoCode: "VIPROYAL20",
            destination: "Luxor, Aswan & Cairo",
          },
        }),
    },
    {
      label: "Publish Luxury Travel Article",
      icon: BookOpen,
      action: () =>
        directActionMutation.mutate({
          tool: "blog",
          action: "create",
          params: {
            title: "The Sovereign Guide to Private Aviation & Egyptology",
            category: "Luxury Tours",
          },
        }),
    },
    {
      label: "Refresh Live Analytics Summary",
      icon: BarChart3,
      action: () =>
        directActionMutation.mutate({
          tool: "dashboard",
          action: "getDashboardSummary",
        }),
    },
  ];

  return (
    <>
      <Card className="mb-8 border border-zinc-800 bg-[#0d1117] text-zinc-100 shadow-xl relative overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-[#D4A853] shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-zinc-100 tracking-wide font-serif">
                    AI Administration Copilot
                  </CardTitle>
                  <Badge variant="outline" className="bg-zinc-900 text-[#D4A853] border-amber-500/30 text-[11px] px-2 py-0.5 font-normal">
                    Active
                  </Badge>
                </div>
                <CardDescription className="text-zinc-400 text-xs">
                  Executive management across bookings, promotions, reviews, blog, and messages
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* AI API Connection Button */}
              <Button
                onClick={() => setIsApiModalOpen(true)}
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-[#D4A853] text-xs gap-1.5"
              >
                <Plug className="w-3.5 h-3.5 text-[#D4A853]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853] inline-block" />
                AI API Settings
              </Button>

              <Link href="/admin/ai-command">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-[#D4A853] text-xs gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
                  AI Command Center
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendCommand();
                  }
                }}
                placeholder="Instruct AI Copilot (e.g., Approve pending reviews, create 20% discount offer, publish article on Luxor...)"
                className="bg-zinc-900 border-zinc-750 text-zinc-100 placeholder:text-zinc-500 pl-10 focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] text-sm h-10"
                disabled={isPending}
              />
              <Sparkles className="w-4 h-4 text-[#D4A853] absolute left-3.5 top-3 pointer-events-none" />
            </div>

            <Button
              onClick={() => handleSendCommand()}
              disabled={isPending || !command.trim()}
              className="bg-[#D4A853] hover:bg-[#c49843] text-black font-semibold px-5 h-10 shadow-sm transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400 block mb-2 font-medium">Quick Actions:</span>
            <div className="flex flex-wrap gap-2">
              {quickTools.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={idx}
                    onClick={tool.action}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-750 bg-zinc-900/80 text-zinc-300 hover:text-[#D4A853] hover:border-amber-500/40 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#D4A853]" />
                    {tool.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Last Action Feedback Banner */}
          {lastAction && (
            <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4A853] mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-zinc-200">Action Completed:</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-zinc-900 border-zinc-700 text-zinc-300">
                      {lastAction.tool}
                    </Badge>
                    <span className="text-[10px] text-zinc-500">{lastAction.time}</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{lastAction.summary || lastAction.summaryAr}</p>
                </div>
              </div>

              {lastAction.link && (
                <Link href={lastAction.link}>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-[#D4A853] hover:text-amber-300 shrink-0">
                    View <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI API Connection Modal Dialog */}
      <Dialog open={isApiModalOpen} onOpenChange={setIsApiModalOpen}>
        <DialogContent className="bg-[#0d1117] border border-zinc-800 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Plug className="w-4 h-4 text-[#D4A853]" />
              AI API Connection Settings
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure the AI API key and endpoint used for the visitor concierge and admin tools.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">AI API Key</Label>
              <Input
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter API Key (e.g. ak-... or sk-...)"
                className="bg-zinc-900 border-zinc-750 text-xs h-9 text-zinc-100 placeholder:text-zinc-600 focus:border-[#D4A853]"
              />
              <p className="text-[11px] text-zinc-500">
                Currently loaded: <span className="text-[#D4A853] font-mono">{apiConfig?.maskedKey || "Configured"}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">AI API Endpoint URL</Label>
              <Input
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="https://forge.manus.im/v1/chat/completions"
                className="bg-zinc-900 border-zinc-750 text-xs h-9 text-zinc-100 placeholder:text-zinc-600 focus:border-[#D4A853]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">AI Model</Label>
              <Input
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="gpt-4o-mini"
                className="bg-zinc-900 border-zinc-750 text-xs h-9 text-zinc-100 placeholder:text-zinc-600 focus:border-[#D4A853]"
              />
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? "bg-zinc-900 border-amber-500/40 text-zinc-200"
                    : "bg-zinc-900 border-red-500/40 text-red-300"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#D4A853]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row justify-between items-center gap-2 pt-2 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestApi}
              disabled={testConnectionMutation.isPending}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs"
            >
              {testConnectionMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Test Connection
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsApiModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveApiSettings}
                disabled={saveApiConfigMutation.isPending}
                className="bg-[#D4A853] hover:bg-[#c49843] text-black font-semibold text-xs"
              >
                {saveApiConfigMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
