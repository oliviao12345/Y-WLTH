import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Icon, YBranch } from '@/components/ui';
import { FAQ, FAQ_CATS, type Faq } from '@/data/faq';
import { searchDocs, tokens } from '@/lib/search';
import { c, font } from '@/theme/tokens';

/** Searchable FAQ accordion, shared by the app (Profile) and the website. */
function Answer({ f, onAsk }: { f: Faq; onAsk?: (q?: string) => void }) {
  return (
    <View style={{ gap: 12 }}>
      {f.a.split('\n\n').map((para, i) => (
        <Text key={i} style={{ fontFamily: font.r, fontSize: 15.5, lineHeight: 25, color: c.textDim }}>{para}</Text>
      ))}
      {f.steps?.map((st, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: font.sb, fontSize: 12, color: c.teal }}>{i + 1}</Text></View>
          <Text style={{ flex: 1, fontFamily: font.r, fontSize: 15, lineHeight: 23, color: c.textDim }}>{st}</Text>
        </View>
      ))}
      {onAsk && (
        <Pressable onPress={() => onAsk()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Icon name="chat" size={15} color={c.teal} />
          <Text style={{ fontFamily: font.m, fontSize: 13.5, color: c.teal }}>Still unsure? Ask your adviser</Text>
        </Pressable>
      )}
    </View>
  );
}

export function FaqList({ wide, onAsk, initialQuery, initialOpen, topOnly }: { wide?: boolean; onAsk?: (q?: string) => void; initialQuery?: string; initialOpen?: string; topOnly?: number }) {
  const [cat, setCat] = useState<'All' | Faq['cat']>('All');
  const [q, setQ] = useState(initialQuery ?? '');
  const [open, setOpen] = useState<string | null>(initialOpen ?? (topOnly ? null : FAQ[0].q));
  React.useEffect(() => { if (initialOpen) { setCat('All'); setOpen(initialOpen); setQ(topOnly && !FAQ.slice(0, topOnly).some((f) => f.q === initialOpen) ? initialOpen : ''); } }, [initialOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { if (initialQuery !== undefined) setQ(initialQuery); }, [initialQuery]);
  const base = useMemo(() => FAQ.filter((f) => cat === 'All' || f.cat === cat), [cat]);
  const searching = q.trim().length > 0 && tokens(q).length > 0;
  const hits = useMemo(() => (searching ? searchDocs(base.map((f) => ({ ...f, id: f.q })), q) : []), [base, q, searching]);
  // One clear answer first, then only the closest few related questions.
  const best = hits[0];
  const related = best ? hits.slice(1).filter((h) => h.score >= best.score * 0.55).slice(0, 3) : [];
  // topOnly: browsing shows just the first few; the rest stay searchable and surface when a question matches.
  // A deep link to a question outside the top few surfaces it through search, like any other relevant answer.
  const list = topOnly ? base.slice(0, topOnly) : base;

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.borderHi, paddingHorizontal: 14 }}>
        <YBranch size={20} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search, e.g. fees, tax, Y-WLTH" placeholderTextColor={c.muted} style={{ flex: 1, color: c.text, fontFamily: font.r, fontSize: 15, paddingVertical: 13, paddingHorizontal: 10, outlineStyle: 'none' } as object} />
        {q ? <Pressable onPress={() => setQ('')} hitSlop={10}><Icon name="close" size={18} color={c.muted} /></Pressable> : null}
      </View>
      {!topOnly && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['All', ...FAQ_CATS] as const).map((k) => (
          <Pressable key={k} onPress={() => setCat(k)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: cat === k ? c.teal : 'transparent', borderWidth: 1, borderColor: cat === k ? c.teal : c.borderHi }}>
            <Text style={{ fontFamily: font.m, fontSize: 13, color: cat === k ? c.navy : c.textDim }}>{k}</Text>
          </Pressable>
        ))}
      </View>}
      {searching && best && (
        <View style={{ gap: 14 }}>
          <View style={{ padding: wide ? 28 : 20, borderRadius: 26, backgroundColor: 'rgba(1,208,210,0.07)', borderWidth: 1, borderColor: 'rgba(1,208,210,0.45)', gap: 14 }}>
            <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.3, color: c.teal, textTransform: 'uppercase' }}>Best answer</Text>
            <Text style={{ fontFamily: font.sb, fontSize: wide ? 26 : 21, lineHeight: wide ? 33 : 28, letterSpacing: -0.5, color: c.text }}>{(best.doc as Faq).q}</Text>
            <Answer f={best.doc as Faq} onAsk={onAsk} />
          </View>
          {related.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: font.m, fontSize: 11.5, letterSpacing: 1.3, color: c.muted, textTransform: 'uppercase', marginTop: 4 }}>You might also want to know</Text>
              {related.map((h) => (
                <Pressable key={(h.doc as Faq).q} onPress={() => setQ((h.doc as Faq).q)} style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 15, borderRadius: 16, backgroundColor: hovered ? 'rgba(255,255,255,0.06)' : c.card, borderWidth: 1, borderColor: c.border })}>
                  <Text style={{ flex: 1, fontFamily: font.m, fontSize: 15, lineHeight: 21, color: c.text }}>{(h.doc as Faq).q}</Text>
                  <Icon name="chevron" size={16} color={c.muted} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
      {!searching && (
      <View style={wide ? { gap: 10, flexDirection: 'row', flexWrap: 'wrap' } : { gap: 10, alignSelf: 'stretch' }}>
        {list.map((f) => {
          const on = open === f.q;
          return (
            <View key={f.q} style={{ width: wide ? '48.8%' : '100%', alignSelf: 'flex-start', borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: on ? 'rgba(1,208,210,0.45)' : c.border, overflow: 'hidden' }}>
              <Pressable onPress={() => setOpen(on ? null : f.q)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 }}>
                <Text style={{ flex: 1, fontFamily: font.sb, fontSize: 15.5, lineHeight: 22, color: c.text }}>{f.q}</Text>
                <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: font.m, fontSize: 18, color: c.textDim, marginTop: -2 }}>{on ? '–' : '+'}</Text>
                </View>
              </Pressable>
              {on && (
                <View style={{ paddingHorizontal: 18, paddingBottom: 18, gap: 10 }}>
                  {f.a.split('\n\n').map((para, i) => (
                    <Text key={i} style={{ fontFamily: font.r, fontSize: 14.5, lineHeight: 23, color: c.textDim }}>{para}</Text>
                  ))}
                  {f.steps?.map((s, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.tealSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: font.sb, fontSize: 12, color: c.teal }}>{i + 1}</Text></View>
                      <Text style={{ flex: 1, fontFamily: font.r, fontSize: 14.5, lineHeight: 22, color: c.textDim }}>{s}</Text>
                    </View>
                  ))}
                  {onAsk && (
                    <Pressable onPress={() => onAsk()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Icon name="chat" size={15} color={c.teal} />
                      <Text style={{ fontFamily: font.m, fontSize: 13.5, color: c.teal }}>Still unsure? Ask your adviser</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          );
        })}
        {topOnly && onAsk && <Text style={{ fontFamily: font.r, fontSize: 13, lineHeight: 19, color: c.muted, textAlign: 'center', marginTop: 4 }}>Can't see yours? Search above and we'll find the answer, or ask your adviser.</Text>}
      </View>
      )}
      {searching && !best && (
      <View style={{ alignSelf: 'stretch' }}>
        {true && (
          <View style={{ alignSelf: 'stretch', width: '100%', gap: 10, padding: 18, borderRadius: 18, backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}>
            <Text style={{ fontFamily: font.sb, fontSize: 15.5, color: c.text }}>No matching question</Text>
            <Text style={{ fontFamily: font.r, fontSize: 14, lineHeight: 21, color: c.textDim }}>Try different words, or put it to your adviser team.</Text>
            {onAsk && (
              <Pressable onPress={() => onAsk(q.trim())} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.teal, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
                <Icon name="chat" size={15} color={c.navy} /><Text style={{ fontFamily: font.sb, fontSize: 13.5, color: c.navy }}>Ask your adviser</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
      )}
    </View>
  );
}
