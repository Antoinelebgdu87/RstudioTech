import { useState } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Badge } from "./badge";
import { KeyboardIcon, ShieldIcon } from "lucide-react";

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    {
      keys: ["Ctrl", "F1"],
      description: "Accéder au panel admin",
      icon: <ShieldIcon className="w-4 h-4" />,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur border shadow-lg hover:bg-background"
        >
          <KeyboardIcon className="w-4 h-4 mr-2" />
          Raccourcis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyboardIcon className="w-5 h-5" />
            Raccourcis clavier
          </DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer plus rapidement
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {shortcut.icon}
                <span className="text-sm">{shortcut.description}</span>
              </div>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex} className="flex items-center">
                    <Badge variant="outline" className="font-mono text-xs">
                      {key}
                    </Badge>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="text-xs text-muted-foreground text-center pt-2">
            💡 Les raccourcis fonctionnent sur toutes les pages
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
