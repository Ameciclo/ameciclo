import { 
  FileText, 
  Download, 
  FolderTree, 
  Boxes, 
  Route, 
  Code2, 
  Lightbulb,
  FlaskConical, 
  Settings, 
  AlertTriangle, 
  Rocket, 
  Users,
  Search,
  ArrowUp,
  Home,
  ExternalLink,
  Mail,
  BarChart3,
  RefreshCw
} from "lucide-react";

export function OverviewIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <FileText className={className} />;
}

export function InstallIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Download className={className} />;
}

export function FolderIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <FolderTree className={className} />;
}

export function ComponentIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Boxes className={className} />;
}

export function RouteIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Route className={className} />;
}

export function ApiIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Code2 className={className} />;
}

export function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Lightbulb className={className} />;
}

export function TestIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <FlaskConical className={className} />;
}

export function ConfigIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Settings className={className} />;
}

export function TroubleshootIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <AlertTriangle className={className} />;
}

export function DeployIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Rocket className={className} />;
}

export function ContributeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Users className={className} />;
}

export function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Search className={className} />;
}

export function ArrowUpIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <ArrowUp className={className} />;
}

export function HomeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Home className={className} />;
}

export function ExternalLinkIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <ExternalLink className={className} />;
}

export function EmailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <Mail className={className} />;
}

export function StatusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <BarChart3 className={className} />;
}

export function RefreshIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <RefreshCw className={className} />;
}