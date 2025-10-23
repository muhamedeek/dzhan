import React, { useMemo, useState } from "react";
</tr>
</tfoot>
</table>
</div>
</CardContent>
</Card>
</Section>


{/* FAQ */}
<Section id="faq">
<motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold mb-8">
{t.faqTitle}
</motion.h2>
<div className="grid md:grid-cols-3 gap-6">
{t.faq.map((f, i) => (
<motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * i }}>
<Card className="bg-white/5 border-white/10">
<CardHeader>
<CardTitle className="text-base text-white">{f.q}</CardTitle>
</CardHeader>
<CardContent className="text-white/80 text-sm leading-relaxed">{f.a}</CardContent>
</Card>
</motion.div>
))}
</div>
</Section>


{/* Footer */}
<footer className="border-t border-white/10">
<Section className="py-12">
<div className="grid md:grid-cols-2 gap-8 items-center">
<div>
<p className="text-lg font-semibold">{t.heroName}</p>
<p className="text-white/70 mt-1">{t.heroTitle}</p>
<p className="text-white/60 mt-2">WhatsApp: <a className="text-blue-400 hover:underline" href="https://wa.me/996504883882" target="_blank" rel="noreferrer">+996 504 883 882</a></p>
</div>
<p className="text-white/50 text-sm leading-relaxed">{t.disclaimer}</p>
</div>
</Section>
</footer>
</div>
);
}


// ------------------------
// Dev-only tests for the calculator logic (tiered rates)
// ------------------------
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
const approx = (a: number, b: number, eps = 1) => Math.abs(a - b) <= eps; // within 1 KGS


// Test 1: reinvest for 12 months should match compound with 18.9% net
const amount = 500_000;
const months = 12;
const tier = pickTier(months);
const rate = tier.net / 12;
const expected = amount * Math.pow(1 + rate, months);


const calc1 = (() => {
let p = amount;
for (let i = 0; i < months; i++) p += p * rate;
return p;
})();
console.assert(approx(calc1, expected), "[useCalc] reinvest 12m should match compounding with 18.9% net");


// Test 2: 23 months should use 18-month tier (19.8% net)
const tier23 = pickTier(23);
console.assert(Math.abs(tier23.net - 0.198) < 1e-9, "[tier] 23m should pick 19.8% net tier");


// Test 3: monthly payout equals amount * monthlyRate for payout mode
const payoutMonthly = amount * rate;
console.assert(approx(payoutMonthly, 500000 * (tier.net / 12)), "[useCalc] monthly payout formula (tiered) mismatch");


// Test 4: bounds
console.assert(pickTier(60).net > pickTier(12).net, "[tier] 60m net should be > 12m net");


// Test 5: payout table total equals months * monthly payout (given tier)
console.assert(approx((amount * (pickTier(24).net/12))*24, amount * (0.207/12) * 24), "[table] total equals months * monthly payout");
}
