"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahrain","Bangladesh","Belgium","Brazil","Bulgaria","Canada","Chile","China","Colombia",
  "Croatia","Czech Republic","Denmark","Egypt","Estonia","Finland","France","Georgia","Germany",
  "Greece","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan",
  "Jordan","Kazakhstan","Kuwait","Latvia","Lebanon","Lithuania","Malaysia","Mexico","Netherlands",
  "New Zealand","Nigeria","Norway","Oman","Pakistan","Palestine","Philippines","Poland","Portugal",
  "Qatar","Romania","Russia","Saudi Arabia","Serbia","Singapore","Slovakia","South Korea","Spain",
  "Sweden","Switzerland","Syria","Taiwan","Turkey","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uzbekistan","Venezuela","Yemen","Other",
];

type Sig = { id: string; full_name: string; country: string | null; created_at: string };

export default function PetitionClient() {
  const [sigs, setSigs]       = useState<Sig[]>([]);
  const [total, setTotal]     = useState<number | null>(null);
  const [newId, setNewId]     = useState<string | null>(null);
  const [form, setForm]       = useState({ full_name: "", email: "", country: "", consent: false });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [err, setErr]         = useState("");

  // Signatures sorted alphabetically
  const sortedSigs = useMemo(
    () => [...sigs].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [sigs]
  );

  const loadSignatures = useCallback(async () => {
    try {
      const res  = await fetch("/api/signatures?limit=500");
      const data = await res.json();
      setTotal(data.total ?? 0);
      setSigs(data.signatures ?? []);
    } catch { /* silent — counter stays as-is */ }
  }, []);

  useEffect(() => { loadSignatures(); }, [loadSignatures]);

  const handleSubmit = async () => {
    // Client-side validation
    if (!form.full_name.trim()) { setErr("Full name is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setErr("A valid email address is required."); return; }
    if (!form.consent) { setErr("You must confirm that your name will be publicly displayed to sign."); return; }

    setErr("");
    setSubmitStatus("submitting");

    try {
      const res  = await fetch("/api/sign", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          full_name: form.full_name.trim(),
          email:     form.email.trim().toLowerCase(),
          country:   form.country || null,
          consent:   form.consent,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErr(data.error ?? "Something went wrong. Please try again.");
        setSubmitStatus("idle");
        return;
      }

      setSubmitStatus("success");
      setForm({ full_name: "", email: "", country: "", consent: false });

      // Refresh list — new entry will slot into alphabetical position
      await loadSignatures();

      // Highlight new entry for 4 seconds
      const fresh = (await (await fetch("/api/signatures?limit=1")).json()).signatures;
      // We reload all sigs above; find the new one by name+email proximity isn't needed —
      // Instead we mark any newly-returned ID not previously in our list
      setSigs(prev => {
        const prevIds = new Set(prev.map(s => s.id));
        const newSig  = (fresh as Sig[]).find(s => !prevIds.has(s.id));
        if (newSig) {
          setNewId(newSig.id);
          setTimeout(() => setNewId(null), 4000);
        }
        return prev; // already updated by loadSignatures above
      });
    } catch {
      setErr("Network error. Please check your connection and try again.");
      setSubmitStatus("idle");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="root">

        {/* NAV */}
        <nav>
          <div className="nav-l">
            <span className="nav-dot" />
            <span className="nav-title">Stop Iran War</span>
          </div>
          <span className="nav-count">
            {total === null ? "…" : total.toLocaleString()} signed
          </span>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="eyebrow">Open Petition · 2025</div>
          <h1>
            <span className="w-stop">Stop</span>{" "}
            <span className="w-iran">Iran</span>{" "}
            <span className="w-war">War</span>
          </h1>
          <p className="tagline">A petition by Iranians in the diaspora calling for peace</p>
          <div className="counter">
            <span className="counter-num">
              {total === null ? "…" : total.toLocaleString()}
            </span>
            <span className="counter-lbl">Signatures</span>
          </div>
        </section>

        <div className="hr" />

        {/* STATEMENT */}
        <section className="stmt-wrap">
          <p className="stmt-intro">
            We, Iranians living outside our homeland, demand an immediate ceasefire and a peaceful
            resolution to the conflict between Iran, the United States, and Israel.
          </p>
          <div className="stmt-body">
            <p>War brings nothing but devastation to ordinary people — families torn apart, lives lost,
              futures destroyed. No political dispute justifies the suffering of civilians on any side.</p>
            <p>We believe diplomacy, dialogue, and respect for human life must prevail over violence.
              We call upon all governments and international bodies to pursue peace with urgency and sincerity.</p>
            <p>By signing below, you stand with us in demanding that this war ends — and that Iranians,
              Americans, and Israelis alike may live in safety and dignity.</p>
          </div>
        </section>

        <div className="hr" />

        {/* FORM */}
        <section className="form-wrap">
          <h2 className="form-h">Add Your Name</h2>
          <div className="card">
            {submitStatus === "success" ? (
              <div className="msg-ok">
                ✓ Your name has been added to the petition. Thank you for standing with us.
              </div>
            ) : (
              <>
                <input className="field" type="text" placeholder="Full name *"
                  value={form.full_name} disabled={submitStatus === "submitting"}
                  onChange={e => { setForm(f => ({ ...f, full_name: e.target.value })); setErr(""); }} />

                <input className="field" type="email"
                  placeholder="Email address * (only used to prevent duplicates, never shown)"
                  value={form.email} disabled={submitStatus === "submitting"}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErr(""); }} />

                <select className="field" value={form.country} disabled={submitStatus === "submitting"}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                  <option value="">Country of residence (optional)</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <label className="cb-label">
                  <input type="checkbox" checked={form.consent}
                    disabled={submitStatus === "submitting"}
                    onChange={e => { setForm(f => ({ ...f, consent: e.target.checked })); setErr(""); }} />
                  <span>
                    I confirm that my full name will be{" "}
                    <strong className="cb-strong">publicly displayed</strong>{" "}
                    in the signatories list, and I voluntarily add my name to this petition.
                  </span>
                </label>

                <p className="privacy">
                  🔒 Your email is used only to prevent duplicate entries. It will never be shown publicly or shared.
                </p>

                {err && <div className="msg-err">{err}</div>}

                <button className="btn" onClick={handleSubmit} disabled={submitStatus === "submitting"}>
                  {submitStatus === "submitting"
                    ? <><span className="spinner" /> Signing…</>
                    : "Sign the Petition →"}
                </button>
              </>
            )}
          </div>
        </section>

        {/* SIGNATORIES */}
        <section className="list-wrap">
          <h2 className="list-h">Signatories</h2>
          {total !== null && (
            <p className="list-sub">Listed alphabetically · {total.toLocaleString()} total</p>
          )}
          <div className="sig-grid">
            {sortedSigs.map(sig => (
              <div key={sig.id} className={`sig-card ${sig.id === newId ? "new" : ""}`}>
                <span className={`sig-dot ${sig.id === newId ? "red" : ""}`} />
                <div>
                  <div className="sig-name">{sig.full_name}</div>
                  {sig.country && <div className="sig-country">{sig.country}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer>
          stopiranwar.org · A petition by Iranians in the diaspora for peace · 2025
        </footer>
      </div>
    </>
  );
}

const styles = `
  .root{position:relative;z-index:1;}
  nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 2.5rem;
    border-bottom:1px solid var(--border);backdrop-filter:blur(16px);
    background:rgba(8,9,11,.82);position:sticky;top:0;z-index:100;}
  .nav-l{display:flex;align-items:center;gap:.7rem;}
  .nav-dot{width:8px;height:8px;border-radius:50%;background:var(--red);box-shadow:0 0 9px rgba(192,57,43,.8);}
  .nav-title{font-size:.82rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;}
  .nav-count{font-size:.72rem;color:var(--dim);letter-spacing:.06em;border:1px solid var(--border);padding:.2rem .7rem;border-radius:100px;}
  .hero{max-width:860px;margin:0 auto;padding:5rem 2.5rem 3.5rem;text-align:center;}
  .eyebrow{display:inline-flex;align-items:center;gap:.5rem;font-size:.67rem;letter-spacing:.22em;
    text-transform:uppercase;color:var(--red-l);margin-bottom:2rem;font-weight:500;animation:fadeUp .5s ease both;}
  .eyebrow::before,.eyebrow::after{content:'';width:24px;height:1px;background:var(--red-l);opacity:.6;}
  h1{font-family:'Cormorant Garamond',serif;font-size:clamp(3.8rem,9vw,6.8rem);font-weight:700;
    line-height:.95;letter-spacing:-.02em;margin-bottom:1.2rem;animation:fadeUp .55s .1s ease both;}
  .w-stop{color:var(--red-l);}
  .w-iran{color:var(--cream);}
  .w-war{font-style:italic;background:linear-gradient(135deg,var(--red),var(--red-l));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .tagline{font-size:.97rem;color:var(--dim);font-weight:300;letter-spacing:.05em;margin-bottom:2.8rem;animation:fadeUp .55s .2s ease both;}
  .counter{display:inline-flex;flex-direction:column;align-items:center;gap:.15rem;
    border:1px solid rgba(192,57,43,.35);border-radius:14px;background:var(--surface);
    padding:1.1rem 3rem;animation:fadeUp .55s .3s ease both;margin-bottom:3rem;}
  .counter-num{font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:700;color:var(--cream);line-height:1;}
  .counter-lbl{font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);}
  .hr{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);max-width:680px;margin:0 auto 3.5rem;}
  .stmt-wrap{max-width:660px;margin:0 auto 4.5rem;padding:0 2.5rem;}
  .stmt-intro{font-family:'Cormorant Garamond',serif;font-size:clamp(1.2rem,2.4vw,1.42rem);
    font-style:italic;color:var(--cream);line-height:1.72;margin-bottom:1.5rem;border-left:2px solid var(--red);padding-left:1.2rem;}
  .stmt-body{font-size:.93rem;line-height:1.95;color:rgba(240,235,227,.72);font-weight:300;}
  .stmt-body p+p{margin-top:1rem;}
  .form-wrap{max-width:560px;margin:0 auto 5.5rem;padding:0 2.5rem;}
  .form-h{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;text-align:center;margin-bottom:1.5rem;}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:1.8rem;display:flex;flex-direction:column;gap:.85rem;}
  .field{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:10px;
    padding:.82rem 1.1rem;color:var(--cream);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;}
  .field:focus{border-color:rgba(192,57,43,.6);}
  .field::placeholder{color:var(--dim);font-size:.83rem;}
  .field:disabled{opacity:.45;cursor:not-allowed;}
  select.field{cursor:pointer;appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239a9389' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 1rem center;padding-right:2.5rem;}
  select.field option{background:#0f1115;color:var(--cream);}
  .cb-label{display:flex;align-items:flex-start;gap:.65rem;cursor:pointer;font-size:.84rem;color:var(--dim);line-height:1.58;
    background:rgba(192,57,43,.06);border:1px solid rgba(192,57,43,.15);border-radius:10px;padding:.85rem 1rem;transition:all .2s;}
  .cb-label:hover{background:rgba(192,57,43,.1);border-color:rgba(192,57,43,.3);}
  .cb-label input[type=checkbox]{width:15px;height:15px;min-width:15px;margin-top:3px;accent-color:var(--red-l);cursor:pointer;flex-shrink:0;}
  .cb-strong{color:var(--cream);font-weight:500;}
  .privacy{font-size:.72rem;color:var(--dim);line-height:1.55;}
  .btn{background:var(--red);color:#fff;border:none;border-radius:10px;padding:.95rem;width:100%;
    font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .2s;letter-spacing:.03em;
    display:flex;align-items:center;justify-content:center;gap:.5rem;}
  .btn:hover:not(:disabled){background:var(--red-l);transform:translateY(-1px);box-shadow:0 4px 20px rgba(192,57,43,.35);}
  .btn:disabled{opacity:.55;cursor:not-allowed;}
  .spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
  .msg-ok{background:var(--green-bg);color:var(--green-t);border:1px solid rgba(82,196,131,.25);border-radius:10px;padding:1rem 1.2rem;font-size:.9rem;text-align:center;line-height:1.65;}
  .msg-err{background:var(--err-bg);color:var(--err-t);border:1px solid rgba(139,30,30,.3);border-radius:8px;padding:.55rem .9rem;font-size:.82rem;}
  .list-wrap{max-width:900px;margin:0 auto 6rem;padding:0 2.5rem;}
  .list-h{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;text-align:center;margin-bottom:.4rem;}
  .list-sub{text-align:center;font-size:.72rem;color:var(--dim);letter-spacing:.1em;text-transform:uppercase;margin-bottom:1.4rem;}
  .sig-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.6rem;}
  .sig-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.75rem 1rem;
    display:flex;align-items:center;gap:.6rem;transition:border-color .2s,transform .2s;}
  .sig-card:hover{border-color:var(--border-h);transform:translateY(-1px);}
  .sig-card.new{border-color:var(--red);background:rgba(192,57,43,.08);animation:pulseRed 3s ease-out forwards;}
  .sig-dot{width:6px;height:6px;border-radius:50%;background:#52c483;flex-shrink:0;}
  .sig-dot.red{background:var(--red-l);}
  .sig-name{font-size:.88rem;font-weight:500;color:var(--cream);}
  .sig-country{font-size:.71rem;color:var(--dim);margin-top:.1rem;}
  footer{border-top:1px solid var(--border);text-align:center;padding:2rem;color:var(--dim);font-size:.7rem;letter-spacing:.06em;font-weight:300;}
`;
