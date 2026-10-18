import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Chip } from '@/components/ui';
import { roomsOf } from '@/lib/plantContext';
import { usePlants } from '@/lib/store';
import { colors, radius, space } from '@/lib/theme';

/**
 * Pick an existing room or type a new one. Typed text is reported on every keystroke when `live`
 * (forms saved later), otherwise when the field loses focus (screens that save immediately).
 */
export function RoomPicker({ value, onChange, live }: { value?: string; onChange: (room: string | undefined) => void; live?: boolean }) {
  const { plants } = usePlants();
  const rooms = roomsOf(plants);
  const [text, setText] = useState(value ?? '');

  const choose = (room: string | undefined) => {
    setText(room ?? '');
    onChange(room);
  };

  return (
    <View style={{ gap: space(2) }}>
      {rooms.length > 0 && (
        <View style={styles.chips}>
          {rooms.map((r) => (
            <Chip key={r} label={r} selected={value === r} onPress={() => choose(value === r ? undefined : r)} />
          ))}
        </View>
      )}
      <TextInput
        value={text}
        onChangeText={(t) => {
          setText(t);
          if (live) onChange(t.trim() || undefined);
        }}
        onBlur={() => !live && (text.trim() || undefined) !== value && onChange(text.trim() || undefined)}
        placeholder={rooms.length ? 'Or type a new room' : 'e.g. Living room, Bedroom, Balcony'}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space(3), fontSize: 16, color: colors.text, backgroundColor: colors.card },
});
