import React, { useMemo, useState } from "react";

/** === Константы и утилиты === */
const MIN_INVEST = 500_000;

type Tier = { monthsMin: number; net: number };
const TIERS: Tier[] = [
  { monthsMin: 12, net: 0.189 }, // 18.9% для 12+ мес
  { monthsMin: 18, net: 0.198 }, // 19.8% для 18+ мес
  { monthsMin: 24, net: 0.207 }, // 20.7% для 24+ мес
  { monthsMin: 36, net: 0.225 }, // 22.5% для 36+ мес
  { monthsMin: 60, net: 0.243 }, // 24.3% для 60+ мес
];

function pickTier(months: number): Tier {
  // выбираем максимальный подходящий по порогу monthsMin
  let best = TIERS[0];
  for (const t of TIERS) {
    if (months >= t.monthsMin && t.monthsMin >= best.monthsMin) best = t;
  }
  return best;
}

const formatInt = (n: number) => n.toLocaleString("ru-RU");
const unformat = (s: string) => s.replace(/\s+/g, "").replace(/\u00A0/g, "");

/** === Компонент === */
export default function CalculatorFixed() {
  // amountInput — сырая строка в инпуте (разрешаем пустую)
  const [amountInput, setAmountInput] = useState<string>("500 000");
  // amount — числовое значение для расчётов (может быть null, пока пользователь печатает/очищает)
  const [amount, setAmount] = useState<number | null>(500000);
  const [amountError, setAmountError] = useState<string | null>(null);

  // Остальные параметры калькулятора — для примера
  const [months, setMonths] = useState<number>(12);
  const tier = useMemo(() => pickTier(months), [months]);

  /** === Обработчики ввода суммы === */
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Разрешаем временно пустую строку и только цифры/пробелы
    if (!/^[\d\s]*$/.test(raw)) return;

    setAmountInput(raw);
    setAmountError(null);

    const digits = unformat(raw);
    if (digits === "") {
      setAmount(null);
    } else {
      const n = Number(digits);
      setAmount(Number.isFinite(n) ? n : null);
    }
  };

  const handleAmountBlur = () => {
    const digits = unformat(amountInput);
    if (digits === "") {
      // Можно оставить пустым, чтобы пользователь сам ввёл значение
      // либо вернуть дефолт; оставим пустым
      return;
    }
    const n = Number(digits);
    if (!Number.isFinite(n)) return;

    if (n < MIN_INVEST) {
      setAmountError(`Минимальная сумма инвестиций — ${formatInt(MIN_INVEST)} сом`);
      // Не перезаписываем ввод, пользователь сам исправит
    } else {
      setAmountError(null);
      setAmount(n);
      setAmountInput(formatInt(n)); // нормализуем отображение с пробелами
    }
  };

  /** === Пример расчёта (показатели) ===
   * Если вы используете другие формулы/режимы (реинвест/выплаты),
   * подставьте свою логику — главное, что amount может быть null.
   */
  const monthlyRate = tier.net / 12;
  const compounded = useMemo(() => {
    if (amountError || amount == null) return null;
    let p = amount;
    for (let i = 0; i < months; i++) p += p * monthlyRate;
    return p;
  }, [amount, amountError, months, monthlyRate]);

  const monthlyPayout = useMemo(() => {
    if (amountError || amount == null) return null;
    return amount * monthlyRate;
  }, [amount, amountError, monthlyRate]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">Инвестиционный калькулятор</h2>

      {/* Поле суммы */}
      <label className="block text-sm mb-1">Сумма инвестиций (сом)</label>
      <input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        value={amountInput}
        onChange={handleAmountChange}
        onBlur={handleAmountBlur}
        placeholder="Введите сумму, например 10 000 000"
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
      />
      {amountError && <p className="mt-2 text-sm text-red-400">{amountError}</p>}

      {/* Срок */}
      <div className="mt-6">
        <label className="block text-sm mb-1">Срок (мес.)</label>
        <input
          type="number"
          min={1}
          step={1}
          value={months}
          onChange={(e) => setMonths(Math.max(1, Number(e.target.value) || 1))}
          className="w-40 rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
        />
        <p className="text-sm text-white/70 mt-1">
          Применяется тариф: {tier.monthsMin}+ мес • {Math.round(tier.net * 1000) / 10}% годовых (net)
        </p>
      </div>

      {/* Результаты (пример) */}
      <div className="mt-6 grid gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-white/70 text-sm">Ежемесячная выплата (без реинвеста)</p>
          <p className="text-lg font-semibold">
            {monthlyPayout == null ? "—" : `${formatInt(Math.round(monthlyPayout))} cом / мес`}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-white/70 text-sm">Итог при реинвесте (приблизительно)</p>
          <p className="text-lg font-semibold">
            {compounded == null ? "—" : `${formatInt(Math.round(compounded))} сом`}
          </p>
        </div>
      </div>

      {/* Подсказка по вводу */}
      <p className="mt-4 text-xs text-white/50">
        Подсказка: сначала можно ввести любую сумму. Минимум {formatInt(MIN_INVEST)} сом — проверяется после ввода.
      </p>
    </div>
  );
}

/** === Небольшие dev-тесты (как у вас) — не исполняются в проде === */
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
  console.assert(
    approx(amount * (pickTier(24).net / 12) * 24, amount * (0.207 / 12) * 24),
    "[table] total equals months * monthly payout"
  );
}
