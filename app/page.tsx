import HomeClient from "@/components/HomeClient";
import InitialSignatoriesSection from "@/components/InitialSignatoriesSection";
import PetitionFormSection from "@/components/PetitionFormSection";
import SupportersListSection from "@/components/SupportersListSection";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <HomeClient>
      <div className="h-px max-w-2xl mx-auto bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-8" aria-hidden />
      <InitialSignatoriesSection />
      <div className="h-px max-w-2xl mx-auto bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-8" aria-hidden />
      <PetitionFormSection />
      <div className="h-px max-w-2xl mx-auto bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-8" aria-hidden />
      <SupportersListSection />
      <Footer />
    </HomeClient>
  );
}
