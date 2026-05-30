import { renderOriginalPage } from "@/lib/legacyHtml";

export const metadata = {
  title: "Student Portal | Skillovate",
};

export default function LearnerPage() {
  return renderOriginalPage("learner.html");
}
