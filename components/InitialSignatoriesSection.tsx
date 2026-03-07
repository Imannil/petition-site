import { getInitialSupporters } from "@/app/actions/initial-supporters";
import InitialSignatoriesMarquee from "./InitialSignatoriesMarquee";

export default async function InitialSignatoriesSection() {
  const supporters = await getInitialSupporters();

  return (
    <section
      className="mx-auto max-w-5xl px-4 py-10 sm:py-14"
      aria-labelledby="initial-supporters-heading"
    >
      <h2
        id="initial-supporters-heading"
        className="font-serif text-xl font-semibold text-[var(--cream)] text-center mb-2 sm:text-2xl"
      >
        Initial Supporters
      </h2>
      <p className="text-center text-sm text-[var(--dim)] mb-6">
        People who have added their names in support of this statement
      </p>
      <InitialSignatoriesMarquee supporters={supporters} />
    </section>
  );
}
