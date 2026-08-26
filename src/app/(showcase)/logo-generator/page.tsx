import LogoGenerator from "@/registry/app/logo-generator";

export const metadata = { title: "Logo Generator — Component Library" };

export default function LogoGeneratorPage() {
  return (
    <div className="h-full overflow-y-auto">
      <LogoGenerator />
    </div>
  );
}
