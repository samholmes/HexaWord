import { Settings, RotateCcw, ZoomIn, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSettings } from "@/hooks/use-settings";
import { motion } from "framer-motion";

export function SettingsSheet() {
  const { settings, setSettings, resetSettings } = useSettings();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 z-20 rounded-full w-12 h-12 bg-muted/50 hover:bg-muted backdrop-blur-sm border border-border/50 shadow-lg"
        >
          <Settings className="w-5 h-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Settings
          </SheetTitle>
          <SheetDescription>
            Customize your gameplay experience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Zoom Setting */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="zoom-enabled" className="text-base font-semibold cursor-pointer">
                  Zoom on Select
                </Label>
                <p className="text-sm text-muted-foreground">
                  Magnify the grid when selecting letters
                </p>
              </div>
            </div>
            <Switch
              id="zoom-enabled"
              checked={settings.zoomEnabled}
              onCheckedChange={(checked) => setSettings({ zoomEnabled: checked })}
              className="data-[state=checked]:bg-blue-500"
            />
          </motion.div>

          {/* Finger Offset Setting */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Hand className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="offset-enabled" className="text-base font-semibold cursor-pointer">
                  Finger Offset
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show selected cell above your finger
                </p>
              </div>
            </div>
            <Switch
              id="offset-enabled"
              checked={settings.fingerOffsetEnabled}
              onCheckedChange={(checked) => setSettings({ fingerOffsetEnabled: checked })}
              className="data-[state=checked]:bg-orange-500"
            />
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Tip:</strong> Disable zoom and offset if you prefer 
              precise control on desktop, or enable both for the best mobile touch experience.
            </p>
          </motion.div>

          {/* Reset Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              onClick={resetSettings}
              className="w-full py-6 rounded-xl border-2 hover:bg-muted/50 transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

