import { BadgeCheck, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VerificationBadge({
  emailVerified,
  verifiedLender,
}: {
  emailVerified: boolean;
  verifiedLender: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {emailVerified && (
        <Badge variant="secondary" className="gap-1">
          <Mail className="h-3 w-3" />
          Email verified
        </Badge>
      )}
      {verifiedLender && (
        <Badge variant="default" className="gap-1">
          <BadgeCheck className="h-3 w-3" />
          Verified lender
        </Badge>
      )}
    </div>
  );
}
