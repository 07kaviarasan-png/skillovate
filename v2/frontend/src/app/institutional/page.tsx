import { renderOriginalPage } from "@/lib/legacyHtml";

export const metadata = {
  title: "Institutional Portal | Skillovate",
};

export default function InstitutionalPage() {
  return renderOriginalPage("institutional.html");
}
