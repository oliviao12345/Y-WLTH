import React from 'react';
import { EmbeddedCtx, Screen } from '@/components/Screen';
import { ForecastCard } from '@/components/ForecastCard';
import { Txt } from '@/components/ui';
import { useStore } from '@/lib/store';

/** A "what if" playground: your wealth to age 100, with stress tests you can switch on and off. */
export function ForecastScreen() {
  const { profile, setProfile } = useStore();
  const embedded = React.useContext(EmbeddedCtx);
  return (
    <Screen back={!embedded}>
      <Txt v="title">Financial Forecast Simulator</Txt>
      <Txt v="small" style={{ marginTop: 2, marginBottom: 16 }}>Play with your age and retirement age, then switch the stress tests on and off to see how your wealth holds up to age 100.</Txt>
      <ForecastCard profile={profile} setProfile={setProfile} />
    </Screen>
  );
}
