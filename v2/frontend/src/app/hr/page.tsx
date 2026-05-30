import { renderOriginalPage } from "@/lib/legacyHtml";

export const metadata = {
  title: "HR Portal | Skillovate",
};

export default function HrPage() {
  return renderOriginalPage("hr.html");
}
