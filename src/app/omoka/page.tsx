import fs from "fs";
import path from "path";
import OmokaClientPage from "./OmokaClientPage";

export const metadata = {
  title: "Project Num 25",
  description: "Secure gateway for Project Num 25",
};

export default async function OmokaPage() {
  // Read the HTML proposal file contents on the server
  const filePath = path.join(process.cwd(), "src/app/omoka/omoka-proposal.html");
  let htmlContent = "";

  try {
    htmlContent = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error("Error reading omoka-proposal.html:", error);
    htmlContent = `<div style="color: red; padding: 20px; font-family: sans-serif;">Failed to load proposal template. Please contact admin.</div>`;
  }

  return <OmokaClientPage htmlContent={htmlContent} />;
}
