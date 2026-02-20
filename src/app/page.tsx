import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { DeployFlow } from "@/components/deploy-flow";
import { FeaturesSection } from "@/components/features-section";
import { ThemesSection } from "@/components/themes-section";
import { ComparisonTable } from "@/components/comparison-table";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <HeroSection />
      <DeployFlow user={user} />
      <FeaturesSection />
      <ThemesSection />
      <ComparisonTable />
      <Footer />
    </div>
  );
}
