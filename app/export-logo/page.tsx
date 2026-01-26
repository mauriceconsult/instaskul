// app/export-logo/page.tsx
"use client";

import { InstaSkulLogoCircle } from "@/components/instant-logo-circle";
import { InstaSkulLogoMonogram } from "@/components/instant-logo-monogram";
import { InstaSkulLogoSquare } from "@/components/instant-logo-square";
// import { InstaSkulLogoSquare } from "@/components/instaskul-logo-square";
// import { InstaSkulLogoCircle } from "@/components/instaskul-logo-circle";
// import { InstaSkulLogoMonogram } from "@/components/instaskul-logo-monogram";
import { Button } from "@/components/ui/button";

export default function ExportLogoPage() {
  const downloadAsImage = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Use html2canvas or similar library
    // For now, we'll use a simpler screenshot approach
    alert("Right-click on the logo and 'Save Image As...' OR take a screenshot");
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center">
        InstaSkul Logo Exports for WhatsApp
      </h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {/* Square Logo */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="font-semibold mb-4 text-center">Square (Recommended)</h2>
          <div id="logo-square" className="flex justify-center mb-4">
            <InstaSkulLogoSquare size={300} />
          </div>
          <p className="text-xs text-center text-muted-foreground mb-4">
            500x500px • Best for WhatsApp profile
          </p>
          <Button 
            onClick={() => downloadAsImage("logo-square", "instaskul-square.png")}
            className="w-full"
          >
            Download
          </Button>
        </div>

        {/* Circle Logo */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="font-semibold mb-4 text-center">Circular Badge</h2>
          <div id="logo-circle" className="flex justify-center mb-4">
            <InstaSkulLogoCircle size={300} />
          </div>
          <p className="text-xs text-center text-muted-foreground mb-4">
            500x500px • Matches WhatsApp crop
          </p>
          <Button 
            onClick={() => downloadAsImage("logo-circle", "instaskul-circle.png")}
            className="w-full"
          >
            Download
          </Button>
        </div>

        {/* Monogram */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="font-semibold mb-4 text-center">Monogram</h2>
          <div id="logo-monogram" className="flex justify-center mb-4">
            <InstaSkulLogoMonogram size={300} variant="gradient" />
          </div>
          <p className="text-xs text-center text-muted-foreground mb-4">
            500x500px • Simple & clean
          </p>
          <Button 
            onClick={() => downloadAsImage("logo-monogram", "instaskul-monogram.png")}
            className="w-full"
          >
            Download
          </Button>
        </div>
      </div>

      <div className="mt-12 max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2">How to save:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Right-click on the logo you want</li>
          <li>Select "Save Image As..." or take a screenshot</li>
          <li>Save as PNG format</li>
          <li>Upload to WhatsApp profile</li>
        </ol>
      </div>
    </div>
  );
}
