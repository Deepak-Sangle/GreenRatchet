"use client";

import { CloudProvider } from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Unplug } from "lucide-react";

interface DisconnectCloudButtonProps {
  connectionId: string;
  provider: CloudProvider;
}

export function DisconnectCloudButton({
  provider,
}: DisconnectCloudButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block cursor-not-allowed">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 pointer-events-none opacity-50"
            >
              <Unplug className="h-4 w-4" />
              Disconnect {provider}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            You cannot disconnect the cloud connection because you are not the
            owner of this account
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
