import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card, FitText, Icon, Pill, Row, SectionHeader, Segmented, Sheet, Txt, YBranch } from '@/components/ui';
import { SpendingMap } from '@/components/SpendingMap';
import { AnswerCard } from '@/components/AnswerCard';
import { ChipRow } from '@/components/ChipRow';
import { askAnything, type Answer } from '@/lib/ask';
import { suggest } from '@/lib/suggestions';
import {
  addMonths, compare, figuresFor, monthKey, monthLabel, projection, sampleHistory, taxEntries,
  type CompareMode, type Scope,
} from '@/lib/money';
import { c, font, gbp } from '@/theme/tokens';

type Explain = null | 'income' | 'expenses' | 'left' | 'projection';

export function MoneyScreen() {
  const now = useMemo(() => new Date(), []);
  const hist = useMemo(() => sampleHistory(now), [now]);
  const [scope, setScope] = useState<Scope>('total');
  const [offset, setOffset] = useState(0); // months back, 0..36
  const [dir, setDir] = useState<'in' | 'out'>('out');
  const [mode, setMode] = useState<CompareMode>('year');
  const [explain, setExplain] = useState<Explain>(null);
  const [q, setQ] = useState('');
  const [chips, setChips] = useState(() => suggest(6, 'money'));
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [showMoved, setShowMoved] = useState(true);
  const [picker, setPicker] = useState(false);
  const [pYear, setPYear] = useState(now.getFullYear());

  const key = monthKey(addMonths(now, -offset));
  const isLive = offset === 0;
  const f = figuresFor(key, scope, hist, now);
  const proj = projection(scope, hist, now);
  const cmp = compare(scope, mode, hist, now);
  const prevF = offset < 36 ? figuresFor(monthKey(addMonths(now, -(offset + 1))), scope, hist, now) : null;
  const taxes = taxEntries();

  const runAsk = (text: string) => { setQ(text); setAnswer(askAnything(text, hist, undefined, now)); };

  const Figure = ({ value, onPress, tone }: { label: string; value: number; onPress: () => void; tone?: 'pos' | 'neg' }) => (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'flex-end' }}>
      <FitText max={19} style={{ fontFamily: font.sb, letterSpacing: -0.3, fontVariant: ['tabular-nums'], textAlign: 'right', color: tone === 'neg' && value < 0 ? c.orange : tone === 'pos' ? c.teal : c.text }}>{gbp(value)}</FitText>
    </Pressable>
  );

  return (
    <Screen>
      <Txt v="title">Money</Txt>
      <Txt v="small" style={{ marginTop: 2 }}>What comes in, what goes out, and what's left.</Txt>

      {/* Ask bar */}
      <View style={{ marginTop: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.borderHi, paddingLeft: 14, paddingRight: 6 }}>
        <YBranch size={22} />
        <TextInput
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => runAsk(q)}
          placeholder="Ask about your money or Y-WLTH"
          placeholderTextColor={c.muted}
          returnKeyType="send"
          style={{ flex: 1, color: c.text, fontFamily: font.r, fontSize: 15, paddingVertical: 14, paddingHorizontal: 10, outlineStyle: 'none' } as object}
        />
        <Pressable onPress={() => runAsk(q)} style={{ backgroundColor: c.teal, width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="send" size={18} color={c.navy} />
        </Pressable>
      </View>
      {!answer ? (
        <View style={{ marginTop: 12 }}><ChipRow chips={chips} onPick={runAsk} onShuffle={() => setChips(suggest(6, 'money'))} /></View>
      ) : (
        <View style={{ marginTop: 14 }}><AnswerCard a={answer} onClose={() => { setAnswer(null); setQ(''); }} /></View>
      )}

      {/* Scope + month */}
      <View style={{ marginTop: 22 }}>
        <Segmented<Scope> options={[{ k: 'total', label: 'Total' }, { k: 'property', label: 'Property' }, { k: 'investments', label: 'Investments' }]} value={scope} onChange={(s) => { setScope(s); }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
        <Pressable onPress={() => setOffset((o) => Math.min(36, o + 1))} hitSlop={12} style={{ opacity: offset >= 36 ? 0.3 : 1 }}><Icon name="back" size={22} color={c.textDim} /></Pressable>
        <Pressable onPress={() => { setPYear(addMonths(now, -offset).getFullYear()); setPicker(true); }} accessibilityLabel="Choose month and year" hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <Text style={{ fontFamily: font.sb, fontSize: 17, color: c.text }}>{monthLabel(key)}</Text>
          <View style={{ transform: [{ rotate: '90deg' }] }}><Icon name="chevron" size={14} color={c.teal} /></View>
        </Pressable>
        <Pressable onPress={() => setOffset((o) => Math.max(0, o - 1))} hitSlop={12} style={{ opacity: offset === 0 ? 0.3 : 1 }}><Icon name="chevron" size={22} color={c.textDim} /></Pressable>
      </View>
      <Txt v="small" style={{ textAlign: 'center', marginTop: 4 }}>
        {isLive ? `As at ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · recalculated on the 1st of every month` : 'As we saved it'}
      </Txt>

      {/* Headline card */}
      <Card style={{ marginTop: 16 }}>
        <Txt v="label">{monthLabel(key, true).toUpperCase()} · {isLive ? 'FROM YOUR ACCOUNTS' : 'AS WE SAVED IT'}</Txt>
        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          <View style={{ width: 76 }} />
          <Txt v="label" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>This month</Txt>
          <Txt v="label" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>{now.getFullYear()}</Txt>
        </View>
        {([
          ['Income', f.income, proj.income, 'income', undefined],
          ['Expenses', f.expenses, proj.expenses, 'expenses', undefined],
          ['Left over', f.left, proj.left, 'left', 'pos'],
        ] as const).map(([label, now1, projv, ex, tone], i) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: c.border, marginTop: i === 0 ? 8 : 0 }}>
            <Text style={{ width: 76, fontFamily: font.m, fontSize: 13.5, color: c.textDim }} numberOfLines={1}>{label}</Text>
            <Figure label={label} value={now1} tone={tone as 'pos' | undefined} onPress={() => setExplain(ex as Explain)} />
            <Figure label={label} value={projv} tone={tone as 'pos' | undefined} onPress={() => setExplain('projection')} />
          </View>
        ))}
        <Txt v="small" style={{ marginTop: 6 }}>Tap any figure to see the working. Something not right? Correct it where it comes from: your connected accounts, or the figures you've told us.</Txt>
      </Card>

      <View style={{ marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: 'rgba(1,208,210,0.06)', borderWidth: 1, borderColor: 'rgba(1,208,210,0.22)' }}>
        <Txt v="label" style={{ color: c.teal }}>Where these figures come from</Txt>
        <Txt v="small" style={{ marginTop: 6, color: c.textDim }}>
          This month's income and spending come from your connected accounts and the figures you have told us, including Y-WLTH's advice fee. The year-ahead figure is a projection at today's rates. Tax payments are left out and this screen does not work out tax owed, so for tax planning talk to your adviser. Tracked tax payments: {taxes.map((t) => t.name).join(', ')}, found in {taxes[0]?.where}.
        </Txt>
      </View>

      <SectionHeader title={dir === 'in' ? 'Where it comes from' : 'Where it goes'} />
      <SpendingMap f={f} prev={prevF} dir={dir} onDir={setDir} scope={scope} live={isLive} />

      {/* Compare */}
      <SectionHeader title="Compare with earlier" />
      <Segmented<CompareMode> options={[{ k: 'year', label: 'A year ago' }, { k: 'last', label: 'Last month' }, { k: '6m', label: '6 months' }]} value={mode} onChange={setMode} small />
      <Card style={{ marginTop: 12 }}>
        {cmp ? (
          <>
            <Txt v="small" style={{ marginBottom: 6 }}>Compared with {cmp.ref.label}</Txt>
            {cmp.rows.map((r, i) => (
              <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: i ? 0.5 : 0, borderTopColor: c.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.m, fontSize: 14.5, color: c.text }}>{r.label}</Text>
                  <Text style={{ fontFamily: font.r, fontSize: 12.5, color: c.muted, marginTop: 2 }}>{gbp(r.now)} a month</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontFamily: font.m, fontSize: 14.5, color: r.better ? c.teal : c.orange, fontVariant: ['tabular-nums'] }}>{gbp(r.delta, { sign: true })}</Text>
                  {r.pct !== null ? <Pill tone={r.better ? 'pos' : 'neg'}>{r.delta >= 0 ? '▲' : '▼'} {Math.abs(r.pct).toFixed(0)}%</Pill> : null}
                </View>
              </View>
            ))}
            <Pressable onPress={() => setShowMoved((s) => !s)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 0.5, borderTopColor: c.border }}>
              <Txt v="h2" style={{ fontSize: 15 }}>What changed most</Txt>
              <Text style={{ fontFamily: font.m, fontSize: 13, color: c.teal }}>{showMoved ? 'Hide' : 'Show'}</Text>
            </Pressable>
            {showMoved && cmp.moved.map((m) => (
              <View key={m.group} style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: font.m, fontSize: 14, color: c.textDim }}>{m.group}</Text>
                  <Text style={{ fontFamily: font.m, fontSize: 14, color: c.text, fontVariant: ['tabular-nums'] }}>{gbp(m.delta, { sign: true })}</Text>
                </View>
                <View style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3, marginTop: 6 }}>
                  <View style={{ width: `${Math.max(4, m.share)}%`, height: 5, borderRadius: 3, backgroundColor: c.violet }} />
                </View>
                <Text style={{ fontFamily: font.r, fontSize: 11.5, color: c.muted, marginTop: 3 }}>{m.share.toFixed(0)}% of the change</Text>
              </View>
            ))}
          </>
        ) : (
          <Txt v="body">Nothing was saved for that month yet. Pick another comparison.</Txt>
        )}
      </Card>

      <Sheet visible={picker} onClose={() => setPicker(false)} title="Choose a month">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Pressable accessibilityLabel="Previous year" onPress={() => setPYear(pYear - 1)} disabled={pYear <= now.getFullYear() - 3} hitSlop={10} style={{ opacity: pYear <= now.getFullYear() - 3 ? 0.25 : 1 }}><Icon name="back" size={22} color={c.text} /></Pressable>
          <Text style={{ fontFamily: font.b, fontSize: 22, color: c.text }}>{pYear}</Text>
          <Pressable accessibilityLabel="Next year" onPress={() => setPYear(pYear + 1)} disabled={pYear >= now.getFullYear()} hitSlop={10} style={{ opacity: pYear >= now.getFullYear() ? 0.25 : 1 }}><Icon name="chevron" size={22} color={c.text} /></Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
          {Array.from({ length: 12 }, (_, m) => {
            const off = (now.getFullYear() * 12 + now.getMonth()) - (pYear * 12 + m);
            const ok = off >= 0 && off <= 36;
            const sel = off === offset;
            const thisMonth = off === 0;
            return (
              <View key={m} style={{ width: '33.33%', padding: 4 }}>
                <Pressable disabled={!ok} onPress={() => { setOffset(off); setPicker(false); }} style={{ height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? c.teal : ok ? 'rgba(255,255,255,0.06)' : 'transparent', borderWidth: thisMonth && !sel ? 1 : 0, borderColor: 'rgba(1,208,210,0.5)' }}>
                  <Text style={{ fontFamily: sel ? font.b : font.m, fontSize: 15, color: sel ? c.navy : ok ? c.text : 'rgba(255,255,255,0.22)' }}>{new Date(2000, m, 1).toLocaleDateString('en-GB', { month: 'short' })}</Text>
                  {thisMonth && <Text style={{ fontFamily: font.r, fontSize: 9.5, color: sel ? c.navy : c.teal, marginTop: 1 }}>this month</Text>}
                </Pressable>
              </View>
            );
          })}
        </View>
        <Pressable onPress={() => { setOffset(0); setPicker(false); }} style={{ marginTop: 14, alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(1,208,210,0.45)' }}>
          <Text style={{ fontFamily: font.sb, fontSize: 14.5, color: c.teal }}>Jump to this month</Text>
        </Pressable>
        <Txt v="small" style={{ marginTop: 10, textAlign: 'center' }}>You can look back up to three years. Past months show what we saved.</Txt>
      </Sheet>

      <Sheet visible={explain !== null} onClose={() => setExplain(null)} title={explain === 'projection' ? `How ${now.getFullYear()} is projected` : explain === 'left' ? 'How left over is worked out' : "How it's calculated"}>
        {explain === 'income' || explain === 'expenses' ? (
          <>
            {f.lines.filter((l) => l.kind === (explain === 'income' ? 'income' : 'cost')).map((l, i, arr) => (
              <Row key={l.id} left={l.name} sub={l.from} right={gbp(l.value)} last={i === arr.length - 1} />
            ))}
            {!isLive && <Txt v="small" style={{ marginTop: 10 }}>This is a saved month: individual lines were not kept, only totals.</Txt>}
            {isLive && <Txt v="small" style={{ marginTop: 10 }}>Weekly × 52 ÷ 12, quarterly ÷ 3, yearly ÷ 12. Income that varies, like dividends, uses the average of the last three months.</Txt>}
          </>
        ) : explain === 'left' ? (
          <>
            <Row left="Income" right={gbp(f.income)} />
            <Row left="Minus expenses" right={gbp(f.expenses)} />
            <Row left="Left over" right={gbp(f.left)} last />
          </>
        ) : explain === 'projection' ? (
          <>
            <Txt v="body">
              Projected left over = ({gbp(proj.gone.income - proj.gone.expenses)} for the {proj.gone.months} months already gone + {gbp(proj.rest.income - proj.rest.expenses)} for this month and the {proj.rest.months - 1} to come).
            </Txt>
            <View style={{ marginTop: 10 }}>
              <Row left="Projected income" right={gbp(proj.income)} />
              <Row left="Projected expenses" right={gbp(proj.expenses)} />
              <Row left="Left over" right={gbp(proj.left)} />
              <Row left="Year to date" right={gbp(proj.ytdLeft)} last />
            </View>
            <Txt v="small" style={{ marginTop: 10 }}>Past months are as we saved them. This month and the rest of the year use today's figures.</Txt>
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}
